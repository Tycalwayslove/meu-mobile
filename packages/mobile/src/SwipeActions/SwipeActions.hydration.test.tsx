// @vitest-environment jsdom
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { SwipeActions } from "./SwipeActions";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];

function scenario() {
  return (
    <ConfigProvider dir="rtl" locale="en-US" motion="reduced" theme="dark">
      <SwipeActions
        defaultOpenSide="right"
        leftActions={[{ key: "pin", label: "Pin for later", tone: "accent" }]}
        rightActions={[
          { key: "archive", label: "Archive order" },
          {
            "aria-label": "Delete order permanently",
            key: "delete",
            label: <span aria-hidden="true">Delete</span>,
            tone: "danger"
          }
        ]}
      >
        <button type="button">Open order details</button>
      </SwipeActions>
    </ConfigProvider>
  );
}

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class MockResizeObserver {
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
    const width = side === "left" ? 112 : side === "right" ? 224 : 390;
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
});

afterEach(async () => {
  await act(async () => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    await Promise.resolve();
  });
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("SwipeActions hydration", () => {
  it("keeps default-open rails hidden on the server and reveals the measured physical side", async () => {
    const ui = scenario();
    const container = document.createElement("div");
    container.innerHTML = renderToString(ui);
    document.body.append(container);
    const serverRoot = container.querySelector<HTMLElement>('[data-meu-component="swipe-actions"]');
    if (!serverRoot) throw new Error("Expected server SwipeActions root");
    expect(serverRoot.getAttribute("data-open-side")).toBe("none");
    expect(serverRoot.getAttribute("data-offset")).toBe("0");
    const serverRightGroup = serverRoot.querySelector<HTMLElement>(
      '[data-meu-swipe-actions-group="right"]'
    );
    if (!serverRightGroup) throw new Error("Expected server physical-right action rail");
    expect(serverRightGroup.getAttribute("aria-hidden")).toBe("true");

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const recoverableErrors: unknown[] = [];
    await act(async () => {
      mountedRoots.push(
        hydrateRoot(container, ui, {
          onRecoverableError: (error) => recoverableErrors.push(error)
        })
      );
      await new Promise((resolve) => window.setTimeout(resolve, 20));
    });

    const hydratedRoot = container.querySelector<HTMLElement>(
      '[data-meu-component="swipe-actions"]'
    );
    if (!hydratedRoot) throw new Error("Expected hydrated SwipeActions root");
    expect(hydratedRoot).toBe(serverRoot);
    expect(hydratedRoot.closest('[dir="rtl"]')).toBeTruthy();
    expect(hydratedRoot.getAttribute("data-open-side")).toBe("right");
    expect(hydratedRoot.getAttribute("data-offset")).toBe("-224");
    const rightGroup = hydratedRoot.querySelector<HTMLElement>(
      '[data-meu-swipe-actions-group="right"]'
    );
    if (!rightGroup) throw new Error("Expected hydrated physical-right action rail");
    expect(rightGroup.hasAttribute("aria-hidden")).toBe(false);
    expect(rightGroup.getAttribute("aria-label")).toBe("Right actions");
    const dangerAction = rightGroup.querySelector<HTMLButtonElement>('[data-action-key="delete"]');
    if (!dangerAction) throw new Error("Expected hydrated danger action");
    expect(dangerAction.getAttribute("aria-label")).toBe("Delete order permanently");
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
