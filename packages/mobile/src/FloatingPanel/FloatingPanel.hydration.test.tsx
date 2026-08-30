// @vitest-environment jsdom
import { act, fireEvent, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { FloatingPanel } from "./FloatingPanel";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];

afterEach(async () => {
  await act(async () => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    await Promise.resolve();
  });
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("FloatingPanel hydration", () => {
  it("reuses the server root before exposing the measured 300px anchor", async () => {
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
    const onHeightChange = vi.fn();
    const ui = (
      <ConfigProvider dir="rtl" locale="en-US" motion="reduced" theme="dark">
        <FloatingPanel
          anchors={[160, 300, 440]}
          defaultHeight={300}
          onHeightChange={onHeightChange}
        >
          Hydrated panel content
        </FloatingPanel>
      </ConfigProvider>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(ui);
    document.body.append(container);
    const serverRoot = container.querySelector<HTMLElement>(
      '[data-meu-component="floating-panel"]'
    );
    if (!serverRoot) throw new Error("Expected server FloatingPanel root");
    expect(serverRoot.getAttribute("data-measured")).toBe("false");
    expect(serverRoot.getAttribute("data-current-height")).toBe("0");
    const recoverableErrors: unknown[] = [];
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await act(async () => {
      mountedRoots.push(
        hydrateRoot(container, ui, {
          onRecoverableError: (error) => recoverableErrors.push(error)
        })
      );
      await Promise.resolve();
    });

    const hydratedRoot = container.querySelector<HTMLElement>(
      '[data-meu-component="floating-panel"]'
    );
    if (!hydratedRoot) throw new Error("Expected hydrated FloatingPanel root");
    expect(hydratedRoot).toBe(serverRoot);
    expect(hydratedRoot.getAttribute("data-measured")).toBe("true");
    expect(hydratedRoot.getAttribute("data-current-height")).toBe("300");
    expect(hydratedRoot.getAttribute("data-anchor-index")).toBe("1");
    expect(hydratedRoot.style.height).toBe("440px");
    expect(hydratedRoot.style.getPropertyValue("--meu-floating-panel-translate")).toBe("140px");
    expect(hydratedRoot.getAttribute("dir")).toBe("rtl");
    expect(hydratedRoot.getAttribute("lang")).toBe("en-US");
    expect(hydratedRoot.getAttribute("data-meu-motion")).toBe("reduced");
    expect(hydratedRoot.getAttribute("data-meu-theme")).toBe("dark");
    fireEvent.keyDown(screen.getByRole("button", { name: "Adjust floating panel height" }), {
      key: "End"
    });
    expect(hydratedRoot.getAttribute("data-current-height")).toBe("440");
    expect(onHeightChange).toHaveBeenCalledWith(440, { index: 2, reason: "keyboard" });
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
