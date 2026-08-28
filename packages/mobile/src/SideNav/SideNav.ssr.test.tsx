// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SideNav } from "./SideNav";

describe("SideNav SSR", () => {
  it("renders stable vertical-tab relationships", () => {
    const html = renderToString(
      <SideNav
        aria-label="分类"
        items={[
          { key: "a", label: "甲", content: "甲内容" },
          { key: "b", label: "乙", content: "乙内容" }
        ]}
      />
    );
    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-orientation="vertical"');
    expect(html).toContain('role="tabpanel"');
    expect(html).toContain('aria-selected="true"');
  });
});
