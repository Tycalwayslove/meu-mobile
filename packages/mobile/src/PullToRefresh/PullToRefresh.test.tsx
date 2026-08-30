// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PullToRefresh } from "./PullToRefresh";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function pull(root: HTMLElement, distance: number) {
  fireEvent.touchStart(root, { touches: [{ clientX: 20, clientY: 20 }] });
  fireEvent.touchMove(root, { touches: [{ clientX: 20, clientY: 20 + distance }] });
}

describe("PullToRefresh", () => {
  it("moves through pulling and ready before running one refresh", async () => {
    vi.useFakeTimers();
    let resolveRefresh!: () => void;
    const onRefresh = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveRefresh = resolve;
        })
    );
    const statuses: string[] = [];
    const onStatusChange = vi.fn((nextStatus: string) => {
      statuses.push(nextStatus);
    });
    render(
      <PullToRefresh
        threshold={50}
        resistance={1}
        completeDelay={400}
        canPull={() => true}
        onRefresh={onRefresh}
        onStatusChange={onStatusChange}
      >
        <p>订单列表</p>
      </PullToRefresh>
    );

    const root = document.querySelector<HTMLElement>('[data-meu-component="pull-to-refresh"]')!;
    pull(root, 30);
    expect(root.getAttribute("data-status")).toBe("pulling");
    expect(root.getAttribute("data-pull-distance")).toBe("30");
    fireEvent.touchMove(root, { touches: [{ clientX: 20, clientY: 90 }] });
    expect(root.getAttribute("data-status")).toBe("ready");
    fireEvent.touchEnd(root, { touches: [] });
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(root.getAttribute("data-status")).toBe("refreshing");
    expect(root.getAttribute("aria-busy")).toBe("true");

    pull(root, 90);
    fireEvent.touchEnd(root, { touches: [] });
    expect(onRefresh).toHaveBeenCalledTimes(1);

    await act(() => {
      resolveRefresh();
      return Promise.resolve();
    });
    expect(root.getAttribute("data-status")).toBe("complete");
    await act(() => {
      vi.advanceTimersByTime(400);
      return Promise.resolve();
    });
    expect(root.getAttribute("data-status")).toBe("idle");
    expect(root.getAttribute("data-pull-distance")).toBe("0");
    expect(statuses).toEqual(["pulling", "ready", "refreshing", "complete", "idle"]);
  });

  it("cancels short pulls and respects the scroll-boundary override", () => {
    const onRefresh = vi.fn();
    const { rerender } = render(
      <PullToRefresh threshold={50} resistance={1} canPull={() => false} onRefresh={onRefresh}>
        内容
      </PullToRefresh>
    );
    const root = document.querySelector<HTMLElement>('[data-meu-component="pull-to-refresh"]')!;
    pull(root, 80);
    fireEvent.touchEnd(root, { touches: [] });
    expect(root.getAttribute("data-status")).toBe("idle");

    rerender(
      <PullToRefresh threshold={50} resistance={1} canPull={() => true} onRefresh={onRefresh}>
        内容
      </PullToRefresh>
    );
    pull(root, 30);
    fireEvent.touchEnd(root, { touches: [] });
    expect(root.getAttribute("data-status")).toBe("idle");
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it("checks a scrollable root before its ancestors", () => {
    const onRefresh = vi.fn(() => new Promise<void>(() => undefined));
    render(
      <PullToRefresh
        style={{ height: 100, overflowY: "auto" }}
        threshold={40}
        resistance={1}
        onRefresh={onRefresh}
      >
        内容
      </PullToRefresh>
    );
    const root = document.querySelector<HTMLElement>('[data-meu-component="pull-to-refresh"]')!;
    Object.defineProperty(root, "clientHeight", { configurable: true, value: 100 });
    Object.defineProperty(root, "scrollHeight", { configurable: true, value: 200 });

    root.scrollTop = 20;
    pull(root, 80);
    fireEvent.touchEnd(root, { touches: [] });
    expect(onRefresh).not.toHaveBeenCalled();

    root.scrollTop = 0;
    pull(root, 80);
    fireEvent.touchEnd(root, { touches: [] });
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("rechecks scrollTop before locking a downward gesture", () => {
    const onRefresh = vi.fn();
    render(
      <PullToRefresh
        style={{ height: 100, overflowY: "auto" }}
        threshold={40}
        resistance={1}
        onRefresh={onRefresh}
      >
        内容
      </PullToRefresh>
    );
    const root = document.querySelector<HTMLElement>('[data-meu-component="pull-to-refresh"]')!;
    Object.defineProperty(root, "clientHeight", { configurable: true, value: 100 });
    Object.defineProperty(root, "scrollHeight", { configurable: true, value: 200 });

    root.scrollTop = 0;
    fireEvent.touchStart(root, { touches: [{ clientX: 20, clientY: 20 }] });
    root.scrollTop = 12;
    const moveAccepted = fireEvent.touchMove(root, {
      touches: [{ clientX: 20, clientY: 90 }]
    });
    fireEvent.touchEnd(root, { touches: [] });

    expect(moveAccepted).toBe(true);
    expect(root.getAttribute("data-status")).toBe("idle");
    expect(root.getAttribute("data-pull-distance")).toBe("0");
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it("ignores sub-slop landing jitter before deciding the gesture direction", () => {
    const onRefresh = vi.fn(() => new Promise<void>(() => undefined));
    render(
      <PullToRefresh threshold={40} resistance={1} canPull={() => true} onRefresh={onRefresh}>
        内容
      </PullToRefresh>
    );
    const root = document.querySelector<HTMLElement>('[data-meu-component="pull-to-refresh"]')!;

    fireEvent.touchStart(root, { touches: [{ clientX: 20, clientY: 20 }] });
    fireEvent.touchMove(root, { touches: [{ clientX: 22, clientY: 19 }] });
    expect(root.getAttribute("data-status")).toBe("idle");
    expect(root.getAttribute("data-pull-distance")).toBe("0");

    fireEvent.touchMove(root, { touches: [{ clientX: 20, clientY: 80 }] });
    expect(root.getAttribute("data-status")).toBe("ready");
    fireEvent.touchEnd(root, { touches: [] });
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("normalizes unsafe pull geometry inputs", () => {
    render(
      <PullToRefresh
        threshold={Number.NaN}
        maxPullDistance={-1}
        resistance={Number.POSITIVE_INFINITY}
        canPull={() => true}
        onRefresh={() => undefined}
      >
        内容
      </PullToRefresh>
    );
    const root = document.querySelector<HTMLElement>('[data-meu-component="pull-to-refresh"]')!;

    pull(root, 100);
    expect(root.style.getPropertyValue("--meu-pull-to-refresh-threshold")).toBe("64px");
    expect(root.getAttribute("data-pull-distance")).toBe("45");
    expect(root.getAttribute("data-status")).toBe("pulling");
  });

  it("provides a native keyboard action as a non-gesture path", async () => {
    const onRefresh = vi.fn(() => new Promise<void>(() => undefined));
    const onStatusChange = vi.fn();
    render(
      <PullToRefresh completeDelay={10_000} onRefresh={onRefresh} onStatusChange={onStatusChange}>
        <p>库存</p>
      </PullToRefresh>
    );

    const action = screen.getByRole("button", { name: "刷新内容" });
    action.focus();
    expect(document.activeElement).toBe(action);
    fireEvent.click(action);
    fireEvent.click(action);
    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(1));
    expect(action.getAttribute("disabled")).not.toBeNull();
    expect(onStatusChange).toHaveBeenCalledWith("refreshing", {
      distance: 64,
      status: "refreshing",
      trigger: "keyboard"
    });
    expect(action.getAttribute("aria-controls")).toBeTruthy();
  });

  it("ignores a pending refresh result after unmount", async () => {
    let resolveRefresh!: () => void;
    const onStatusChange = vi.fn();
    const { unmount } = render(
      <PullToRefresh
        onRefresh={() =>
          new Promise<void>((resolve) => {
            resolveRefresh = resolve;
          })
        }
        onStatusChange={onStatusChange}
      >
        内容
      </PullToRefresh>
    );

    fireEvent.click(screen.getByRole("button", { name: "刷新内容" }));
    expect(onStatusChange).toHaveBeenCalledWith("refreshing", expect.any(Object));
    unmount();
    await act(() => {
      resolveRefresh();
      return Promise.resolve();
    });
    expect(onStatusChange).not.toHaveBeenCalledWith("complete", expect.any(Object));
  });

  it("clears the complete-state timer when unmounted", async () => {
    vi.useFakeTimers();
    const { unmount } = render(
      <PullToRefresh completeDelay={10_000} onRefresh={() => undefined}>
        内容
      </PullToRefresh>
    );
    const root = document.querySelector<HTMLElement>('[data-meu-component="pull-to-refresh"]')!;

    fireEvent.click(screen.getByRole("button", { name: "刷新内容" }));
    await act(() => Promise.resolve());
    expect(root.getAttribute("data-status")).toBe("complete");
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("reports refresh failures, returns to idle and permits retry", async () => {
    const error = new Error("offline");
    const onRefreshError = vi.fn();
    const onRefresh = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(undefined);
    render(
      <PullToRefresh completeDelay={10_000} onRefresh={onRefresh} onRefreshError={onRefreshError}>
        内容
      </PullToRefresh>
    );

    fireEvent.click(screen.getByRole("button", { name: "刷新内容" }));
    await waitFor(() => expect(onRefreshError).toHaveBeenCalledWith(error));
    expect(
      document.querySelector('[data-meu-component="pull-to-refresh"]')!.getAttribute("data-status")
    ).toBe("idle");

    fireEvent.click(screen.getByRole("button", { name: "刷新内容" }));
    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(
        document
          .querySelector('[data-meu-component="pull-to-refresh"]')!
          .getAttribute("data-status")
      ).toBe("complete")
    );
  });

  it("recovers when onRefresh throws synchronously", async () => {
    const error = new Error("synchronous failure");
    const onRefreshError = vi.fn();
    render(
      <PullToRefresh
        onRefresh={() => {
          throw error;
        }}
        onRefreshError={onRefreshError}
      >
        内容
      </PullToRefresh>
    );

    fireEvent.click(screen.getByRole("button", { name: "刷新内容" }));
    await waitFor(() => expect(onRefreshError).toHaveBeenCalledWith(error));
    expect(
      document.querySelector('[data-meu-component="pull-to-refresh"]')!.getAttribute("data-status")
    ).toBe("idle");
  });

  it("cancels active pulls on multitouch, touch cancellation and disabling", async () => {
    const onRefresh = vi.fn();
    const { rerender } = render(
      <PullToRefresh threshold={40} resistance={1} canPull={() => true} onRefresh={onRefresh}>
        内容
      </PullToRefresh>
    );
    const root = document.querySelector<HTMLElement>('[data-meu-component="pull-to-refresh"]')!;

    pull(root, 60);
    expect(root.getAttribute("data-status")).toBe("ready");
    fireEvent.touchStart(root, {
      touches: [
        { clientX: 20, clientY: 80 },
        { clientX: 40, clientY: 80 }
      ]
    });
    expect(root.getAttribute("data-status")).toBe("idle");

    pull(root, 60);
    fireEvent.touchCancel(root, { touches: [] });
    expect(root.getAttribute("data-status")).toBe("idle");

    pull(root, 60);
    fireEvent.pointerCancel(root, { pointerId: 1, pointerType: "touch" });
    expect(root.getAttribute("data-status")).toBe("idle");

    pull(root, 60);
    rerender(
      <PullToRefresh
        disabled
        threshold={40}
        resistance={1}
        canPull={() => true}
        onRefresh={onRefresh}
      >
        内容
      </PullToRefresh>
    );
    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    expect(root.getAttribute("data-status")).toBe("idle");
    fireEvent.touchEnd(root, { touches: [] });
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it("honors React 19 callback-ref cleanup without a legacy null callback", () => {
    const cleanupRef = vi.fn();
    const callbackRef = vi.fn((node: HTMLDivElement | null) => (node ? cleanupRef : undefined));
    const { unmount } = render(
      <PullToRefresh ref={callbackRef} onRefresh={() => undefined}>
        内容
      </PullToRefresh>
    );

    const root = document.querySelector<HTMLDivElement>('[data-meu-component="pull-to-refresh"]');
    expect(callbackRef).toHaveBeenCalledTimes(1);
    expect(callbackRef).toHaveBeenCalledWith(root);
    unmount();
    expect(cleanupRef).toHaveBeenCalledTimes(1);
    expect(callbackRef).toHaveBeenCalledTimes(1);
  });
});
