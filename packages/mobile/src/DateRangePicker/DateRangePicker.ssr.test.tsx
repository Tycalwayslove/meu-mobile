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

  it("renders localized names, presets and disabled boundary state without browser globals", () => {
    const html = renderToString(
      <DateRangePicker
        open
        aria-label="Delivery range"
        defaultMonth={date(1)}
        defaultValue={[date(8), date(10)]}
        max={date(10)}
        presets={[
          { key: "valid", label: "Short window", value: [date(8), date(10)] },
          { key: "invalid", label: "Long window", value: [date(8), date(12)] }
        ]}
      />
    );

    expect(html).toContain('aria-label="Delivery range"');
    expect(html).toContain('aria-label="快捷范围"');
    expect(html).toContain("Short window");
    const validPresetPosition = html.indexOf("Short window");
    const invalidPresetPosition = html.indexOf("Long window");
    expect(validPresetPosition).toBeGreaterThan(0);
    expect(invalidPresetPosition).toBeGreaterThan(validPresetPosition);
    expect(
      html.slice(html.lastIndexOf("<button", validPresetPosition), validPresetPosition)
    ).not.toContain('disabled=""');
    expect(
      html.slice(html.lastIndexOf("<button", invalidPresetPosition), invalidPresetPosition)
    ).toContain('disabled=""');
    expect(html).toContain('data-range-complete="true"');
  });
});
