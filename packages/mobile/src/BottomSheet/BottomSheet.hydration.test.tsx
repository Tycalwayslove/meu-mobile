// @vitest-environment jsdom
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BottomSheet } from "./BottomSheet";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];
const containers: HTMLElement[] = [];

afterEach(async () => {
  await act(async () => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    await Promise.resolve();
  });
  for (const container of containers.splice(0)) container.remove();
  vi.restoreAllMocks();
});

describe("BottomSheet hydration", () => {
  it("hydrates an initially open body portal and preserves its interactive dialog", async () => {
    const ui = (
      <BottomSheet open title="服务端面板" snapPoints={[0.5, 0.9]}>
        <button type="button">确认</button>
      </BottomSheet>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(ui);
    document.body.append(container);
    containers.push(container);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await act(async () => {
      mountedRoots.push(hydrateRoot(container, ui));
      await new Promise((resolve) => window.setTimeout(resolve, 50));
    });
    const dialog = document.body.querySelector<HTMLElement>(
      '[role="dialog"][aria-label="服务端面板"], [role="dialog"][aria-labelledby]'
    );
    expect(dialog ? dialog.getAttribute("data-meu-component") : null).toBe("bottom-sheet");
    expect(
      Array.from(dialog ? dialog.querySelectorAll("button") : []).some(
        (button) => button.textContent === "确认"
      )
    ).toBe(true);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
