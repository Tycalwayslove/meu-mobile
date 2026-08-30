// @vitest-environment jsdom
import { createDateParts, nativeDateAdapter } from "@meu/date-adapter";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { DatePicker } from "./DatePicker";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];

function date(parts: Parameters<typeof createDateParts>[0]) {
  return nativeDateAdapter.fromParts(createDateParts(parts))!;
}

function datePicker(now: Date) {
  const adapter = { ...nativeDateAdapter, now: () => now };
  return (
    <ConfigProvider locale="en-US">
      <DatePicker
        adapter={adapter}
        lockScroll={false}
        open
        title="Delivery date and time"
        precision="minute"
        minuteStep={15}
        min={date({ day: 30, hour: 23, month: 8, year: 2026 })}
        max={date({ day: 31, hour: 1, month: 8, year: 2026 })}
        defaultValue={date({ day: 31, hour: 0, minute: 15, month: 8, year: 2026 })}
      />
    </ConfigProvider>
  );
}

afterEach(async () => {
  await act(async () => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    await Promise.resolve();
  });
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("DatePicker hydration", () => {
  it("hydrates deterministic explicit bounds across midnight and preserves portal semantics", async () => {
    const serverUi = datePicker(date({ day: 30, hour: 23, minute: 59, month: 8, year: 2026 }));
    const clientUi = datePicker(date({ day: 31, hour: 0, minute: 1, month: 8, year: 2026 }));
    const container = document.createElement("div");
    container.innerHTML = renderToString(serverUi);
    document.body.append(container);

    expect(container.querySelector('[data-meu-component="date-picker"]')).toBeTruthy();
    expect(container.querySelectorAll('[role="listbox"]')).toHaveLength(5);
    expect(container.querySelectorAll('[role="option"][aria-selected="true"]')).toHaveLength(5);

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const recoverableErrors: unknown[] = [];
    await act(async () => {
      mountedRoots.push(
        hydrateRoot(container, clientUi, {
          onRecoverableError: (error) => recoverableErrors.push(error)
        })
      );
      await new Promise((resolve) => window.setTimeout(resolve, 50));
    });

    const hydratedPicker = document.body.querySelector('[data-meu-component="date-picker"]');
    expect(hydratedPicker).toBeTruthy();
    expect(container.contains(hydratedPicker)).toBe(false);
    const wheels = document.body.querySelectorAll<HTMLElement>('[role="listbox"]');
    expect(wheels).toHaveLength(5);
    expect(Array.from(wheels, (wheel) => wheel.getAttribute("aria-label"))).toEqual([
      "Year",
      "Month",
      "Day",
      "Hour",
      "Minute"
    ]);
    for (const wheel of wheels) {
      const activeId = wheel.getAttribute("aria-activedescendant");
      expect(activeId).toBeTruthy();
      expect(activeId ? document.getElementById(activeId) : null).toBeTruthy();
    }
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
