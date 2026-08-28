// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BottomSheet } from "./BottomSheet";

describe("BottomSheet SSR", () => {
  it("renders a deterministic modal shell before viewport measurement", () => {
    const html = renderToString(
      <BottomSheet open title="筛选条件" snapPoints={[0.5, 0.9]}>
        筛选内容
      </BottomSheet>
    );
    expect(html).toContain('data-meu-component="bottom-sheet"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain("height:50vh");
    expect(html).toContain("调整面板高度");
  });
});
