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
});
