// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { InfiniteList } from "./InfiniteList";
import type { InfiniteListLoadContext } from "./types";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];
const containers: HTMLElement[] = [];

afterEach(async () => {
  await act(() => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  for (const container of containers.splice(0)) container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function createServerContainer(element: React.ReactElement) {
  const container = document.createElement("div");
  container.innerHTML = renderToString(element);
  document.body.append(container);
  containers.push(container);
  return container;
}

describe("InfiniteList hydration", () => {
  it("hydrates the SSR manual fallback before installing IntersectionObserver", async () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    class MockIntersectionObserver {
      readonly root = null;
      readonly rootMargin = "0px";
      readonly thresholds = [0];
      observe = observe;
      disconnect = disconnect;
      takeRecords = vi.fn(() => []);
      unobserve = vi.fn();
      constructor(callback: IntersectionObserverCallback) {
        void callback;
      }
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    const loadMore = vi.fn((context: InfiniteListLoadContext) => {
      void context;
      return Promise.resolve();
    });
    const element = createElement(InfiniteList, { hasMore: true, loadMore });
    const container = createServerContainer(element);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const serverAction = container.querySelector("button");
    expect(serverAction && serverAction.textContent).toBe("加载更多");
    await act(async () => {
      mountedRoots.push(hydrateRoot(container, element));
      await Promise.resolve();
    });

    expect(observe).toHaveBeenCalledWith(
      container.querySelector('[data-meu-component="infinite-list"]')
    );
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("keeps the hydrated native action usable when IntersectionObserver is absent", async () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const loadMore = vi.fn((context: InfiniteListLoadContext) => {
      void context;
      return Promise.resolve();
    });
    const element = createElement(InfiniteList, { hasMore: true, loadMore });
    const container = createServerContainer(element);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await act(async () => {
      mountedRoots.push(hydrateRoot(container, element));
      await Promise.resolve();
    });
    fireEvent.click(container.querySelector("button")!);
    await act(() => Promise.resolve());

    expect(loadMore).toHaveBeenCalledTimes(1);
    expect(loadMore.mock.calls[0]![0]).toMatchObject({ trigger: "manual" });
    expect(consoleError).not.toHaveBeenCalled();
  });
});
