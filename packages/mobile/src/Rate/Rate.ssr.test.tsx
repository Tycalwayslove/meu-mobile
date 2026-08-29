import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Rate } from "./Rate";

describe("Rate SSR", () => {
  it("renders stable interactive and read-only form markup", () => {
    const interactive = renderToString(
      <Rate aria-invalid="grammar" aria-label="评分" defaultValue={3} />
    );
    const readOnly = renderToString(
      <Rate aria-invalid="spelling" aria-label="只读评分" name="rating" value={4} readOnly />
    );
    const contextualError = renderToString(
      <Rate aria-invalid="grammar" aria-label="错误评分" status="error" />
    );
    expect(interactive).toContain('type="range"');
    expect(interactive).toContain('aria-valuetext="3 / 5 星"');
    expect(interactive).toContain('aria-invalid="grammar"');
    expect(readOnly).toContain('role="meter"');
    expect(readOnly).toContain('aria-invalid="spelling"');
    expect(readOnly.match(/aria-invalid=/g)).toHaveLength(1);
    expect(readOnly).toContain('type="hidden"');
    expect(readOnly).toContain('name="rating"');
    expect(contextualError).toContain('aria-invalid="true"');
    expect(contextualError).not.toContain('aria-invalid="grammar"');
  });
});
