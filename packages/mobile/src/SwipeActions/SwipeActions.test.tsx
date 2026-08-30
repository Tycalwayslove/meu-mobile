// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { SwipeActions } from "./SwipeActions";
import type { SwipeActionsAction } from "./types";

const leftActions: SwipeActionsAction[] = [{ key: "pin", label: "置顶", tone: "accent" }];
const rightActions: SwipeActionsAction[] = [
  { key: "archive", label: "归档" },
  { key: "delete", label: "删除", tone: "danger" }
];
let rightRailWidth = 160;
let triggerResizeObserver: (() => void) | null = null;

beforeEach(() => {
  rightRailWidth = 160;
  triggerResizeObserver = null;
  vi.stubGlobal(
    "ResizeObserver",
    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        triggerResizeObserver = () => callback([], this);
      }
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
    }
  );
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement
  ) {
    const side = this.getAttribute("data-meu-swipe-actions-group");
    const width = side === "left" ? 80 : side === "right" ? rightRailWidth : 320;
    return {
      bottom: 64,
      height: 64,
      left: 0,
      right: width,
      top: 0,
      width,
      x: 0,
      y: 0,
      toJSON: () => ({})
    };
  });
  if (!HTMLElement.prototype.setPointerCapture) {
    HTMLElement.prototype.setPointerCapture = vi.fn();
  }
  if (!HTMLElement.prototype.releasePointerCapture) {
    HTMLElement.prototype.releasePointerCapture = vi.fn();
  }
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = vi.fn(() => true);
  }
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function renderSwipeActions(props: Partial<React.ComponentProps<typeof SwipeActions>> = {}) {
  return render(
    <SwipeActions leftActions={leftActions} rightActions={rightActions} {...props}>
      <button type="button">打开订单</button>
    </SwipeActions>
  );
}

function drag(root: HTMLElement, fromX: number, toX: number, deltaY = 0) {
  fireEvent.pointerDown(root, {
    button: 0,
    clientX: fromX,
    clientY: 20,
    isPrimary: true,
    pointerId: 1,
    timeStamp: 0
  });
  fireEvent.pointerMove(root, {
    clientX: toX,
    clientY: 20 + deltaY,
    isPrimary: true,
    pointerId: 1,
    timeStamp: 200
  });
  fireEvent.pointerUp(root, {
    clientX: toX,
    clientY: 20 + deltaY,
    isPrimary: true,
    pointerId: 1,
    timeStamp: 240
  });
}

