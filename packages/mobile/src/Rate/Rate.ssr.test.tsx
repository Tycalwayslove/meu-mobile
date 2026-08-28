import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Rate } from "./Rate";

describe("Rate SSR", () => {
  it("renders stable interactive and read-only form markup", () => {
    const interactive = renderToString(<Rate aria-label="评分" defaultValue={3} />);
    const readOnly = renderToString(
      <Rate aria-label="只读评分" name="rating" value={4} readOnly />
    );
    expect(interactive).toContain('type="range"');
    expect(interactive).toContain('aria-valuetext="3 / 5 星"');
    expect(readOnly).toContain('role="meter"');
    expect(readOnly).toContain('type="hidden"');
    expect(readOnly).toContain('name="rating"');
  });
});
