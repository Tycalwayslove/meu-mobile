// @vitest-environment jsdom
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Picker } from "./Picker";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];
const containers: HTMLElement[] = [];

afterEach(async () => {
  await act(async () => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    await Promise.resolve();
  });
  for (const container of containers.splice(0)) container.remove();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("Picker hydration", () => {
  it("hydrates an initially open wheel into the body portal without losing semantics", async () => {
    const ui = (
      <Picker
        lockScroll={false}
        open
        title="配送窗口"
        columnLabels={["日期", "时间"]}
        columns={[
          [
            { label: "今天", value: "today" },
            { label: "明天", value: "tomorrow" }
          ],
          [
            { label: "09:00", value: "09:00" },
            { label: "10:00", value: "10:00" }
          ]
        ]}
        defaultValue={["today", "09:00"]}
      />
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(ui);
    document.body.append(container);
    containers.push(container);

    const serverPicker = container.querySelector('[data-meu-component="picker"]');
    expect(serverPicker).toBeTruthy();
    expect(container.querySelectorAll('[role="listbox"]')).toHaveLength(2);
    expect(container.querySelectorAll('[role="option"][aria-selected="true"]')).toHaveLength(2);

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const recoverableErrors: unknown[] = [];
    await act(async () => {
      mountedRoots.push(
        hydrateRoot(container, ui, {
          onRecoverableError: (error) => recoverableErrors.push(error)
        })
      );
      await new Promise((resolve) => window.setTimeout(resolve, 50));
    });

    const hydratedPicker = document.body.querySelector('[data-meu-component="picker"]');
    expect(hydratedPicker).toBeTruthy();
    expect(container.contains(hydratedPicker)).toBe(false);
    const hydratedWheels = document.body.querySelectorAll<HTMLElement>('[role="listbox"]');
    expect(hydratedWheels).toHaveLength(2);
    expect(document.body.querySelectorAll('[role="option"][aria-selected="true"]')).toHaveLength(2);
    for (const wheel of hydratedWheels) {
      const activeId = wheel.getAttribute("aria-activedescendant");
      expect(activeId).toBeTruthy();
      expect(activeId ? document.getElementById(activeId) : null).toBeTruthy();
    }
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
