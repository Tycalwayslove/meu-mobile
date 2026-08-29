// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TabBar } from "./TabBar";

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

describe("TabBar hydration", () => {
  it("hydrates deterministic state without mismatch and keeps button routing interactive", async () => {
    const onChange = vi.fn();
    const element = createElement(TabBar, {
      defaultValue: "home",
      items: [
        { key: "home", label: "首页", icon: "H", href: "/" },
        { key: "orders", label: "订单", icon: "O", badge: 3, badgeLabel: "3 个待处理订单" },
        { key: "locked", label: "锁定", icon: "L", href: "/locked", disabled: true }
      ],
      onChange,
      safeArea: true
    });
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    containers.push(container);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const recoverableErrors: unknown[] = [];
    const serverDisabledLink = container.querySelector<HTMLAnchorElement>(
      '[data-tab-bar-key="locked"]'
    );
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

    const orders = container.querySelector<HTMLButtonElement>('[data-tab-bar-key="orders"]');
    fireEvent.click(orders!);
    await act(() => Promise.resolve());

    expect(orders && orders.getAttribute("aria-current")).toBe("page");
    expect(serverDisabledLink && serverDisabledLink.hasAttribute("href")).toBe(false);
    expect(onChange).toHaveBeenCalledWith("orders", expect.anything());
    expect(container.querySelector('[data-meu-component="safe-area"]')).not.toBeNull();
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
