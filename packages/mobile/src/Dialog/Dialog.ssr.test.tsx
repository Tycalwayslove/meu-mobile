// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Dialog } from "./Dialog";

describe("Dialog SSR", () => {
  it("renders stable modal relationships and native actions", () => {
    const html = renderToString(
      <Dialog
        open
        title="删除订单？"
        description="删除后无法恢复。"
        actions={[
          { key: "cancel", label: "取消" },
          { key: "delete", label: "删除" }
        ]}
      />
    );
    expect(html).toContain('role="alertdialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain("aria-labelledby=");
    expect(html).toContain("aria-describedby=");
    expect(html.match(/type="button"/g)).toHaveLength(3);
  });
});
