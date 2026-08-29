// @vitest-environment node
import { createDateParts, nativeDateAdapter } from "@meu/date-adapter";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Calendar } from "./Calendar";

function date(day: number) {
  return nativeDateAdapter.fromParts(createDateParts({ day, month: 8, year: 2026 }))!;
}

describe("Calendar SSR", () => {
  it("renders a named grid with deterministic day semantics", () => {
    const html = renderToString(
      <Calendar defaultMonth={date(1)} defaultValue={date(12)} aria-label="Delivery calendar" />
    );
    expect(html).toContain('data-meu-component="calendar"');
    expect(html).toContain('role="grid"');
    expect(html).toContain('aria-labelledby="meu-calendar-month-');
    expect(html).toContain('data-date="2026-08-12"');
    expect(html).toContain('aria-pressed="true"');
  });

  it("server-renders the caller's aria-invalid token only on the calendar root", () => {
    const html = renderToString(
      <Calendar defaultMonth={date(1)} aria-label="Delivery calendar" aria-invalid="grammar" />
    );

    expect(html).toContain('role="group"');
    expect(html).toContain('aria-invalid="grammar"');
    expect(html.match(/aria-invalid=/g)).toHaveLength(1);
  });
});
