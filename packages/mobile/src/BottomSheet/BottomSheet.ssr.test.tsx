// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { BottomSheet } from "./BottomSheet";

describe("BottomSheet SSR", () => {
  it("omits a closed sheet unless forceMount is enabled", () => {
    expect(
      renderToString(
        <BottomSheet aria-label="关闭面板" open={false}>
          内容
        </BottomSheet>
      )
    ).toBe("");

    const forceMounted = renderToString(
      <BottomSheet aria-label="保活面板" forceMount open={false} showCloseButton>
        内容
      </BottomSheet>
    );
    expect(forceMounted).toContain('hidden=""');
    expect(forceMounted).toContain('inert=""');
    expect(forceMounted).toContain('aria-hidden="true"');
    expect(forceMounted).toContain('disabled=""');
  });

  it("renders a deterministic modal shell before viewport measurement", () => {
    const resolveContainer = vi.fn(() => {
      throw new Error("The server must not resolve a portal target");
    });
    const html = renderToString(
      <BottomSheet open title="筛选条件" container={resolveContainer} snapPoints={[0.5, 0.9]}>
        筛选内容
      </BottomSheet>
    );
    expect(resolveContainer).not.toHaveBeenCalled();
    expect(html).toContain('data-meu-component="bottom-sheet"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain("height:50vh");
    expect(html).toContain("调整面板高度");
  });
});
