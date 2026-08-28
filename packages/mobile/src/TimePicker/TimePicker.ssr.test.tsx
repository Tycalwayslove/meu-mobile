// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TimePicker } from "./TimePicker";

describe("TimePicker SSR", () => {
  it("renders deterministic twelve-hour columns and selected values", () => {
    const html = renderToString(
      <TimePicker
        open
        aria-label="Time"
        hourCycle="h12"
        defaultValue={{ hour: 13, minute: 30, second: 0 }}
      />
    );
    expect(html).toContain('data-meu-component="time-picker"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-label="时段"');
    expect(html).toContain("下午");
    expect(html).toContain('aria-selected="true"');
  });
});
