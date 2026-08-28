// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ActionMenu } from "./ActionMenu";

describe("ActionMenu SSR", () => {
  it("renders dialog semantics and deterministic action grouping", () => {
    const html = renderToString(
      <ActionMenu
        open
        title="订单操作"
        actions={[
          { key: "delete", label: "删除", tone: "danger" },
          { key: "copy", label: "复制" }
        ]}
      />
    );
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html.indexOf('data-action-group="neutral"')).toBeLessThan(
      html.indexOf('data-action-group="danger"')
    );
    expect(html).toContain('data-action-group="cancel"');
  });
});
