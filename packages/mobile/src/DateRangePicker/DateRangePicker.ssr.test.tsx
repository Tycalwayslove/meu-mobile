// @vitest-environment node
import { createDateParts, nativeDateAdapter } from "@meu/date-adapter";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DateRangePicker } from "./DateRangePicker";

function date(day: number) {
  return nativeDateAdapter.fromParts(createDateParts({ day, month: 8, year: 2026 }))!;
}

describe("DateRangePicker SSR", () => {
  it("renders dialog, range summary and calendar grid", () => {
    const html = renderToString(
      <DateRangePicker
        open
        title="配送日期"
        defaultMonth={date(1)}
        defaultValue={[date(8), date(12)]}
      />
    );
    expect(html).toContain('data-meu-component="date-range-picker"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain("2026-08-08");
    expect(html).toContain("2026-08-12");
    expect(html).toContain('role="grid"');
  });
});
