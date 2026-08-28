// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { VirtualList } from "./VirtualList";
import type { VirtualListRange, VirtualListRef } from "./types";

const items = Array.from({ length: 100 }, (_, index) => ({ id: `item-${index}`, index }));
const scrollToMock = vi.fn(function (this: HTMLElement, options: ScrollToOptions) {
  this.scrollTop = typeof options.top === "number" ? options.top : 0;
  fireEvent.scroll(this);
});

beforeEach(() => {
  scrollToMock.mockClear();
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement
  ) {
    const index = Number(this.getAttribute("data-meu-virtual-index"));
    const height = this.hasAttribute("data-meu-virtual-index") && index === 0 ? 80 : 50;
    return {
      bottom: height,
      height,
      left: 0,
      right: 320,
      top: 0,
      width: 320,
      x: 0,
      y: 0,
      toJSON: () => ({})
    };
  });
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (
    this: HTMLElement
  ) {
    if (this.hasAttribute("data-meu-virtual-index")) {
      return this.getAttribute("data-meu-virtual-index") === "0" ? 80 : 50;
    }
    if (this.getAttribute("data-meu-component") === "virtual-list") {
      return Number.parseFloat(this.style.height) || 200;
    }
    return Number.parseFloat(this.style.height) || 0;
  });
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(320);
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(function (
    this: HTMLElement
  ) {
    const sizer = this.querySelector<HTMLElement>('[role="presentation"]');
    return sizer ? Number.parseFloat(sizer.style.height) || 0 : this.offsetHeight;
  });
  Object.defineProperty(HTMLElement.prototype, "scrollTo", {
    configurable: true,
    value: scrollToMock
  });
});

function renderList(
  options: {
    onRangeChange?: (range: VirtualListRange) => void;
    ref?: React.Ref<VirtualListRef>;
  } = {}
) {
  return render(
    <>
      <VirtualList
        {...(options.ref ? { ref: options.ref } : {})}
        aria-label="虚拟订单"
        estimateSize={50}
        getItemKey={(entry) => entry.id}
        height={200}
        items={items}
        {...(options.onRangeChange ? { onRangeChange: options.onRangeChange } : {})}
        overscan={1}
        renderItem={(entry) => <button type="button">订单 {entry.index}</button>}
      />
      <button type="button">列表外</button>
    </>
  );
}

