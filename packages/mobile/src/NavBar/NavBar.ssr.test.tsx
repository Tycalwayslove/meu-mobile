// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { NavBar } from "./NavBar";

describe("NavBar SSR", () => {
  it("renders stable native header and back-link semantics", () => {
    const html = renderToString(<NavBar title={<h1>订单</h1>} backHref="/orders" safeArea />);
    expect(html).toContain("<header");
    expect(html).toContain('href="/orders"');
    expect(html).toContain('aria-label="返回"');
    expect(html).toContain('data-safe-area="true"');
  });
});
