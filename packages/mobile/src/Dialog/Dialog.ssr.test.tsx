// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

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

  it("omits a closed dialog unless forceMount is enabled", () => {
    expect(
      renderToString(<Dialog open={false} title="关闭弹窗" description="关闭说明" actions={[]} />)
    ).toBe("");

    const forceMounted = renderToString(
      <Dialog open={false} forceMount title="保活弹窗" description="保活说明" actions={[]} />
    );
    expect(forceMounted).toContain('hidden=""');
    expect(forceMounted).toContain('inert=""');
    expect(forceMounted).toContain('aria-hidden="true"');
    expect(forceMounted).toContain('role="alertdialog"');
  });

  it("renders inline without resolving a lazy portal target on the server", () => {
    const resolveContainer = vi.fn(() => {
      throw new Error("The server must not resolve a portal target");
    });
    const html = renderToString(
      <Dialog
        container={resolveContainer}
        open
        title="服务端弹窗"
        description="服务端说明"
        actions={[]}
      />
    );

    expect(resolveContainer).not.toHaveBeenCalled();
    expect(html).toContain('role="alertdialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('data-state="open"');
  });
});
