// @vitest-environment jsdom
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FloatingPanel } from "./FloatingPanel";

describe("FloatingPanel hydration", () => {
  it("reuses the server root before exposing the measured 300px anchor", async () => {
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
    const ui = (
      <FloatingPanel anchors={[160, 300, 440]} defaultHeight={300}>
        Hydrated panel content
      </FloatingPanel>
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
    let root: ReturnType<typeof hydrateRoot> | undefined;

    await act(async () => {
      root = hydrateRoot(container, ui, {
        onRecoverableError: (error) => recoverableErrors.push(error)
      });
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
    expect(recoverableErrors).toEqual([]);

    const hydratedReactRoot = root;
    if (!hydratedReactRoot) throw new Error("Expected hydrated React root");
    act(() => hydratedReactRoot.unmount());
    container.remove();
  });
});
