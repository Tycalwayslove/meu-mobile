// @vitest-environment jsdom
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { PullToRefresh } from "./PullToRefresh";

describe("PullToRefresh hydration", () => {
  it("reuses its deterministic idle root and preserves the localized native action", async () => {
    const onRefresh = vi.fn(() => new Promise<void>(() => undefined));
    const ui = (
      <ConfigProvider dir="rtl" locale="en-US" motion="reduced" theme="dark">
        <PullToRefresh
          actionLabel="Refresh the complete international order history"
          onRefresh={onRefresh}
        >
          Hydrated refresh content
        </PullToRefresh>
      </ConfigProvider>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(ui);
    document.body.append(container);
    const serverRoot = container.querySelector<HTMLElement>(
      '[data-meu-component="pull-to-refresh"]'
    );
    if (!serverRoot) throw new Error("Expected server PullToRefresh root");
    const serverContent = serverRoot.querySelector<HTMLElement>("[id]");
    if (!serverContent) throw new Error("Expected server PullToRefresh content id");
    const serverContentId = serverContent.id;
    const recoverableErrors: unknown[] = [];
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    let root: ReturnType<typeof hydrateRoot> | undefined;

    await act(async () => {
      root = hydrateRoot(container, ui, {
        onRecoverableError: (error) => recoverableErrors.push(error)
      });
      await Promise.resolve();
    });

    const hydratedRoot = container.querySelector<HTMLElement>(
      '[data-meu-component="pull-to-refresh"]'
    );
    if (!hydratedRoot) throw new Error("Expected hydrated PullToRefresh root");
    expect(hydratedRoot).toBe(serverRoot);
    expect(hydratedRoot.getAttribute("data-status")).toBe("idle");
    expect(hydratedRoot.getAttribute("data-pull-distance")).toBe("0");
    const action = hydratedRoot.querySelector<HTMLButtonElement>("button");
    if (!action) throw new Error("Expected hydrated PullToRefresh action");
    expect(action.textContent).toBe("Refresh the complete international order history");
    expect(action.getAttribute("aria-controls")).toBe(serverContentId);
    const provider = hydratedRoot.closest<HTMLElement>('[data-meu-component="config-provider"]');
    expect(provider ? provider.getAttribute("dir") : null).toBe("rtl");
    expect(provider ? provider.getAttribute("data-meu-motion") : null).toBe("reduced");
    expect(provider ? provider.getAttribute("data-meu-theme") : null).toBe("dark");
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();

    act(() => action.click());
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(hydratedRoot.getAttribute("data-status")).toBe("refreshing");
    expect(hydratedRoot.getAttribute("aria-busy")).toBe("true");

    const hydratedReactRoot = root;
    if (!hydratedReactRoot) throw new Error("Expected hydrated React root");
    act(() => hydratedReactRoot.unmount());
    container.remove();
  });
});
