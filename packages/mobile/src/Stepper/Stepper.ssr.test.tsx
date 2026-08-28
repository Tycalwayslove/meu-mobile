import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Stepper } from "./Stepper";

describe("Stepper SSR", () => {
  it("renders a deterministic spinbutton and native buttons", () => {
    const html = renderToString(
      <Stepper aria-label="数量" defaultValue={2} min={0} max={8} name="quantity" />
    );
    expect(html).toContain('role="spinbutton"');
    expect(html).toContain('name="quantity"');
    expect(html).toContain('value="2"');
    expect(html.match(/type="button"/g)).toHaveLength(2);
  });
});
