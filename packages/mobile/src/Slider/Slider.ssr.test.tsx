import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Slider } from "./Slider";

describe("Slider SSR", () => {
  it("renders stable native range markup without browser globals", () => {
    const html = renderToString(
      <Slider
        aria-invalid="grammar"
        aria-label="价格"
        defaultValue={35}
        min={0}
        max={100}
        showValue
      />
    );
    expect(html).toContain('type="range"');
    expect(html).toContain('value="35"');
    expect(html).toContain('aria-invalid="grammar"');
    expect(html).toContain("<output");
  });
});
