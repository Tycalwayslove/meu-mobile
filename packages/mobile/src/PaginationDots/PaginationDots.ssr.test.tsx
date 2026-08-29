import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PaginationDots } from "./PaginationDots";

describe("PaginationDots SSR", () => {
  it("renders deterministic compressed read-only markup", () => {
    const html = renderToString(<PaginationDots activeIndex={10} count={20} />);
    expect(html).toContain('role="img"');
    expect(html).toContain("第 11 页，共 20 页");
    expect(html).toContain("…");
    expect(html).not.toContain("<button");
  });

  it("preserves labelled interactive and disabled semantics before hydration", () => {
    const html = renderToString(
      <PaginationDots
        aria-labelledby="pagination-heading"
        activeIndex={2}
        count={8}
        interactive
        disabled
      />
    );
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-labelledby="pagination-heading"');
    expect(html).not.toContain('aria-label="第 3 页，共 8 页"');
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain("disabled");
    expect(html).toContain('tabindex="-1"');
  });
});
