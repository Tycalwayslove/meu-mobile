// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { createElement, createRef } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SideNav } from "./SideNav";
import type { SideNavProps } from "./types";

type SideNavChangeEvent = Parameters<NonNullable<SideNavProps["onChange"]>>[1];

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];
const containers: HTMLElement[] = [];

afterEach(async () => {
  await act(() => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  for (const container of containers.splice(0)) container.remove();
  vi.restoreAllMocks();
});

describe("SideNav hydration", () => {
  it("hydrates stable native navigation identities and keeps routing interactive", async () => {
    const ref = createRef<HTMLDivElement>();
    const onChange = vi.fn((_key: string, event: SideNavChangeEvent) => event.preventDefault());
    const element = createElement(SideNav, {
      "aria-label": "商品分类",
      defaultValue: "all",
      items: [
        { key: "all", label: "全部", href: "/categories" },
        { key: "food", label: "食品", href: "/categories/food" },
        { key: "disabled", label: "停用", href: "/disabled", disabled: true }
      ],
      onChange,
      ref,
      sticky: true,
      stickyOffset: 56
    });
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    containers.push(container);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const recoverableErrors: unknown[] = [];
    const serverFoodLink = container.querySelector<HTMLAnchorElement>('[data-side-nav-key="food"]');
    const serverDisabledLink = container.querySelector<HTMLAnchorElement>(
      '[data-side-nav-key="disabled"]'
    );

    expect(serverFoodLink && serverFoodLink.getAttribute("href")).toBe("/categories/food");
    expect(serverDisabledLink && serverDisabledLink.getAttribute("role")).toBe("link");
    expect(serverDisabledLink && serverDisabledLink.hasAttribute("href")).toBe(false);

    await act(async () => {
      mountedRoots.push(
        hydrateRoot(container, element, {
          onRecoverableError: (error) => recoverableErrors.push(error)
        })
      );
      await Promise.resolve();
    });

    const hydratedFoodLink = container.querySelector<HTMLAnchorElement>(
      '[data-side-nav-key="food"]'
    );
    expect(hydratedFoodLink).toBe(serverFoodLink);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current && ref.current.getAttribute("data-sticky")).toBe("true");
    expect(hydratedFoodLink && fireEvent.click(hydratedFoodLink)).toBe(false);
    expect(hydratedFoodLink && hydratedFoodLink.getAttribute("aria-current")).toBe("page");
    expect(onChange).toHaveBeenCalledWith("food", expect.anything());
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("hydrates deterministic vertical-tab relationships and keyboard activation", async () => {
    const onChange = vi.fn();
    const element = createElement(SideNav, {
      activationMode: "manual",
      defaultValue: "a",
      items: [
        { key: "a", label: "甲", content: "甲内容" },
        { key: "b", label: "乙", content: "乙内容" }
      ],
      onChange
    });
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    containers.push(container);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const recoverableErrors: unknown[] = [];
    const serverFirstTab = container.querySelector<HTMLButtonElement>('[data-side-nav-key="a"]');

    await act(async () => {
      mountedRoots.push(
        hydrateRoot(container, element, {
          onRecoverableError: (error) => recoverableErrors.push(error)
        })
      );
      await Promise.resolve();
    });

    const firstTab = container.querySelector<HTMLButtonElement>('[data-side-nav-key="a"]');
    const secondTab = container.querySelector<HTMLButtonElement>('[data-side-nav-key="b"]');
    expect(firstTab).toBe(serverFirstTab);
    await act(async () => {
      if (firstTab) firstTab.focus();
      await Promise.resolve();
    });
    fireEvent.keyDown(firstTab!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(secondTab);
    expect(secondTab && secondTab.getAttribute("aria-selected")).toBe("false");
    fireEvent.keyDown(secondTab!, { key: "Enter" });
    expect(secondTab && secondTab.getAttribute("aria-selected")).toBe("true");
    expect(onChange).toHaveBeenCalledWith("b", expect.anything());
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
