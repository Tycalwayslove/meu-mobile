// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Selector } from "./Selector";

describe("Selector SSR", () => {
  it("renders stable native selection markup without browser globals", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");

    const markup = renderToString(
      <Selector
        aria-invalid="grammar"
        aria-label="Shipping"
        defaultValue={["delivery"]}
        name="shipping"
        options={[
          { label: "Delivery", value: "delivery" },
          { label: "Pickup", value: "pickup" }
        ]}
        required
      />
    );

    expect(markup).toContain('data-meu-component="selector"');
    expect(markup).toContain('role="radiogroup"');
    expect(markup).toContain('aria-invalid="grammar"');
    expect(markup).toContain('type="radio"');
    expect(markup).toContain('name="shipping"');
    expect(markup).toContain('value="delivery"');
    expect(markup).toContain("checked");
    expect(markup).toContain("required");
  });
});
