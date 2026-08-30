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

  it("renders a stable read-only meter and hidden form value", () => {
    const html = renderToString(
      <Slider aria-label="已核预算" name="budget" value={35} readOnly showValue />
    );
    expect(html).toContain('role="meter"');
    expect(html).toContain('aria-valuenow="35"');
    expect(html).toContain('type="hidden"');
    expect(html).toContain('name="budget"');
    expect(html.match(/aria-label="已核预算"/g)).toHaveLength(1);
  });

  it("normalizes decimal bounds identically during server rendering", () => {
    const html = renderToString(
      <Slider aria-label="比例" min={0.1} max={1} step={0.2} value={0.8} showValue />
    );
    expect(html).toContain('min="0.1"');
    expect(html).toContain('max="0.9"');
    expect(html).toContain('step="0.2"');
    expect(html).toContain('value="0.9"');
    expect(html).toContain(">0.9</output>");
  });
});
