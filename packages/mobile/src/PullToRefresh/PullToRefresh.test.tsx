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

  it("provides a native keyboard action as a non-gesture path", async () => {
    const onRefresh = vi.fn();
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
    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(1));
    expect(onStatusChange).toHaveBeenCalledWith("refreshing", {
      distance: 64,
      status: "refreshing",
      trigger: "keyboard"
    });
    expect(action.getAttribute("aria-controls")).toBeTruthy();
  });

  it("reports refresh failures and returns to idle", async () => {
    const error = new Error("offline");
    const onRefreshError = vi.fn();
    render(
      <PullToRefresh onRefresh={() => Promise.reject(error)} onRefreshError={onRefreshError}>
        内容
      </PullToRefresh>
    );

    fireEvent.click(screen.getByRole("button", { name: "刷新内容" }));
    await waitFor(() => expect(onRefreshError).toHaveBeenCalledWith(error));
    expect(
      document.querySelector('[data-meu-component="pull-to-refresh"]')!.getAttribute("data-status")
    ).toBe("idle");
  });
});
