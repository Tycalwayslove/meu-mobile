// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { BottomSheet } from "./BottomSheet";

function setViewportHeight(height: number) {
  Object.defineProperty(window, "innerHeight", { configurable: true, value: height });
}

describe("BottomSheet", () => {
  it("uses its visible title as a modal dialog name and reports dismissal reasons", async () => {
    const onOpenChange = vi.fn();
    render(
      <BottomSheet
        open
        title="筛选条件"
        closeOnMaskClick
        showCloseButton
        onOpenChange={onOpenChange}
      >
        <button type="button">应用筛选</button>
      </BottomSheet>
    );

    const sheet = screen.getByRole("dialog", { name: "筛选条件" });
    expect(sheet.getAttribute("aria-modal")).toBe("true");
    expect(document.body.getAttribute("data-meu-scroll-locked")).toBe("true");
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "调整面板高度" }))
    );

    const mask = document.body.querySelector(
      '[data-meu-overlay-layer="bottom-sheet"] [data-meu-component="mask"]'
    );
    if (!(mask instanceof HTMLElement) || !(mask.firstElementChild instanceof HTMLElement)) {
      throw new Error("Expected BottomSheet mask");
    }
    fireEvent.click(mask.firstElementChild);
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "关闭" }));

    expect(onOpenChange).toHaveBeenNthCalledWith(1, false, { reason: "mask" });
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false, { reason: "escape" });
    expect(onOpenChange).toHaveBeenNthCalledWith(3, false, { reason: "close-button" });
  });

  it("cycles snap points from the handle and supports an equivalent keyboard path", async () => {
    setViewportHeight(800);
    const onSnapPointChange = vi.fn();
    render(
      <BottomSheet
        open
        title="配送时间"
        snapPoints={[0.25, 0.5, 0.75]}
        onSnapPointChange={onSnapPointChange}
      >
        配送内容
      </BottomSheet>
    );
    const sheet = screen.getByRole("dialog", { name: "配送时间" });
    await waitFor(() => expect(sheet.getAttribute("data-snap-point")).toBe("0.75"));
    const handle = screen.getByRole("button", { name: "调整面板高度" });

    fireEvent.click(handle);
    expect(sheet.getAttribute("data-snap-point")).toBe("0.25");
    expect(onSnapPointChange).toHaveBeenLastCalledWith(0.25, {
      index: 0,
      reason: "handle"
    });

    fireEvent.keyDown(handle, { key: "ArrowUp" });
    expect(sheet.getAttribute("data-snap-point")).toBe("0.5");
    fireEvent.keyDown(handle, { key: "End" });
    expect(sheet.getAttribute("data-snap-point")).toBe("0.75");
  });

  it("keeps a controlled snap point until its owner accepts the change", async () => {
    setViewportHeight(800);
    const onSnapPointChange = vi.fn();
    const { rerender } = render(
      <BottomSheet
        open
        title="受控高度"
        snapPoint={0.5}
        snapPoints={[0.25, 0.5, 0.75]}
        onSnapPointChange={onSnapPointChange}
      >
        内容
      </BottomSheet>
    );
    const sheet = screen.getByRole("dialog", { name: "受控高度" });
    await waitFor(() => expect(sheet.getAttribute("data-snap-point")).toBe("0.5"));
    fireEvent.keyDown(screen.getByRole("button", { name: "调整面板高度" }), {
      key: "ArrowUp"
    });
    expect(onSnapPointChange).toHaveBeenCalledWith(0.75, { index: 2, reason: "handle" });
    expect(sheet.getAttribute("data-snap-point")).toBe("0.5");

    rerender(
      <BottomSheet
        open
        title="受控高度"
        snapPoint={0.75}
        snapPoints={[0.25, 0.5, 0.75]}
        onSnapPointChange={onSnapPointChange}
      >
        内容
      </BottomSheet>
    );
    expect(sheet.getAttribute("data-snap-point")).toBe("0.75");
  });

  it("allows a downward handle drag to dismiss below the minimum snap point", async () => {
    setViewportHeight(800);
    const onOpenChange = vi.fn();
    render(
      <BottomSheet
        open
        title="拖拽关闭"
        defaultSnapPoint={0.25}
        snapPoints={[0.25, 0.75]}
        onOpenChange={onOpenChange}
      >
        内容
      </BottomSheet>
    );
    const handle = screen.getByRole("button", { name: "调整面板高度" });
    Object.defineProperties(handle, {
      hasPointerCapture: { configurable: true, value: () => true },
      releasePointerCapture: { configurable: true, value: vi.fn() },
      setPointerCapture: { configurable: true, value: vi.fn() }
    });
    await waitFor(() =>
      expect(screen.getByRole("dialog", { name: "拖拽关闭" }).getAttribute("data-snap-point")).toBe(
        "0.25"
      )
    );

    fireEvent.pointerDown(handle, { button: 0, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientY: 280, pointerId: 1 });
    fireEvent.pointerUp(handle, { clientY: 280, pointerId: 1 });
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "drag" });
  });

  it("keeps a force-mounted closed sheet outside layout and the accessibility tree", () => {
    render(
      <BottomSheet aria-label="保活面板" open={false} forceMount dragHandle={false}>
        保留状态
      </BottomSheet>
    );
    const layer = document.body.querySelector('[data-meu-overlay-layer="bottom-sheet"]');
    if (!(layer instanceof HTMLElement)) throw new Error("Expected BottomSheet layer");
    expect(layer.hidden).toBe(true);
    expect(screen.queryByRole("dialog", { name: "保活面板" })).toBeNull();
    expect(screen.queryByRole("button", { name: "调整面板高度" })).toBeNull();
  });

  it("normalizes a removed uncontrolled snap point permanently", async () => {
    setViewportHeight(800);
    const { rerender } = render(
      <BottomSheet open title="动态高度" defaultSnapPoint={0.75} snapPoints={[0.25, 0.75]}>
        内容
      </BottomSheet>
    );
    const sheet = screen.getByRole("dialog", { name: "动态高度" });
    await waitFor(() => expect(sheet.getAttribute("data-snap-point")).toBe("0.75"));

    rerender(
      <BottomSheet open title="动态高度" defaultSnapPoint={0.75} snapPoints={[0.25]}>
        内容
      </BottomSheet>
    );
    expect(sheet.getAttribute("data-snap-point")).toBe("0.25");

    rerender(
      <BottomSheet open title="动态高度" defaultSnapPoint={0.75} snapPoints={[0.25, 0.75]}>
        内容
      </BottomSheet>
    );
    expect(sheet.getAttribute("data-snap-point")).toBe("0.25");
  });

  it("keeps numeric titles and localizes the handle position description", async () => {
    setViewportHeight(800);
    render(
      <ConfigProvider locale="en-US">
        <BottomSheet open title={0} snapPoints={[0.5]}>
          Content
        </BottomSheet>
      </ConfigProvider>
    );
    expect(screen.getByRole("dialog", { name: "0" })).toBeTruthy();
    const handle = screen.getByRole("button", { name: "Adjust sheet height" });
    await waitFor(() => {
      const descriptionId = handle.getAttribute("aria-describedby");
      const description = descriptionId ? document.getElementById(descriptionId) : null;
      expect(description && description.textContent).toBe("50%, position 1 of 1");
    });
  });

  it("copies direction, theme and reduced motion across the default body portal", () => {
    render(
      <ConfigProvider dir="rtl" locale="en-US" motion="reduced" theme="dark">
        <BottomSheet open title="Portal contract">
          Content
        </BottomSheet>
      </ConfigProvider>
    );
    const layer = document.body.querySelector('[data-meu-overlay-layer="bottom-sheet"]');
    if (!(layer instanceof HTMLElement)) throw new Error("Expected BottomSheet layer");
    expect(layer.dir).toBe("rtl");
    expect(layer.lang).toBe("en-US");
    expect(layer.getAttribute("data-meu-motion")).toBe("reduced");
    expect(layer.getAttribute("data-meu-theme")).toBe("dark");
  });
});
