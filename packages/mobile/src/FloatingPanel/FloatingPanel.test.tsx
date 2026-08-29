// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { FloatingPanel } from "./FloatingPanel";
import type { FloatingPanelRef } from "./types";

function setViewportHeight(height: number) {
  Object.defineProperty(window, "innerHeight", { configurable: true, value: height });
}

function root(container: HTMLElement) {
  const node = container.querySelector<HTMLElement>('[data-meu-component="floating-panel"]');
  if (!node) throw new Error("Expected FloatingPanel root");
  return node;
}

function preparePointerCapture(node: HTMLElement) {
  Object.defineProperties(node, {
    hasPointerCapture: { configurable: true, value: () => true },
    releasePointerCapture: { configurable: true, value: vi.fn() },
    setPointerCapture: { configurable: true, value: vi.fn() }
  });
}

function drag(node: HTMLElement, fromY: number, toY: number, fromX = 30, toX = 30) {
  preparePointerCapture(node);
  beginDrag(node, fromY, toY, fromX, toX);
  fireEvent.pointerUp(node, {
    clientX: toX,
    clientY: toY,
    isPrimary: true,
    pointerId: 1,
    timeStamp: 240
  });
}

function beginDrag(node: HTMLElement, fromY: number, toY: number, fromX = 30, toX = 30) {
  fireEvent.pointerDown(node, {
    button: 0,
    clientX: fromX,
    clientY: fromY,
    isPrimary: true,
    pointerId: 1,
    timeStamp: 0
  });
  fireEvent.pointerMove(node, {
    clientX: toX,
    clientY: toY,
    isPrimary: true,
    pointerId: 1,
    timeStamp: 200
  });
}

