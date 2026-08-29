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

  it("renders native navigation links and inert disabled destinations before hydration", () => {
    const html = renderToString(
      <SideNav
        aria-label="频道"
        defaultValue="all"
        sticky
        stickyOffset={56}
        items={[
          { key: "all", label: "全部", href: "/categories" },
          { key: "external", label: "外部", href: "https://example.com", target: "_blank" },
          { key: "disabled", label: "停用", href: "/disabled", disabled: true },
          { key: "disabled", label: "重复停用", href: "/duplicate" }
        ]}
      />
    );

    expect(html).toContain("<nav");
    expect(html).toContain("<ul");
    expect(html).toContain('href="/categories"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('role="link"');
    expect(html).toContain('aria-disabled="true"');
    expect(html).not.toContain('href="/disabled"');
    expect(html).not.toContain("重复停用");
    expect(html).toContain("--meu-side-nav-sticky-offset:56px");
  });
});
