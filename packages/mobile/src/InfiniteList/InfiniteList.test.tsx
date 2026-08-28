// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { InfiniteList } from "./InfiniteList";

type ObserverRecord = {
  callback: IntersectionObserverCallback;
  disconnect: ReturnType<typeof vi.fn>;
  observe: ReturnType<typeof vi.fn>;
  options: IntersectionObserverInit | undefined;
};

const observers: ObserverRecord[] = [];

beforeEach(() => {
  observers.length = 0;
  class MockIntersectionObserver {
    readonly root = null;
    readonly rootMargin = "0px";
    readonly thresholds = [0];
    disconnect = vi.fn();
    observe = vi.fn();
    takeRecords = vi.fn(() => []);
    unobserve = vi.fn();

    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      observers.push({ callback, disconnect: this.disconnect, observe: this.observe, options });
    }
  }
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function intersect(record: ObserverRecord) {
  record.callback(
    [{ isIntersecting: true } as IntersectionObserverEntry],
    {} as IntersectionObserver
  );
}

describe("InfiniteList", () => {
  it("preloads from the nearest scroll root and locks concurrent requests", async () => {
    let resolveLoad!: () => void;
    const loadMore = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveLoad = resolve;
        })
    );
    const onStatusChange = vi.fn();
    const { container } = render(
      <div
        data-testid="scroller"
        ref={(node) => {
          if (!node) return;
          Object.defineProperty(node, "clientHeight", { configurable: true, value: 200 });
          Object.defineProperty(node, "scrollHeight", { configurable: true, value: 500 });
        }}
        style={{ height: 200, overflowY: "auto" }}
      >
        <InfiniteList hasMore loadMore={loadMore} threshold={120} onStatusChange={onStatusChange} />
      </div>
    );
    const scroller = screen.getByTestId("scroller");

    await waitFor(() => expect(observers).toHaveLength(1));
    expect(observers[0]!.options).toMatchObject({
      root: scroller,
      rootMargin: "0px 0px 120px 0px",
      threshold: 0
    });
    act(() => intersect(observers[0]!));
    act(() => intersect(observers[0]!));
    expect(loadMore).toHaveBeenCalledTimes(1);
    expect(
      container.querySelector('[data-meu-component="infinite-list"]')!.getAttribute("data-status")
    ).toBe("loading");
    expect(onStatusChange).toHaveBeenCalledWith("loading", { trigger: "auto" });

    await act(() => {
      resolveLoad();
      return Promise.resolve();
    });
    expect(
      container.querySelector('[data-meu-component="infinite-list"]')!.getAttribute("data-status")
    ).toBe("idle");
  });

  it("stops automatic retries after an error and retries explicitly", async () => {
    const error = new Error("offline");
    let attempt = 0;
    const loadMore = vi.fn(() => {
      attempt += 1;
      return attempt === 1 ? Promise.reject(error) : Promise.resolve();
    });
    const onLoadError = vi.fn();
    render(<InfiniteList autoLoad={false} hasMore loadMore={loadMore} onLoadError={onLoadError} />);

    fireEvent.click(screen.getByRole("button", { name: "加载更多" }));
    await waitFor(() => expect(onLoadError).toHaveBeenCalledWith(error));
    expect(screen.getAllByText("加载更多内容失败")).toHaveLength(2);
    expect(observers).toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: "重试" }));
    await waitFor(() => expect(loadMore).toHaveBeenCalledTimes(2));
    expect(screen.getByRole("button", { name: "加载更多" })).toBeTruthy();
  });

  it("uses hasMore as the only completion source", async () => {
    const { rerender } = render(
      <InfiniteList autoLoad={false} hasMore loadMore={() => Promise.resolve()} />
    );
    rerender(<InfiniteList autoLoad={false} hasMore={false} loadMore={() => Promise.resolve()} />);
    await waitFor(() => expect(screen.getAllByText("没有更多内容了")).toHaveLength(2));
    expect(
      document.querySelector('[data-meu-component="infinite-list"]')!.getAttribute("data-status")
    ).toBe("complete");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("keeps a localized native button when observers are unavailable", async () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const loadMore = vi.fn(() => Promise.resolve());
    render(
      <ConfigProvider locale="en-US">
        <InfiniteList hasMore loadMore={loadMore} />
      </ConfigProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    await waitFor(() => expect(loadMore).toHaveBeenCalledTimes(1));
  });

  it("disables the manual path and exposes custom render actions", async () => {
    const loadMore = vi.fn(() => Promise.resolve());
    const { rerender } = render(
      <InfiniteList autoLoad={false} disabled hasMore loadMore={loadMore} />
    );
    expect(screen.getByRole("button", { name: "加载更多" }).hasAttribute("disabled")).toBe(true);

    rerender(
      <InfiniteList
        autoLoad={false}
        hasMore
        loadMore={loadMore}
        renderContent={(status) => <span>自定义 {status}</span>}
      />
    );
    expect(screen.getByText("自定义 idle")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "加载更多" }));
    await waitFor(() => expect(loadMore).toHaveBeenCalledTimes(1));
  });

  it("disables retry and ignores a stale rejection after external completion", async () => {
    let rejectLoad!: (error: unknown) => void;
    const error = new Error("stale offline response");
    const loadMore = vi.fn(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectLoad = reject;
        })
    );
    const onLoadError = vi.fn();
    const onStatusChange = vi.fn();
    const { rerender } = render(
      <InfiniteList
        autoLoad={false}
        hasMore
        loadMore={loadMore}
        onLoadError={onLoadError}
        onStatusChange={onStatusChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "加载更多" }));
    rerender(
      <InfiniteList
        autoLoad={false}
        hasMore={false}
        loadMore={loadMore}
        onLoadError={onLoadError}
        onStatusChange={onStatusChange}
      />
    );
    await act(async () => {
      rejectLoad(error);
      await Promise.resolve();
    });

    expect(onLoadError).not.toHaveBeenCalled();
    expect(document.querySelector('[data-status="complete"]')).not.toBeNull();

    rerender(
      <InfiniteList autoLoad={false} disabled hasMore loadMore={() => Promise.reject(error)} />
    );
    expect(screen.getByRole("button", { name: "加载更多" }).hasAttribute("disabled")).toBe(true);
  });

  it("allows a new pagination generation after completion invalidates a stuck request", async () => {
    const firstLoad = vi.fn(() => new Promise<void>(() => undefined));
    const secondLoad = vi.fn(() => Promise.resolve());
    const { rerender } = render(<InfiniteList autoLoad={false} hasMore loadMore={firstLoad} />);
    fireEvent.click(screen.getByRole("button", { name: "加载更多" }));
    expect(firstLoad).toHaveBeenCalledTimes(1);

    rerender(<InfiniteList autoLoad={false} hasMore={false} loadMore={firstLoad} />);
    rerender(<InfiniteList autoLoad={false} hasMore loadMore={secondLoad} />);
    fireEvent.click(screen.getByRole("button", { name: "加载更多" }));

    await waitFor(() => expect(secondLoad).toHaveBeenCalledTimes(1));
  });

  it("does not revive an old error after hasMore completes and later reopens", async () => {
    const error = new Error("offline");
    const loadMore = vi.fn(() => Promise.reject(error));
    const { rerender } = render(
      <InfiniteList autoLoad={false} hasMore loadMore={loadMore} onLoadError={() => undefined} />
    );
    fireEvent.click(screen.getByRole("button", { name: "加载更多" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "重试" })).toBeTruthy());

    rerender(
      <InfiniteList
        autoLoad={false}
        hasMore={false}
        loadMore={loadMore}
        onLoadError={() => undefined}
      />
    );
    rerender(
      <InfiniteList autoLoad={false} hasMore loadMore={loadMore} onLoadError={() => undefined} />
    );

    expect(screen.queryByRole("button", { name: "重试" })).toBeNull();
    expect(screen.getByRole("button", { name: "加载更多" })).toBeTruthy();
    expect(document.querySelector('[data-status="idle"]')).not.toBeNull();
  });
});
