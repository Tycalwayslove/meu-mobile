// @vitest-environment jsdom
import { createDateParts, nativeDateAdapter } from "@meu/date-adapter";
import type { DateAdapter } from "@meu/date-adapter";
import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { Calendar } from "./Calendar";

const originalTimeZone = process.env.TZ;
const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];

function setTimeZone(timeZone: "America/New_York" | "UTC") {
  process.env.TZ = timeZone;
}

function localDate(day: number) {
  return nativeDateAdapter.fromParts(createDateParts({ day, month: 3, year: 2026 }))!;
}

function calendarForCurrentTimeZone() {
  const today = localDate(9);
  const adapter: DateAdapter<Date> = {
    ...nativeDateAdapter,
    now: () => today
  };

  return (
    <ConfigProvider locale="en-US">
      <Calendar
        adapter={adapter}
        aria-label="Delivery calendar"
        defaultMonth={localDate(1)}
        defaultValue={localDate(8)}
      />
    </ConfigProvider>
  );
}

function dateAttribute(container: HTMLElement, date: string, attribute: string) {
  const day = container.querySelector(`[data-date="${date}"]`);
  return day === null ? null : day.getAttribute(attribute);
}

async function hydrateAcrossTimeZones(
  serverTimeZone: "America/New_York" | "UTC",
  clientTimeZone: "America/New_York" | "UTC"
) {
  setTimeZone(serverTimeZone);
  const serverMarkup = renderToString(calendarForCurrentTimeZone());

  setTimeZone(clientTimeZone);
  const clientUi = calendarForCurrentTimeZone();
  const container = document.createElement("div");
  container.innerHTML = serverMarkup;
  document.body.append(container);
  const recoverableErrors: unknown[] = [];

  await act(async () => {
    mountedRoots.push(
      hydrateRoot(container, clientUi, {
        onRecoverableError: (error) => recoverableErrors.push(error)
      })
    );
    await Promise.resolve();
  });

  return { container, recoverableErrors, serverMarkup };
}

afterEach(async () => {
  await act(() => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  document.body.replaceChildren();
  if (originalTimeZone === undefined) delete process.env.TZ;
  else process.env.TZ = originalTimeZone;
});

describe("Calendar cross-timezone hydration", () => {
  it("hydrates UTC server markup in a DST-observing client timezone", async () => {
    setTimeZone("UTC");
    expect([localDate(8).getTimezoneOffset(), localDate(9).getTimezoneOffset()]).toEqual([0, 0]);

    setTimeZone("America/New_York");
    expect([localDate(8).getTimezoneOffset(), localDate(9).getTimezoneOffset()]).toEqual([
      300, 240
    ]);

    const { container, recoverableErrors, serverMarkup } = await hydrateAcrossTimeZones(
      "UTC",
      "America/New_York"
    );

    expect(recoverableErrors).toEqual([]);
    expect(serverMarkup).toContain("March 2026");
    expect(dateAttribute(container, "2026-03-08", "aria-pressed")).toBe("true");
    expect(dateAttribute(container, "2026-03-09", "aria-current")).toBe("date");
    expect(container.querySelectorAll('[role="gridcell"]')).toHaveLength(42);
  });

  it("hydrates DST-observing server markup in UTC", async () => {
    const { container, recoverableErrors, serverMarkup } = await hydrateAcrossTimeZones(
      "America/New_York",
      "UTC"
    );

    expect(recoverableErrors).toEqual([]);
    expect(serverMarkup).toContain('data-date="2026-03-08"');
    expect(serverMarkup).toContain('data-date="2026-03-09"');
    expect(dateAttribute(container, "2026-03-08", "aria-pressed")).toBe("true");
    expect(dateAttribute(container, "2026-03-09", "aria-current")).toBe("date");
  });
});