beforeEach(() => setViewportHeight(800));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("FloatingPanel", () => {
  it("keeps its scrollable body keyboard reachable", () => {
    render(<FloatingPanel anchors={[200, 400]}>可滚动详情</FloatingPanel>);
    const handle = screen.getByRole("button", { name: "调整浮动面板高度" });
    const bodyId = handle.getAttribute("aria-controls");

    expect(bodyId).toBeTruthy();
    const body = document.getElementById(bodyId!);
    expect(body && body.getAttribute("tabindex")).toBe("0");
    expect(body && body.getAttribute("role")).toBe("region");
    expect(body && body.getAttribute("aria-label")).toBe("浮动面板内容");
  });

  it("normalizes pixel anchors and starts from the lowest available height", () => {
    const { container } = render(
      <FloatingPanel anchors={[0, 20, 20.4, 300, 2000, Number.POSITIVE_INFINITY]}>
        地图详情
      </FloatingPanel>
    );
    const panel = root(container);
    expect(panel.getAttribute("data-current-height")).toBe("44");
    expect(panel.getAttribute("data-anchor-index")).toBe("0");
    expect(panel.style.height).toBe("800px");
    expect(panel.style.getPropertyValue("--meu-floating-panel-translate")).toBe("756px");
  });

  it("cycles with the native handle and exposes the full keyboard path", () => {
    const onHeightChange = vi.fn();
    const { container } = render(
      <FloatingPanel anchors={[200, 400, 700]} onHeightChange={onHeightChange}>
        行程详情
      </FloatingPanel>
    );
    const panel = root(container);
    const handle = screen.getByRole("button", { name: "调整浮动面板高度" });

    fireEvent.click(handle);
    expect(panel.getAttribute("data-current-height")).toBe("400");
    expect(onHeightChange).toHaveBeenLastCalledWith(400, { index: 1, reason: "handle" });

    fireEvent.keyDown(handle, { key: "End" });
    expect(panel.getAttribute("data-current-height")).toBe("700");
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    expect(panel.getAttribute("data-current-height")).toBe("400");
    fireEvent.keyDown(handle, { key: "Home" });
    expect(panel.getAttribute("data-current-height")).toBe("200");
    fireEvent.keyDown(handle, { key: "PageUp" });
    expect(onHeightChange).toHaveBeenLastCalledWith(400, { index: 1, reason: "keyboard" });
  });

  it("reverses physical arrow direction for top placement", () => {
    const { container } = render(
      <FloatingPanel placement="top" anchors={[160, 320, 640]} defaultHeight={320}>
        顶部详情
      </FloatingPanel>
    );
    const panel = root(container);
    const handle = screen.getByRole("button", { name: "调整浮动面板高度" });

    expect(panel.style.getPropertyValue("--meu-floating-panel-translate")).toBe("-320px");
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    expect(panel.getAttribute("data-current-height")).toBe("640");
    fireEvent.keyDown(handle, { key: "ArrowUp" });
    expect(panel.getAttribute("data-current-height")).toBe("320");
  });

  it("reports controlled requests without replacing the authoritative height", () => {
    const onHeightChange = vi.fn();
    const { container, rerender } = render(
      <FloatingPanel anchors={[200, 400, 600]} height={400} onHeightChange={onHeightChange}>
        受控内容
      </FloatingPanel>
    );
    const panel = root(container);
    fireEvent.keyDown(screen.getByRole("button", { name: "调整浮动面板高度" }), { key: "End" });
    expect(onHeightChange).toHaveBeenCalledWith(600, { index: 2, reason: "keyboard" });
    expect(panel.getAttribute("data-current-height")).toBe("400");

    rerender(
      <FloatingPanel anchors={[200, 400, 600]} height={600} onHeightChange={onHeightChange}>
        受控内容
      </FloatingPanel>
    );
    expect(panel.getAttribute("data-current-height")).toBe("600");
  });

  it("snaps a handle drag using distance and reports a drag reason", () => {
    const onHeightChange = vi.fn();
    render(
      <FloatingPanel anchors={[200, 400, 600]} defaultHeight={400} onHeightChange={onHeightChange}>
        拖拽内容
      </FloatingPanel>
    );
    const handle = screen.getByRole("button", { name: "调整浮动面板高度" });
    drag(handle, 300, 80);
    expect(onHeightChange).toHaveBeenLastCalledWith(600, { index: 2, reason: "drag" });
  });

  it("lets non-interactive content expand the panel before native scrolling takes over", () => {
    const onHeightChange = vi.fn();
    const { container } = render(
      <FloatingPanel anchors={[200, 400, 600]} inertiaFactor={0} onHeightChange={onHeightChange}>
        <button type="button">内容操作</button>
        <p>可拖拽说明</p>
      </FloatingPanel>
    );
    const panel = root(container);
    const content = container.querySelector<HTMLElement>("[data-content-drag='true']");
    if (!content) throw new Error("Expected draggable content");

    drag(screen.getByRole("button", { name: "内容操作" }), 300, 80);
    expect(onHeightChange).not.toHaveBeenCalled();

    drag(content, 300, 80);
    expect(panel.getAttribute("data-current-height")).toBe("400");
    expect(onHeightChange).toHaveBeenLastCalledWith(400, { index: 1, reason: "drag" });

    fireEvent.keyDown(screen.getByRole("button", { name: "调整浮动面板高度" }), { key: "End" });
    expect(container.querySelector("[data-content-drag='true']")).toBeNull();
  });

  it("does not steal gestures from ARIA widgets, focusable content, or explicit opt-out regions", () => {
    const onHeightChange = vi.fn();
    const { container } = render(
      <FloatingPanel anchors={[200, 400]} inertiaFactor={0} onHeightChange={onHeightChange}>
        <div role="checkbox" aria-checked="false">
          自定义复选框
        </div>
        <div data-testid="focusable-content">可聚焦区域</div>
        <div data-meu-floating-panel-drag-ignore>
          <span>自定义手势区域</span>
        </div>
        <p>普通内容</p>
      </FloatingPanel>
    );

    drag(screen.getByRole("checkbox"), 300, 80);
    const focusableContent = screen.getByTestId("focusable-content");
    focusableContent.setAttribute("tabindex", "0");
    drag(focusableContent, 300, 80);
    drag(screen.getByText("自定义手势区域"), 300, 80);
    expect(onHeightChange).not.toHaveBeenCalled();

    drag(screen.getByText("普通内容"), 300, 80);
    expect(onHeightChange).toHaveBeenLastCalledWith(400, { index: 1, reason: "drag" });
    expect(root(container).getAttribute("data-current-height")).toBe("400");
  });

  it("ignores horizontal content movement after direction lock", () => {
    const onHeightChange = vi.fn();
    const { container } = render(
      <FloatingPanel anchors={[200, 400]} onHeightChange={onHeightChange}>
        可横向操作内容
      </FloatingPanel>
    );
    const content = container.querySelector<HTMLElement>("[data-content-drag='true']");
    if (!content) throw new Error("Expected draggable content");
    drag(content, 100, 103, 20, 120);
    expect(onHeightChange).not.toHaveBeenCalled();
  });

  it("maps imperative requests to the nearest anchor and can skip animation", async () => {
    const panelRef = { current: null as FloatingPanelRef | null };
    const onHeightChange = vi.fn();
    const { container } = render(
      <FloatingPanel ref={panelRef} anchors={[200, 400, 600]} onHeightChange={onHeightChange}>
        命令式内容
      </FloatingPanel>
    );
    act(() => panelRef.current!.setHeight(550, { immediate: true }));
    expect(root(container).getAttribute("data-current-height")).toBe("600");
    expect(root(container).getAttribute("data-immediate")).toBe("true");
    expect(panelRef.current!.nativeElement).toBe(root(container));
    expect(onHeightChange).toHaveBeenCalledWith(600, { index: 2, reason: "imperative" });

    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    expect(root(container).getAttribute("data-immediate")).toBeNull();
  });

  it("localizes the handle and disables every adjustment path", () => {
    const onHeightChange = vi.fn();
    const { container } = render(
      <ConfigProvider locale="en-US">
        <FloatingPanel disabled anchors={[200, 600]} onHeightChange={onHeightChange}>
          Disabled content
        </FloatingPanel>
      </ConfigProvider>
    );
    const handle = screen.getByRole<HTMLButtonElement>("button", {
      name: "Adjust floating panel height"
    });
    expect(handle.disabled).toBe(true);
    expect(root(container).getAttribute("data-disabled")).toBe("true");
    fireEvent.click(handle);
    drag(handle, 300, 50);
    expect(onHeightChange).not.toHaveBeenCalled();
  });

  it("disables the handle when normalization leaves fewer than two anchors", () => {
    const onHeightChange = vi.fn();
    const { rerender } = render(
      <FloatingPanel anchors={[240, 240, Number.NaN]} onHeightChange={onHeightChange}>
        Static content
      </FloatingPanel>
    );
    const handle = screen.getByRole<HTMLButtonElement>("button", {
      name: "调整浮动面板高度"
    });
    expect(handle.disabled).toBe(true);
    fireEvent.click(handle);
    fireEvent.keyDown(handle, { key: "End" });
    expect(onHeightChange).not.toHaveBeenCalled();

    rerender(
      <FloatingPanel anchors={[]} onHeightChange={onHeightChange}>
        Static content
      </FloatingPanel>
    );
    expect(handle.disabled).toBe(true);
    expect(onHeightChange).not.toHaveBeenCalled();
  });

  it("cancels a drag when pointer capture is lost", () => {
    const onHeightChange = vi.fn();
    render(
      <FloatingPanel anchors={[200, 400, 600]} defaultHeight={400} onHeightChange={onHeightChange}>
        内容
      </FloatingPanel>
    );
    const handle = screen.getByRole("button", { name: "调整浮动面板高度" });
    preparePointerCapture(handle);
    fireEvent.pointerDown(handle, {
      button: 0,
      clientX: 20,
      clientY: 300,
      isPrimary: true,
      pointerId: 7,
      timeStamp: 0
    });
    fireEvent.pointerMove(handle, {
      clientX: 20,
      clientY: 180,
      isPrimary: true,
      pointerId: 7,
      timeStamp: 100
    });
    const panel = handle.closest<HTMLElement>('[data-meu-component="floating-panel"]');
    if (!panel) throw new Error("Expected FloatingPanel root");
    expect(panel.getAttribute("data-dragging")).toBe("true");
    fireEvent.lostPointerCapture(handle, { pointerId: 7 });
    expect(panel.getAttribute("data-dragging")).toBeNull();
    expect(onHeightChange).not.toHaveBeenCalled();
  });

  it("falls back to window pointer events when pointer capture acquisition throws", () => {
    const onHeightChange = vi.fn();
    const { container } = render(
      <FloatingPanel anchors={[200, 400, 600]} defaultHeight={400} onHeightChange={onHeightChange}>
        内容
      </FloatingPanel>
    );
    const handle = screen.getByRole("button", { name: "调整浮动面板高度" });
    Object.defineProperty(handle, "setPointerCapture", {
      configurable: true,
      value: () => {
        throw new Error("capture unavailable");
      }
    });

    fireEvent.pointerDown(handle, {
      button: 0,
      clientX: 20,
      clientY: 300,
      isPrimary: true,
      pointerId: 9,
      timeStamp: 0
    });
    fireEvent.pointerMove(window, {
      clientX: 20,
      clientY: 80,
      isPrimary: true,
      pointerId: 9,
      timeStamp: 200
    });
    expect(root(container).getAttribute("data-dragging")).toBe("true");
    fireEvent.pointerUp(window, {
      clientX: 20,
      clientY: 80,
      isPrimary: true,
      pointerId: 9,
      timeStamp: 240
    });

    expect(root(container).getAttribute("data-dragging")).toBeNull();
    expect(onHeightChange).toHaveBeenLastCalledWith(600, { index: 2, reason: "drag" });
  });

  it.each([
    {
      label: "anchors",
      next: { anchors: [200, 500, 700], disabled: false, placement: "bottom" as const }
    },
    {
      label: "placement",
      next: { anchors: [200, 400, 600], disabled: false, placement: "top" as const }
    },
    {
      label: "disabled",
      next: { anchors: [200, 400, 600], disabled: true, placement: "bottom" as const }
    }
  ])("cancels an active drag when $label changes", async ({ next }) => {
    const onHeightChange = vi.fn();
    const { container, rerender } = render(
      <FloatingPanel anchors={[200, 400, 600]} defaultHeight={400} onHeightChange={onHeightChange}>
        内容
      </FloatingPanel>
    );
    const handle = screen.getByRole("button", { name: "调整浮动面板高度" });
    preparePointerCapture(handle);
    beginDrag(handle, 300, 180);
    expect(root(container).getAttribute("data-dragging")).toBe("true");

    rerender(
      <FloatingPanel {...next} defaultHeight={400} onHeightChange={onHeightChange}>
        内容
      </FloatingPanel>
    );
    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    expect(root(container).getAttribute("data-dragging")).toBeNull();
    fireEvent.pointerUp(handle, {
      clientX: 20,
      clientY: 80,
      isPrimary: true,
      pointerId: 1,
      timeStamp: 240
    });
    expect(onHeightChange).not.toHaveBeenCalled();
  });

  it("cancels an active drag when visual viewport resizing changes normalized anchors", async () => {
    const originalViewport = Object.getOwnPropertyDescriptor(window, "visualViewport");
    const visualViewport = new EventTarget() as VisualViewport;
    Object.defineProperty(visualViewport, "height", { configurable: true, value: 800 });
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: visualViewport
    });
    const onHeightChange = vi.fn();
    const { container, unmount } = render(
      <FloatingPanel anchors={[200, 400, 1000]} defaultHeight={400} onHeightChange={onHeightChange}>
        内容
      </FloatingPanel>
    );
    const handle = screen.getByRole("button", { name: "调整浮动面板高度" });
    preparePointerCapture(handle);
    beginDrag(handle, 300, 180);
    expect(root(container).getAttribute("data-dragging")).toBe("true");

    Object.defineProperty(visualViewport, "height", { configurable: true, value: 500 });
    await act(() => visualViewport.dispatchEvent(new Event("resize")));
    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));

    expect(root(container).getAttribute("data-dragging")).toBeNull();
    expect(root(container).getAttribute("data-current-height")).toBe("400");
    expect(onHeightChange).not.toHaveBeenCalled();
    unmount();
    if (originalViewport) Object.defineProperty(window, "visualViewport", originalViewport);
    else Reflect.deleteProperty(window, "visualViewport");
  });

  it("cancels a queued drag reset when the panel becomes draggable again", async () => {
    const { container, rerender } = render(
      <FloatingPanel anchors={[200, 400]}>内容</FloatingPanel>
    );
    const handle = screen.getByRole("button", { name: "调整浮动面板高度" });
    preparePointerCapture(handle);
    beginDrag(handle, 300, 180);
    expect(root(container).getAttribute("data-dragging")).toBe("true");

    rerender(
      <FloatingPanel anchors={[200, 400]} disabled>
        内容
      </FloatingPanel>
    );
    rerender(<FloatingPanel anchors={[200, 400]}>内容</FloatingPanel>);
    preparePointerCapture(handle);
    beginDrag(handle, 300, 180);

    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    expect(root(container).getAttribute("data-dragging")).toBe("true");
  });

  it("keeps native root event handlers observable", () => {
    const onPointerDown = vi.fn();
    render(
      <FloatingPanel anchors={[200, 400]} onPointerDown={onPointerDown}>
        <p>内容事件</p>
      </FloatingPanel>
    );
    fireEvent.pointerDown(screen.getByText("内容事件"), {
      button: 0,
      clientX: 20,
      clientY: 300,
      isPrimary: true,
      pointerId: 3,
      timeStamp: 0
    });
    expect(onPointerDown).toHaveBeenCalledOnce();
  });

  it("does not collapse from content and disables imperative requests", () => {
    const panelRef = { current: null as FloatingPanelRef | null };
    const onHeightChange = vi.fn();
    const { container, rerender } = render(
      <FloatingPanel
        ref={panelRef}
        anchors={[200, 400, 600]}
        defaultHeight={400}
        onHeightChange={onHeightChange}
      >
        非交互内容
      </FloatingPanel>
    );
    const content = container.querySelector<HTMLElement>("[data-content-drag='true']")!;
    drag(content, 200, 320);
    expect(onHeightChange).not.toHaveBeenCalled();
    expect(root(container).getAttribute("data-current-height")).toBe("400");

    rerender(
      <FloatingPanel
        ref={panelRef}
        anchors={[200, 400, 600]}
        defaultHeight={400}
        disabled
        onHeightChange={onHeightChange}
      >
        非交互内容
      </FloatingPanel>
    );
    act(() => {
      if (panelRef.current) panelRef.current.setHeight(600);
    });
    expect(root(container).getAttribute("data-current-height")).toBe("400");
    expect(onHeightChange).not.toHaveBeenCalled();
  });
});
