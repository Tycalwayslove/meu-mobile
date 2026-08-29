// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SegmentedControl } from "./SegmentedControl";

describe("SegmentedControl SSR", () => {
  it("renders stable native radio markup without browser globals", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");

    const markup = renderToString(
      <SegmentedControl
        aria-invalid="grammar"
        aria-label="View"
        defaultValue="grid"
        name="view"
        options={[
          { label: "List", value: "list" },
          { label: "Grid", value: "grid" }
        ]}
        required
      />
    );

    expect(markup).toContain('data-meu-component="segmented-control"');
    expect(markup).toContain('role="radiogroup"');
    expect(markup).toContain('aria-invalid="grammar"');
    expect(markup.match(/aria-invalid=/g)).toHaveLength(1);
    expect(markup).toContain('type="radio"');
    expect(markup).toContain('name="view"');
    expect(markup).toContain('value="grid"');
    expect(markup).toContain("checked");
    expect(markup).toContain("required");
  });
});
