// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { Popup } from "./Popup";

describe("Popup SSR", () => {
  it("omits a closed popup unless forceMount is enabled", () => {
    expect(
      renderToString(
        <Popup aria-label="关闭面板" open={false}>
          内容
        </Popup>
      )
    ).toBe("");

    const forceMounted = renderToString(
      <Popup aria-label="保活面板" open={false} forceMount>
        内容
      </Popup>
    );
    expect(forceMounted).toContain('hidden=""');
    expect(forceMounted).toContain('inert=""');
    expect(forceMounted).toContain('aria-hidden="true"');
    expect(forceMounted).toContain('role="dialog"');
  });

  it("renders an open dialog inline without resolving a lazy portal target", () => {
    const resolveContainer = vi.fn(() => {
      throw new Error("The server must not resolve a portal target");
    });
    const html = renderToString(
      <Popup
        aria-label="订单筛选"
        open
        container={resolveContainer}
        position="right"
        safeArea={false}
      >
        筛选内容
      </Popup>
    );

    expect(resolveContainer).not.toHaveBeenCalled();
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('data-position="right"');
    expect(html).toContain('data-state="open"');
  });
});
