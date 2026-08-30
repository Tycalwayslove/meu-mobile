// @vitest-environment jsdom
import { createDateParts, nativeDateAdapter } from "@meu/date-adapter";
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { DateRangePicker } from "./DateRangePicker";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];

function date(day: number, month = 8) {
  return nativeDateAdapter.fromParts(createDateParts({ day, month, year: 2026 }))!;
}

afterEach(async () => {
  await act(async () => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    await Promise.resolve();
  });
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("DateRangePicker hydration", () => {
  it("hydrates an initially open cross-month range into the body portal without recovery", async () => {
    const onConfirm = vi.fn();
    const ui = (
      <ConfigProvider dir="rtl" locale="en-US" motion="reduced" theme="dark">
        <DateRangePicker
          lockScroll={false}
          open
          title="Delivery date range"
          defaultMonth={date(1)}
          defaultValue={[date(30), date(2, 9)]}
          min={date(28)}
          max={date(5, 9)}
          presets={[{ key: "window", label: "Delivery window", value: [date(30), date(2, 9)] }]}
          onConfirm={onConfirm}
        />
      </ConfigProvider>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(ui);
    document.body.append(container);

    expect(container.querySelector('[data-meu-component="date-range-picker"]')).toBeTruthy();
    expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    expect(container.querySelector('[data-range-complete="true"]')).toBeTruthy();

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

    await waitFor(() => expect(container.querySelector('[role="dialog"]')).toBeNull());
    const dialog = screen.getByRole("dialog", { name: "Delivery date range" });
    const overlay = dialog.closest('[data-meu-overlay-layer="popup"]');
    expect(overlay === null ? null : overlay.getAttribute("dir")).toBe("rtl");
    expect(within(dialog).getByRole("group", { name: "Date range calendar" })).toBeTruthy();
    expect(within(dialog).getByRole("list", { name: "Quick ranges" })).toBeTruthy();

    fireEvent.click(within(dialog).getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
