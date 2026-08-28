import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PullToRefresh } from "./PullToRefresh";

describe("PullToRefresh SSR", () => {
  it("renders idle content and the native refresh alternative deterministically", () => {
    const markup = renderToString(<PullToRefresh onRefresh={() => undefined}>列表</PullToRefresh>);
    expect(markup).toContain('data-meu-component="pull-to-refresh"');
    expect(markup).toContain('data-status="idle"');
    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-atomic="true"');
    expect(markup).toContain("刷新内容");
  });
});
