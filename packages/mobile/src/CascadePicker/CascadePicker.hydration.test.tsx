// @vitest-environment jsdom
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CascadePicker } from "./CascadePicker";

const roots: Array<ReturnType<typeof hydrateRoot>> = [];
const containers: HTMLElement[] = [];

afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
    await Promise.resolve();
  });
  for (const container of containers.splice(0)) container.remove();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("CascadePicker hydration", () => {
  it("hydrates an explicit empty child column and accepts a later immutable branch", async () => {
    const pendingOptions = [{ label: "浙江省", value: "zhejiang", children: [] }] as const;
    const pending = (
      <CascadePicker
        lockScroll={false}
        open
        title="配送地区"
        columnLabels={["省份", "城市"]}
        options={pendingOptions}
        value={["zhejiang", null]}
      />
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(pending);
    document.body.append(container);
    containers.push(container);
    expect(container.querySelectorAll('[role="listbox"]')).toHaveLength(2);
    const serverConfirm = Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => button.textContent === "确定"
    );
    expect(serverConfirm ? serverConfirm.disabled : undefined).toBe(true);

    const recoverableErrors: unknown[] = [];
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const root = hydrateRoot(container, pending, {
      onRecoverableError: (error) => recoverableErrors.push(error)
    });
    roots.push(root);
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 50));
    });

    const hydratedPicker = document.body.querySelector('[data-meu-component="cascade-picker"]');
    expect(hydratedPicker).toBeTruthy();
    expect(container.contains(hydratedPicker)).toBe(false);
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();

    const loadedOptions = [
      {
        label: "浙江省",
        value: "zhejiang",
        children: [
          { disabled: true, label: "暂不可用", value: "unavailable" },
          { label: "杭州市", value: "hangzhou" }
        ]
      }
    ] as const;
    await act(async () => {
      root.render(
        <CascadePicker
          lockScroll={false}
          open
          title="配送地区"
          columnLabels={["省份", "城市"]}
          options={loadedOptions}
          value={["zhejiang", null]}
        />
      );
      await Promise.resolve();
    });

    const selectedCity = Array.from(
      document.body.querySelectorAll<HTMLElement>('[role="option"][aria-selected="true"]')
    ).find((option) => option.textContent === "杭州市");
    expect(selectedCity ? selectedCity.textContent : null).toBe("杭州市");
    const wheels = document.body.querySelectorAll<HTMLElement>('[role="listbox"]');
    expect(wheels).toHaveLength(2);
    for (const wheel of wheels) {
      const activeId = wheel.getAttribute("aria-activedescendant");
      expect(activeId).toBeTruthy();
      expect(activeId ? document.getElementById(activeId) : null).toBeTruthy();
    }
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