describe("SwipeActions", () => {
  it("tracks an open action rail when ResizeObserver reports a dynamic width", async () => {
    const { container } = renderSwipeActions({ defaultOpenSide: "right" });
    const root = container.querySelector<HTMLElement>('[data-meu-component="swipe-actions"]')!;
    await waitFor(() => expect(root.getAttribute("data-offset")).toBe("-160"));
    expect(root.getAttribute("data-open-side")).toBe("right");

    rightRailWidth = 248;
    const notifyResizeObserver = triggerResizeObserver;
    if (!notifyResizeObserver) throw new Error("Expected ResizeObserver callback");
    act(() => notifyResizeObserver());

    await waitFor(() => expect(root.getAttribute("data-offset")).toBe("-248"));
    expect(root.getAttribute("data-open-side")).toBe("right");
    expect(screen.getByRole("button", { name: "归档" }).getAttribute("tabindex")).toBe("0");
  });

  it("keeps closed actions out of the tab order and exposes native reveal controls", () => {
    const { container } = renderSwipeActions();
    const root = container.querySelector<HTMLElement>('[data-meu-component="swipe-actions"]')!;

    expect(root.getAttribute("data-open-side")).toBe("none");
    expect(
      screen.getByRole("button", { name: "置顶", hidden: true }).getAttribute("tabindex")
    ).toBe("-1");
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "显示左侧操作" }).disabled).toBe(
      false
    );
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "显示右侧操作" }).disabled).toBe(
      false
    );
  });

  it("keeps action controls out of a parent form submission and exposes rich labels", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <SwipeActions
          defaultOpenSide="right"
          rightActions={[
            {
              "aria-label": "Archive order MEU-0828",
              key: "archive-rich",
              label: <span aria-hidden="true">归档</span>
            }
          ]}
        >
          <span>订单</span>
        </SwipeActions>
      </form>
    );

    const action = screen.getByRole("button", { name: "Archive order MEU-0828" });
    expect(action.getAttribute("type")).toBe("button");
    await user.click(action);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("opens from the keyboard control, focuses the first action and closes after pressing it", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const onOpenSideChange = vi.fn();
    const { container } = renderSwipeActions({ onAction, onOpenSideChange });
    const root = container.querySelector<HTMLElement>('[data-meu-component="swipe-actions"]')!;

    await user.click(screen.getByRole("button", { name: "显示右侧操作" }));
    await waitFor(() => expect(root.getAttribute("data-open-side")).toBe("right"));
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "归档" }))
    );

    await user.keyboard("{Enter}");
    await waitFor(() => expect(root.getAttribute("data-open-side")).toBe("none"));
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "显示右侧操作" }))
    );
    expect(onAction).toHaveBeenCalledWith(rightActions[0], { index: 0, side: "right" });
    expect(onOpenSideChange).toHaveBeenLastCalledWith(null, {
      actionKey: "archive",
      reason: "action"
    });
  });

  it("reveals either side after a threshold-crossing horizontal drag", async () => {
    const { container } = renderSwipeActions();
    const root = container.querySelector<HTMLElement>('[data-meu-component="swipe-actions"]')!;
    await waitFor(() => expect(root.getAttribute("data-offset")).toBe("0"));

    drag(root, 200, 120);
    expect(root.getAttribute("data-open-side")).toBe("right");
    expect(root.getAttribute("data-offset")).toBe("-160");

    const content = root.querySelector("[data-meu-swipe-actions-content]")!;
    fireEvent.click(content);
    fireEvent.click(content);
    expect(root.getAttribute("data-open-side")).toBe("none");

    drag(root, 100, 140);
    expect(root.getAttribute("data-open-side")).toBe("left");
    expect(root.getAttribute("data-offset")).toBe("80");
  });

  it("does not claim a vertical gesture or activate the content after a horizontal drag", () => {
    const contentAction = vi.fn();
    const { container } = render(
      <SwipeActions rightActions={rightActions}>
        <button type="button" onClick={contentAction}>
          打开订单
        </button>
      </SwipeActions>
    );
    const root = container.querySelector<HTMLElement>('[data-meu-component="swipe-actions"]')!;

    drag(root, 100, 103, 50);
    expect(root.getAttribute("data-open-side")).toBe("none");

    drag(root, 200, 120);
    fireEvent.click(screen.getByRole("button", { name: "打开订单" }), { detail: 1 });
    expect(contentAction).not.toHaveBeenCalled();
  });

  it("reports a controlled request and restores the authoritative side when refused", async () => {
    const onOpenSideChange = vi.fn();
    const { container } = renderSwipeActions({ openSide: null, onOpenSideChange });
    const root = container.querySelector<HTMLElement>('[data-meu-component="swipe-actions"]')!;

    drag(root, 200, 100);
    expect(onOpenSideChange).toHaveBeenCalledWith("right", { reason: "swipe" });
    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    expect(root.getAttribute("data-open-side")).toBe("none");
    expect(root.getAttribute("data-offset")).toBe("0");
  });

  it("closes on outside press and Escape with structured reasons", async () => {
    const user = userEvent.setup();
    const onOpenSideChange = vi.fn();
    const { container } = render(
      <div>
        <SwipeActions
          defaultOpenSide="right"
          rightActions={rightActions}
          onOpenSideChange={onOpenSideChange}
        >
          <span>订单</span>
        </SwipeActions>
        <button type="button">外部按钮</button>
      </div>
    );
    const root = container.querySelector<HTMLElement>('[data-meu-component="swipe-actions"]')!;

    await user.click(screen.getByRole("button", { name: "外部按钮" }));
    expect(root.getAttribute("data-open-side")).toBe("none");
    expect(onOpenSideChange).toHaveBeenLastCalledWith(null, { reason: "outside" });

    await user.click(screen.getByRole("button", { name: "显示右侧操作" }));
    await user.keyboard("{Escape}");
    expect(root.getAttribute("data-open-side")).toBe("none");
    expect(onOpenSideChange).toHaveBeenLastCalledWith(null, { reason: "escape" });
  });

  it("locks duplicate async actions and closes only after a successful result", async () => {
    let resolveAction!: () => void;
    const onPress = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveAction = resolve;
        })
    );
    const actions: SwipeActionsAction[] = [{ key: "save", label: "保存", onPress }];
    const { container } = render(
      <SwipeActions defaultOpenSide="right" rightActions={actions}>
        <span>订单</span>
      </SwipeActions>
    );
    const root = container.querySelector<HTMLElement>('[data-meu-component="swipe-actions"]')!;
    const button = screen.getByRole<HTMLButtonElement>("button", { name: "保存" });

    fireEvent.click(button);
    fireEvent.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(button.disabled).toBe(true);
    expect(button.closest('[role="group"]')!.getAttribute("aria-busy")).toBe("true");

    await act(async () => {
      resolveAction();
      await Promise.resolve();
    });
    expect(root.getAttribute("data-open-side")).toBe("none");
  });

  it("restores an async keyboard action after a controlled close request is refused", async () => {
    let resolveAction!: () => void;
    const onOpenSideChange = vi.fn();
    const actions: SwipeActionsAction[] = [
      {
        key: "save",
        label: "保存",
        onPress: () =>
          new Promise<void>((resolve) => {
            resolveAction = resolve;
          })
      }
    ];
    render(
      <SwipeActions openSide="right" rightActions={actions} onOpenSideChange={onOpenSideChange}>
        <span>订单</span>
      </SwipeActions>
    );
    const button = screen.getByRole<HTMLButtonElement>("button", { name: "保存" });
    button.focus();
    fireEvent.click(button);
    expect(button.disabled).toBe(true);
    button.blur();

    await act(async () => {
      resolveAction();
      await Promise.resolve();
    });
    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));

    expect(onOpenSideChange).toHaveBeenCalledWith(null, {
      actionKey: "save",
      reason: "action"
    });
    expect(button.disabled).toBe(false);
    expect(document.activeElement).toBe(button);
  });

  it("finishes the business chain without closing a newly controlled side", async () => {
    let resolveAction!: () => void;
    const onAction = vi.fn();
    const onOpenSideChange = vi.fn();
    const actions: SwipeActionsAction[] = [
      {
        key: "save",
        label: "保存",
        onPress: () =>
          new Promise<void>((resolve) => {
            resolveAction = resolve;
          })
      }
    ];
    const { container, rerender } = render(
      <SwipeActions
        leftActions={leftActions}
        openSide="right"
        rightActions={actions}
        onAction={onAction}
        onOpenSideChange={onOpenSideChange}
      >
        <span>订单</span>
      </SwipeActions>
    );
    const root = container.querySelector<HTMLElement>('[data-meu-component="swipe-actions"]')!;
    const button = screen.getByRole<HTMLButtonElement>("button", { name: "保存" });
    button.focus();
    fireEvent.click(button);
    button.blur();

    rerender(
      <SwipeActions
        leftActions={leftActions}
        openSide="left"
        rightActions={actions}
        onAction={onAction}
        onOpenSideChange={onOpenSideChange}
      >
        <span>订单</span>
      </SwipeActions>
    );
    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    expect(root.getAttribute("data-open-side")).toBe("left");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "显示左侧操作" }));

    await act(async () => {
      resolveAction();
      await Promise.resolve();
    });
    expect(root.getAttribute("data-open-side")).toBe("left");
    expect(onAction).toHaveBeenCalledWith(actions[0], { index: 0, side: "right" });
    expect(onOpenSideChange).not.toHaveBeenCalled();
    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "置顶" }));
  });

  it("does not emit stale callbacks after an async action unmounts", async () => {
    let resolveAction!: () => void;
    const onAction = vi.fn();
    const onOpenSideChange = vi.fn();
    const actions: SwipeActionsAction[] = [
      {
        key: "save",
        label: "保存",
        onPress: () =>
          new Promise<void>((resolve) => {
            resolveAction = resolve;
          })
      }
    ];
    const { unmount } = render(
      <SwipeActions
        defaultOpenSide="right"
        rightActions={actions}
        onAction={onAction}
        onOpenSideChange={onOpenSideChange}
      >
        <span>订单</span>
      </SwipeActions>
    );
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    unmount();

    await act(async () => {
      resolveAction();
      await Promise.resolve();
    });
    expect(onAction).not.toHaveBeenCalled();
    expect(onOpenSideChange).not.toHaveBeenCalled();
  });

  it("finishes the business chain without closing after the row becomes disabled", async () => {
    let resolveAction!: () => void;
    const onAction = vi.fn();
    const onOpenSideChange = vi.fn();
    const actions: SwipeActionsAction[] = [
      {
        key: "save",
        label: "保存",
        onPress: () =>
          new Promise<void>((resolve) => {
            resolveAction = resolve;
          })
      }
    ];
    const { container, rerender } = render(
      <SwipeActions
        defaultOpenSide="right"
        rightActions={actions}
        onAction={onAction}
        onOpenSideChange={onOpenSideChange}
      >
        <span>订单</span>
      </SwipeActions>
    );
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    rerender(
      <SwipeActions
        disabled
        defaultOpenSide="right"
        rightActions={actions}
        onAction={onAction}
        onOpenSideChange={onOpenSideChange}
      >
        <span>订单</span>
      </SwipeActions>
    );
    const disabledRoot = container.querySelector<HTMLElement>(
      '[data-meu-component="swipe-actions"]'
    )!;
    expect(disabledRoot.getAttribute("data-open-side")).toBe("none");

    await act(async () => {
      resolveAction();
      await Promise.resolve();
    });
    expect(onAction).toHaveBeenCalledWith(actions[0], { index: 0, side: "right" });
    expect(onOpenSideChange).not.toHaveBeenCalled();
  });

  it("keeps the actions open when a handler returns false", async () => {
    const user = userEvent.setup();
    const actions: SwipeActionsAction[] = [{ key: "stay", label: "保留", onPress: () => false }];
    const { container } = render(
      <SwipeActions defaultOpenSide="right" rightActions={actions}>
        <span>订单</span>
      </SwipeActions>
    );
    const root = container.querySelector<HTMLElement>('[data-meu-component="swipe-actions"]')!;

    await user.click(screen.getByRole("button", { name: "保留" }));
    expect(root.getAttribute("data-open-side")).toBe("right");
  });

  it("reports action failures without closing the operation rail", async () => {
    const error = new Error("offline");
    const onActionError = vi.fn();
    const actions: SwipeActionsAction[] = [
      { key: "retry", label: "重试", onPress: () => Promise.reject(error) }
    ];
    const { container } = render(
      <SwipeActions defaultOpenSide="right" rightActions={actions} onActionError={onActionError}>
        <span>订单</span>
      </SwipeActions>
    );
    const root = container.querySelector<HTMLElement>('[data-meu-component="swipe-actions"]')!;

    fireEvent.click(screen.getByRole("button", { name: "重试" }));
    await waitFor(() => expect(onActionError).toHaveBeenCalledWith(error, actions[0]));
    expect(root.getAttribute("data-open-side")).toBe("right");
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "重试" }).disabled).toBe(false);
  });

  it("localizes controls and blocks all interaction while disabled", () => {
    const onOpenSideChange = vi.fn();
    const { container } = render(
      <ConfigProvider locale="en-US">
        <SwipeActions
          disabled
          defaultOpenSide="right"
          rightActions={rightActions}
          onOpenSideChange={onOpenSideChange}
        >
          <span>Order</span>
        </SwipeActions>
      </ConfigProvider>
    );
    const root = container.querySelector<HTMLElement>('[data-meu-component="swipe-actions"]')!;

    expect(root.getAttribute("data-disabled")).toBe("true");
    expect(root.getAttribute("data-open-side")).toBe("none");
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Show right actions" }).disabled
    ).toBe(true);
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "归档", hidden: true }).disabled
    ).toBe(true);
    drag(root, 200, 100);
    expect(onOpenSideChange).not.toHaveBeenCalled();
  });

  it("permanently closes an uncontrolled side when actions disappear or the row is disabled", () => {
    const { container, rerender } = render(
      <SwipeActions defaultOpenSide="right" rightActions={rightActions}>
        <span>订单</span>
      </SwipeActions>
    );
    const root = container.querySelector<HTMLElement>('[data-meu-component="swipe-actions"]')!;
    expect(root.getAttribute("data-open-side")).toBe("right");

    rerender(
      <SwipeActions defaultOpenSide="right" rightActions={[]}>
        <span>订单</span>
      </SwipeActions>
    );
    expect(root.getAttribute("data-open-side")).toBe("none");
    rerender(
      <SwipeActions defaultOpenSide="right" rightActions={rightActions}>
        <span>订单</span>
      </SwipeActions>
    );
    expect(root.getAttribute("data-open-side")).toBe("none");

    fireEvent.click(screen.getByRole("button", { name: "显示右侧操作" }));
    expect(root.getAttribute("data-open-side")).toBe("right");
    rerender(
      <SwipeActions disabled defaultOpenSide="right" rightActions={rightActions}>
        <span>订单</span>
      </SwipeActions>
    );
    expect(root.getAttribute("data-open-side")).toBe("none");
    rerender(
      <SwipeActions defaultOpenSide="right" rightActions={rightActions}>
        <span>订单</span>
      </SwipeActions>
    );
    expect(root.getAttribute("data-open-side")).toBe("none");
  });

  it("finishes a drag when an older WebView throws while releasing pointer capture", () => {
    const { container } = renderSwipeActions();
    const root = container.querySelector<HTMLElement>('[data-meu-component="swipe-actions"]')!;
    Object.defineProperties(root, {
      hasPointerCapture: { configurable: true, value: vi.fn(() => true) },
      releasePointerCapture: {
        configurable: true,
        value: vi.fn(() => {
          throw new DOMException("Pointer capture is already lost", "InvalidStateError");
        })
      },
      setPointerCapture: { configurable: true, value: vi.fn() }
    });

    expect(() => drag(root, 200, 100)).not.toThrow();
    expect(root.getAttribute("data-dragging")).toBe("false");
    expect(root.getAttribute("data-open-side")).toBe("right");
  });

  it.each(["missing", "throwing"] as const)(
    "finishes a drag outside the root when pointer capture is %s",
    (captureMode) => {
      const { container } = renderSwipeActions();
      const root = container.querySelector<HTMLElement>('[data-meu-component="swipe-actions"]')!;
      Object.defineProperty(root, "setPointerCapture", {
        configurable: true,
        value:
          captureMode === "missing"
            ? undefined
            : vi.fn(() => {
                throw new DOMException("Pointer capture is unavailable", "NotSupportedError");
              })
      });

      fireEvent.pointerDown(root, {
        button: 0,
        clientX: 200,
        clientY: 20,
        isPrimary: true,
        pointerId: 17,
        timeStamp: 0
      });
      fireEvent.pointerMove(root, {
        clientX: 120,
        clientY: 20,
        isPrimary: true,
        pointerId: 17,
        timeStamp: 200
      });
      expect(root.getAttribute("data-dragging")).toBe("true");
      fireEvent.pointerUp(document, {
        clientX: 100,
        clientY: 20,
        isPrimary: true,
        pointerId: 17,
        timeStamp: 240
      });

      expect(root.getAttribute("data-dragging")).toBe("false");
      expect(root.getAttribute("data-open-side")).toBe("right");
    }
  );

  it("expires compatibility-click suppression when no click follows a drag", async () => {
    vi.useFakeTimers();
    const contentAction = vi.fn();
    const { container, rerender } = render(
      <SwipeActions rightActions={rightActions}>
        <button type="button" onClick={contentAction}>
          打开订单
        </button>
      </SwipeActions>
    );
    const root = container.querySelector<HTMLElement>('[data-meu-component="swipe-actions"]')!;
    drag(root, 200, 120);
    rerender(
      <SwipeActions disabled rightActions={rightActions}>
        <button type="button" onClick={contentAction}>
          打开订单
        </button>
      </SwipeActions>
    );
    rerender(
      <SwipeActions rightActions={rightActions}>
        <button type="button" onClick={contentAction}>
          打开订单
        </button>
      </SwipeActions>
    );
    expect(root.getAttribute("data-open-side")).toBe("none");
    await act(() => vi.advanceTimersByTime(500));

    fireEvent.click(screen.getByRole("button", { name: "打开订单" }));
    expect(contentAction).toHaveBeenCalledTimes(1);
  });

  it("cancels an active swipe when pointer capture is lost", async () => {
    const { container } = renderSwipeActions();
    const root = container.querySelector<HTMLElement>('[data-meu-component="swipe-actions"]')!;
    await waitFor(() => expect(root.getAttribute("data-offset")).toBe("0"));
    fireEvent.pointerDown(root, {
      button: 0,
      clientX: 200,
      clientY: 20,
      isPrimary: true,
      pointerId: 9,
      timeStamp: 0
    });
    fireEvent.pointerMove(root, {
      clientX: 150,
      clientY: 20,
      isPrimary: true,
      pointerId: 9,
      timeStamp: 100
    });
    expect(root.getAttribute("data-dragging")).toBe("true");
    fireEvent.lostPointerCapture(root, { pointerId: 9 });
    expect(root.getAttribute("data-dragging")).toBe("false");
    expect(root.getAttribute("data-offset")).toBe("0");
    expect(root.getAttribute("data-open-side")).toBe("none");
  });

  it("does not focus an aria-hidden action when a controlled keyboard request is refused", async () => {
    const user = userEvent.setup();
    renderSwipeActions({ openSide: null, onOpenSideChange: vi.fn() });
    const reveal = screen.getByRole("button", { name: "显示右侧操作" });
    reveal.focus();
    await user.keyboard("{Enter}");
    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    expect(document.activeElement).toBe(reveal);
    expect(
      screen.getByRole("button", { name: "归档", hidden: true }).getAttribute("tabindex")
    ).toBe("-1");
  });

  it("moves focus into the authoritative rail when a controlled side switches", async () => {
    const { rerender } = renderSwipeActions({ openSide: "right" });
    screen.getByRole<HTMLButtonElement>("button", { name: "归档" }).focus();

    rerender(
      <SwipeActions leftActions={leftActions} openSide="left" rightActions={rightActions}>
        <button type="button">打开订单</button>
      </SwipeActions>
    );
    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));

    expect(document.activeElement).toBe(screen.getByRole("button", { name: "置顶" }));
    expect(
      screen.getByRole("button", { name: "归档", hidden: true }).getAttribute("tabindex")
    ).toBe("-1");
  });
});
