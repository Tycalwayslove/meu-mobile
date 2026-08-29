import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SwipeActions } from "./SwipeActions";

describe("SwipeActions SSR", () => {
  it("renders closed, hidden rails and native reveal alternatives deterministically", () => {
    const markup = renderToString(
      <SwipeActions rightActions={[{ key: "delete", label: "删除" }]}>订单</SwipeActions>
    );
    expect(markup).toContain('data-meu-component="swipe-actions"');
    expect(markup).toContain('data-open-side="none"');
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain('tabindex="-1"');
    expect(markup).toContain("显示右侧操作");
  });

  it("keeps a default-open rail hidden from accessibility APIs until it is measured", () => {
    const markup = renderToString(
      <SwipeActions defaultOpenSide="right" rightActions={[{ key: "archive", label: "归档" }]}>
        订单
      </SwipeActions>
    );
    expect(markup).toContain('data-open-side="none"');
    expect(markup).toContain('data-open="false"');
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain('tabindex="-1"');
  });
});
