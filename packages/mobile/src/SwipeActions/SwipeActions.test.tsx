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

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class MockResizeObserver {
      observe() {}
      disconnect() {}
      unobserve() {}
    }
  );
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement
  ) {
    const side = this.getAttribute("data-meu-swipe-actions-group");
    const width = side === "left" ? 80 : side === "right" ? 160 : 320;
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
    fireEvent.click(screen.getByRole("button", { name: "打开订单" }));
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
});
