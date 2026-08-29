// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Watermark } from "./Watermark";

describe("Watermark SSR", () => {
  it("renders stable decorative markup without DOM globals", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
    const markup = renderToString(
      <Watermark content={["SSR", "内部资料"]} image="/watermark.svg">
        内容
      </Watermark>
    );
    expect(markup).toContain('data-meu-component="watermark"');
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain('focusable="false"');
    expect(markup).toContain("meu-watermark-");
    expect(markup).toContain("/watermark.svg");
  });
});
