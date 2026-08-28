// @vitest-environment node
import { createDateParts, nativeDateAdapter } from "@meu/date-adapter";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DatePicker } from "./DatePicker";

function date(parts: Parameters<typeof createDateParts>[0]) {
  return nativeDateAdapter.fromParts(createDateParts(parts))!;
}

describe("DatePicker SSR", () => {
  it("renders a deterministic named dialog and date columns", () => {
    const html = renderToString(
      <DatePicker
        open
        title="预约日期"
        min={date({ year: 2026 })}
        max={date({ day: 31, month: 12, year: 2026 })}
        defaultValue={date({ day: 29, month: 8, year: 2026 })}
      />
    );
    expect(html).toContain('data-meu-component="date-picker"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-label="年"');
    expect(html).toContain('aria-label="月"');
    expect(html).toContain('aria-label="日"');
    expect(html).toContain('aria-selected="true"');
  });
});
