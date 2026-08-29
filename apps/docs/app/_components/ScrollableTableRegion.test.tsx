// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ScrollableTableRegion, isHorizontallyOverflowing } from "./ScrollableTableRegion";

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

describe("ScrollableTableRegion", () => {
  it("detects horizontal overflow from the rendered dimensions", () => {
    expect(isHorizontallyOverflowing({ clientWidth: 100, scrollWidth: 101 })).toBe(true);
    expect(isHorizontallyOverflowing({ clientWidth: 100, scrollWidth: 100 })).toBe(false);
    expect(isHorizontallyOverflowing(null)).toBe(false);
  });

  it("is focusable only while its table overflows horizontally", () => {
    const resizeCallbacks: ResizeObserverCallback[] = [];
    const disconnect = vi.fn();
    const observe = vi.fn();
    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeCallbacks.push(callback);
      }

      disconnect = disconnect;
      observe = observe;
      unobserve = vi.fn();
    }
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;

    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    act(() => {
      root.render(
        <ScrollableTableRegion ariaLabel="Props 表格，可横向滚动">
          <table />
        </ScrollableTableRegion>
      );
    });
    const region = host.firstElementChild as HTMLDivElement;
    expect(region.hasAttribute("tabindex")).toBe(false);
    expect(region.hasAttribute("role")).toBe(false);

    Object.defineProperties(region, {
      clientWidth: { configurable: true, value: 100 },
      scrollWidth: { configurable: true, value: 160 }
    });
    act(() => resizeCallbacks[0]!([], {} as ResizeObserver));
    expect(region.getAttribute("tabindex")).toBe("0");
    expect(region.getAttribute("role")).toBe("region");
    expect(region.getAttribute("aria-label")).toBe("Props 表格，可横向滚动");

    Object.defineProperty(region, "scrollWidth", { configurable: true, value: 80 });
    act(() => resizeCallbacks[0]!([], {} as ResizeObserver));
    expect(region.hasAttribute("tabindex")).toBe(false);
    expect(region.hasAttribute("role")).toBe(false);
    expect(region.hasAttribute("aria-label")).toBe(false);

    act(() => root.unmount());
    expect(observe).toHaveBeenCalledWith(region);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
