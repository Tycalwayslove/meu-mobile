// @vitest-environment jsdom
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { VirtualList } from "./VirtualList";

const entries = Array.from({ length: 1_000 }, (_, index) => ({
  id: `entry-${index}`,
  label: index === 0 ? "A deliberately long localized first row label" : `Order ${index + 1}`
}));
const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];

function scenario() {
  return (
    <ConfigProvider dir="rtl" locale="en-US" motion="reduced" theme="dark">
      <VirtualList
        aria-label="Hydrated orders"
        estimateSize={56}
        getItemKey={(entry) => entry.id}
        height={224}
        initialOffset={56 * 40}
        items={entries}
        overscan={2}
        renderItem={(entry) => <button type="button">{entry.label}</button>}
      />
    </ConfigProvider>
  );
}

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (
    this: HTMLElement
  ) {
    return this.hasAttribute("data-meu-virtual-index") ? 56 : 224;
  });
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(390);
  vi.stubGlobal(
    "ResizeObserver",
    class MockResizeObserver {
      readonly callback: ResizeObserverCallback;

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
      }

      observe(target: Element) {
        const contentRect = target.getBoundingClientRect();
        this.callback([{ contentRect, target } as ResizeObserverEntry], this);
      }
      disconnect() {}
      unobserve() {}
    }
  );
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement
  ) {
    const height = this.hasAttribute("data-meu-virtual-index") ? 56 : 224;
    return {
      bottom: height,
      height,
      left: 0,
      right: 390,
      top: 0,
      width: 390,
      x: 0,
      y: 0,
      toJSON: () => ({})
    };
  });
});

afterEach(async () => {
  await act(async () => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    await Promise.resolve();
  });
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("VirtualList hydration", () => {
  it("hydrates the same bounded middle window with RTL and full collection semantics", async () => {
    const ui = scenario();
    const container = document.createElement("div");
    container.innerHTML = renderToString(ui);
    document.body.append(container);

    const serverList = container.querySelector<HTMLElement>('[data-meu-component="virtual-list"]');
    if (!serverList) throw new Error("Expected server VirtualList");
    const serverRows = serverList.querySelectorAll('[role="listitem"]');
    expect(serverRows.length).toBeGreaterThan(0);
    expect(serverRows.length).toBeLessThan(20);
    expect(serverList.closest('[dir="rtl"]')).toBeTruthy();
    expect(serverList.querySelector('[data-meu-virtual-index="40"]')).toBeTruthy();

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const recoverableErrors: unknown[] = [];
    await act(async () => {
      mountedRoots.push(
        hydrateRoot(container, ui, {
          onRecoverableError: (error) => recoverableErrors.push(error)
        })
      );
      await new Promise((resolve) => window.setTimeout(resolve, 20));
    });

    const hydratedList = container.querySelector<HTMLElement>(
      '[data-meu-component="virtual-list"]'
    );
    if (!hydratedList) throw new Error("Expected hydrated VirtualList");
    expect(hydratedList).toBe(serverList);
    expect(hydratedList.getAttribute("role")).toBe("list");
    const hydratedRows = hydratedList.querySelectorAll('[role="listitem"]');
    expect(hydratedRows.length).toBeGreaterThan(0);
    expect(hydratedRows.length).toBeLessThan(20);
    expect(hydratedRows.item(0).getAttribute("aria-setsize")).toBe("1000");
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
