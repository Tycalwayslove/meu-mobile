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

  it("serializes unavailable hrefs as non-navigable anchors", () => {
    const disabledLink = renderToString(
      <NavBar title="订单" backHref="/orders" backDisabled position="sticky" scrolled />
    );
    expect(disabledLink).toContain("<a");
    expect(disabledLink).not.toContain('href="/orders"');
    expect(disabledLink).toContain('role="link"');
    expect(disabledLink).toContain('aria-disabled="true"');
    expect(disabledLink).toContain('tabindex="-1"');
    expect(disabledLink).toContain('data-position="sticky"');
    expect(disabledLink).toContain('data-scrolled="true"');

    const loadingButton = renderToString(<NavBar title="订单" backHref="/orders" backLoading />);
    expect(loadingButton).toContain("<a");
    expect(loadingButton).not.toContain('href="/orders"');
    expect(loadingButton).toContain('aria-disabled="true"');
    expect(loadingButton).toContain('aria-busy="true"');
    expect(loadingButton).toContain('data-state="loading"');
  });
});
