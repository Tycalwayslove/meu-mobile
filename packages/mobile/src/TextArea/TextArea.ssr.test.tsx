// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TextArea } from "./TextArea";

describe("TextArea SSR", () => {
  it("renders autosize, counter, and read-only markup without browser globals", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");

    const markup = renderToString(
      <TextArea
        aria-invalid="grammar"
        aria-label="Server note"
        autoSize={{ minRows: 2, maxRows: 5 }}
        defaultValue="Meu"
        dir="rtl"
        maxLength={20}
        readOnly
        showCount
      />
    );

    expect(markup).toContain('data-meu-component="text-area"');
    expect(markup).toContain('data-auto-size="true"');
    expect(markup).toContain('data-state="readonly"');
    expect(markup.match(/dir="rtl"/g)).toHaveLength(2);
    expect(markup).toContain('aria-invalid="grammar"');
    expect(markup.replace("<!-- -->", "")).toContain("3 / 20");
    expect(markup).not.toContain("aria-live");
  });
});