describe("VirtualList", () => {
  it("server-renders a deterministic subset without reading browser globals", () => {
    const markup = renderToString(
      <VirtualList
        aria-label="服务端列表"
        estimateSize={50}
        getItemKey={(entry) => entry.id}
        height={200}
        items={items}
        renderItem={(entry) => <span>订单 {entry.index}</span>}
      />
    );

    expect(markup).toContain('role="list"');
    expect(markup).toContain('aria-setsize="100"');
    expect(markup).toContain('data-meu-virtual-index="0"');
    expect(markup).not.toContain('data-meu-virtual-index="99"');
  });

  it("mounts only the visible window and exposes full-list semantics", async () => {
    const onRangeChange = vi.fn();
    renderList({ onRangeChange });

    await waitFor(() => expect(onRangeChange).toHaveBeenCalled());
    const list = screen.getByRole("list", { name: "虚拟订单" });
    const rows = screen.getAllByRole("listitem");
    expect(rows.length).toBeGreaterThan(3);
    expect(rows.length).toBeLessThan(12);
    expect(rows[0]!.getAttribute("aria-posinset")).toBe("1");
    expect(rows[0]!.getAttribute("aria-setsize")).toBe("100");
    expect(Number(list.getAttribute("data-rendered-count"))).toBe(rows.length);
    expect(onRangeChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        overscanStartIndex: 0,
        visibleStartIndex: 0
      })
    );
  });

  it("measures dynamic rows instead of keeping the initial estimate", async () => {
    const { container } = render(
      <VirtualList
        aria-label="动态高度列表"
        estimateSize={50}
        getItemKey={(entry) => entry.id}
        height={200}
        items={items.slice(0, 10)}
        renderItem={(entry) => <span>订单 {entry.index}</span>}
      />
    );

    const sizer = container.querySelector<HTMLElement>('[role="presentation"]');
    await waitFor(() => expect(sizer!.style.height).toBe("530px"));
  });

  it("keeps the focused row mounted while imperative scrolling moves far away", async () => {
    const ref = createRef<VirtualListRef>();
    const { container } = renderList({ ref });
    await act(() => Promise.resolve());
    const firstButton = screen.getByRole("button", { name: "订单 1" });

    act(() => firstButton.focus());
    expect(document.activeElement).toBe(firstButton);
    act(() => ref.current!.scrollToOffset(4_000));
    expect(ref.current!.nativeElement!.scrollTop).toBeGreaterThan(0);
    fireEvent.scroll(ref.current!.nativeElement!);

    await waitFor(() => {
      expect(container.querySelector('[data-meu-virtual-index="80"]')).not.toBeNull();
    });
    expect(screen.getByRole("button", { name: "订单 1" })).toBe(firstButton);
    expect(document.activeElement).toBe(firstButton);

    act(() => screen.getByRole("button", { name: "列表外" }).focus());
    await waitFor(() => {
      expect(container.querySelector('[data-meu-virtual-index="1"]')).toBeNull();
    });
  });

  it("clamps imperative offsets and renders caller-owned empty content", async () => {
    const ref = createRef<VirtualListRef>();
    const { rerender } = render(
      <VirtualList
        ref={ref}
        aria-label="可定位列表"
        estimateSize={50}
        getItemKey={(entry) => entry.id}
        height={200}
        items={items}
        renderItem={(entry) => <span>订单 {entry.index}</span>}
      />
    );
    await act(() => Promise.resolve());

    act(() => ref.current!.scrollToOffset(4_900));
    expect(ref.current!.nativeElement!.scrollTop).toBeGreaterThan(0);
    fireEvent.scroll(ref.current!.nativeElement!);
    await waitFor(() => expect(screen.getByText("订单 99")).toBeTruthy());
    act(() => ref.current!.scrollToOffset(-100));
    expect(scrollToMock).toHaveBeenLastCalledWith({
      behavior: "auto",
      top: 0
    });

    rerender(
      <VirtualList
        aria-label="可定位列表"
        emptyContent="暂时没有订单"
        estimateSize={50}
        getItemKey={(entry: (typeof items)[number]) => entry.id}
        height={200}
        items={[]}
        renderItem={(entry) => <span>订单 {entry.index}</span>}
      />
    );
    expect(screen.getByText("暂时没有订单")).toBeTruthy();
    expect(screen.queryByRole("listitem")).toBeNull();
  });

  it("retains the focused stable key when items reorder", async () => {
    const original = items.slice(0, 30);
    const { container, rerender } = render(
      <VirtualList
        aria-label="可排序订单"
        estimateSize={50}
        getItemKey={(entry) => entry.id}
        height={200}
        items={original}
        renderItem={(entry) => <button type="button">订单 {entry.index}</button>}
      />
    );
    await act(() => Promise.resolve());
    const focused = screen.getByRole("button", { name: "订单 1" });
    act(() => focused.focus());

    const reordered = [...original.filter((entry) => entry.id !== "item-1"), original[1]!];
    rerender(
      <VirtualList
        aria-label="可排序订单"
        estimateSize={50}
        getItemKey={(entry) => entry.id}
        height={200}
        items={reordered}
        renderItem={(entry) => <button type="button">订单 {entry.index}</button>}
      />
    );

    await waitFor(() => {
      expect(container.querySelector('[data-meu-virtual-index="29"]')).not.toBeNull();
    });
    expect(screen.getByRole("button", { name: "订单 1" })).toBe(focused);
    expect(document.activeElement).toBe(focused);
  });
});
