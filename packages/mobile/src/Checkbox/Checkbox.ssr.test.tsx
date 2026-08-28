import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Checkbox } from "./Checkbox";
import { CheckboxGroup } from "./CheckboxGroup";

describe("Checkbox SSR", () => {
  it("renders deterministic native form semantics without browser globals", () => {
    const markup = renderToString(
      <CheckboxGroup defaultValue={["delivery"]} name="service">
        <Checkbox value="delivery">配送</Checkbox>
        <Checkbox value="pickup">自提</Checkbox>
      </CheckboxGroup>
    );

    expect(markup).toContain('role="group"');
    expect(markup).toContain('name="service"');
    expect(markup).toContain('value="delivery"');
    expect(markup).toContain("checked");
  });
});
