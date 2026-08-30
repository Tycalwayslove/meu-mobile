// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Cell } from "./Cell";
import { List } from "./List";

const roots: Array<ReturnType<typeof hydrateRoot>> = [];
const containers: HTMLElement[] = [];

afterEach(async () => {
  await act(() => {
    for (const root of roots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  for (const container of containers.splice(0)) container.remove();
  vi.restoreAllMocks();
});

describe("List hydration", () => {
  it("hydrates a named empty list and preserves its semantic root while rows arrive", async () => {
    const emptyElement = createElement(List, { "aria-label": "动态订单" });
    const container = document.createElement("div");
    container.innerHTML = renderToString(emptyElement);
    document.body.append(container);
    containers.push(container);
    const serverList = container.querySelector<HTMLElement>("[role='list']");
    expect(serverList).toBeTruthy();
    expect(serverList ? serverList.children : []).toHaveLength(0);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const recoverableErrors: unknown[] = [];

    const root = hydrateRoot(container, emptyElement, {
      onRecoverableError: (error) => recoverableErrors.push(error)
    });
    roots.push(root);
    await act(() => Promise.resolve());
    expect(container.querySelector("[role='list']")).toBe(serverList);
    expect(consoleError).not.toHaveBeenCalled();
    expect(recoverableErrors).toEqual([]);

    const populatedElement = createElement(
      List,
      { "aria-label": "动态订单" },
      createElement(Cell, { key: "summary", title: "订单摘要" }),
      createElement(Cell, { href: "/orders/1", key: "details", title: "订单详情" }),
      createElement(Cell, { key: "pay", onClick: () => undefined, title: "支付订单" })
    );
    await act(() => {
      root.render(populatedElement);
      return Promise.resolve();
    });
    expect(container.querySelector("[role='list']")).toBe(serverList);
    expect(serverList ? serverList.querySelectorAll("[role='listitem']") : []).toHaveLength(3);
    expect(serverList ? serverList.querySelector("a[href='/orders/1']") : null).toBeTruthy();
    expect(serverList ? serverList.querySelector("button[type='button']") : null).toBeTruthy();
  });

  it("preserves generated naming and restores a loading Cell after hydration", async () => {
    const onClick = vi.fn();
    const serverElement = createElement(
      List,
      { header: "订单操作", footer: "操作会同步到当前账号" },
      createElement(Cell, {
        key: "pay",
        loading: true,
        loadingLabel: "正在提交订单",
        onClick,
        title: "支付订单"
      }),
      createElement(Cell, {
        href: "/orders/1",
        key: "details",
        loading: true,
        loadingLabel: "正在打开订单",
        title: "订单详情"
      })
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(serverElement);
    document.body.append(container);
    containers.push(container);
    const serverList = container.querySelector<HTMLElement>("[role='list']");
    const serverLabelledBy = serverList ? serverList.getAttribute("aria-labelledby") : null;
    expect(serverLabelledBy).toBeTruthy();
    if (!serverLabelledBy) throw new Error("Expected the server list to be labelled");
    const serverHeader = document.getElementById(serverLabelledBy);
    expect(serverHeader ? serverHeader.textContent : null).toBe("订单操作");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const recoverableErrors: unknown[] = [];
    const serverLink = container.querySelector<HTMLAnchorElement>("a[role='link']");
    expect(serverLink ? serverLink.hasAttribute("href") : undefined).toBe(false);

    const root = hydrateRoot(container, serverElement, {
      onRecoverableError: (error) => recoverableErrors.push(error)
    });
    roots.push(root);
    await act(() => Promise.resolve());
    const hydratedList = container.querySelector("[role='list']");
    expect(hydratedList ? hydratedList.getAttribute("aria-labelledby") : null).toBe(
      serverLabelledBy
    );
    expect(consoleError).not.toHaveBeenCalled();
    expect(recoverableErrors).toEqual([]);

    const readyElement = createElement(
      List,
      { header: "订单操作", footer: "操作会同步到当前账号" },
      createElement(Cell, { key: "pay", onClick, title: "支付订单" }),
      createElement(Cell, { href: "/orders/1", key: "details", title: "订单详情" })
    );
    await act(() => {
      root.render(readyElement);
      return Promise.resolve();
    });
    const button = container.querySelector<HTMLButtonElement>("button");
    expect(button ? button.disabled : undefined).toBe(false);
    expect(button ? button.getAttribute("aria-busy") : undefined).toBeNull();
    const readyLink = container.querySelector<HTMLAnchorElement>('a[href="/orders/1"]');
    expect(readyLink).toBe(serverLink);
    expect(container.querySelectorAll("[role='status']")).toHaveLength(0);
    if (!button) throw new Error("Expected a hydrated action Cell");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
