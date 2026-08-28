import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Radio } from "./Radio";
import { RadioGroup } from "./RadioGroup";

describe("Radio SSR", () => {
  it("keeps generated native names and selection stable in one server render", () => {
    const markup = renderToString(
      <RadioGroup defaultValue="standard" required>
        <Radio value="standard">标准配送</Radio>
        <Radio value="express">急速配送</Radio>
      </RadioGroup>
    );

    const names = [...markup.matchAll(/name="([^"]+)"/g)].map((match) => match[1]);
    expect(names).toHaveLength(2);
    expect(new Set(names).size).toBe(1);
    expect(markup).toContain('role="radiogroup"');
    expect(markup).toContain('aria-required="true"');
  });
});
