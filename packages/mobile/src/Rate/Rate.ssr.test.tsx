import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
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

  it("normalizes invalid numeric inputs and renders localized value text without browser globals", () => {
    const markup = renderToString(
      <ConfigProvider locale="en-US" dir="rtl" motion="reduced" theme="dark">
        <Rate aria-label="Rating" count={Number.POSITIVE_INFINITY} value={2.7} allowHalf />
      </ConfigProvider>
    );
    expect(markup).toContain('dir="rtl"');
    expect(markup).toContain('lang="en-US"');
    expect(markup).toContain('data-meu-motion="reduced"');
    expect(markup).toContain('data-meu-theme="dark"');
    expect(markup).toContain('max="5"');
    expect(markup).toContain('step="0.5"');
    expect(markup).toContain('value="2.5"');
    expect(markup).toContain('aria-valuetext="2.5 of 5 stars"');
  });

  it("keeps disabled read-only values out of native submission", () => {
    const markup = renderToString(
      <Rate aria-label="Archived rating" name="rating" value={4} readOnly disabled />
    );
    expect(markup).toContain('role="meter"');
    expect(markup).toContain('type="hidden"');
    expect(markup).toContain('name="rating"');
    expect(markup).toContain("disabled");
  });
});
