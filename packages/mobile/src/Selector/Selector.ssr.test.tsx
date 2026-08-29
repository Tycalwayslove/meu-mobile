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

  it("serializes read-only multiple limits without disabling selected form values", () => {
    const markup = renderToString(
      <Selector
        aria-label="Services"
        defaultValue={["delivery", "pickup"]}
        maxCount={1}
        multiple
        name="services"
        options={[
          { label: "Delivery", value: "delivery" },
          { label: "Pickup", value: "pickup" }
        ]}
        readOnly
      />
    );

    expect(markup).toContain('role="group"');
    expect(markup).toContain('aria-readonly="true"');
    expect(markup).toContain('data-state="readonly"');
    expect(markup).toContain('checked="" value="delivery"');
    expect(markup).toContain('aria-disabled="true"');
    expect(markup).toContain('value="pickup"');
    expect(markup).not.toContain('disabled=""');
  });
});
