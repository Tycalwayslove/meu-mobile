// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { TimePicker } from "./TimePicker";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];

afterEach(async () => {
  await act(() => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("TimePicker hydration", () => {
  it("hydrates deterministic twelve-hour seconds and keeps its portal interactive", async () => {
    const onConfirm = vi.fn();
    const element = (
      <ConfigProvider dir="rtl" locale="en-US" motion="reduced" theme="dark">
        <TimePicker
          open
          title="Hydrated delivery time"
          cancelText="Keep current time"
          confirmText="Confirm delivery time"
          defaultValue={{ hour: 13, minute: 30, second: 20 }}
          hourCycle="h12"
          precision="second"
          secondStep={10}
          onConfirm={onConfirm}
        />
      </ConfigProvider>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    const recoverableErrors: unknown[] = [];
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(container.querySelectorAll('[role="listbox"]')).toHaveLength(4);
    expect(container.querySelector('[role="option"][aria-selected="true"]')).toBeTruthy();

    await act(async () => {
      mountedRoots.push(
        hydrateRoot(container, element, {
          onRecoverableError: (error) => recoverableErrors.push(error)
        })
      );
      await Promise.resolve();
    });

    await waitFor(() => expect(container.querySelector('[role="dialog"]')).toBeNull());
    const dialog = screen.getByRole("dialog", { name: "Hydrated delivery time" });
    const layer = dialog.closest('[data-meu-overlay-layer="popup"]');
    expect(layer === null ? null : layer.parentElement).toBe(document.body);
    expect(layer === null ? null : layer.getAttribute("dir")).toBe("rtl");
    expect(layer === null ? null : layer.getAttribute("data-meu-motion")).toBe("reduced");
    expect(
      within(dialog)
        .getAllByRole("listbox")
        .map((wheel) => wheel.getAttribute("aria-label"))
    ).toEqual(["Hour", "Minute", "Second", "Period"]);

    fireEvent.click(within(dialog).getByRole("option", { name: "AM" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Confirm delivery time" }));
    expect(onConfirm).toHaveBeenCalledWith({ hour: 1, minute: 30, second: 20 });
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
