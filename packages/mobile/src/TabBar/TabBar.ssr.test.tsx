import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TabBar } from "./TabBar";

describe("TabBar SSR", () => {
  it("renders deterministic link/button/current, disabled, duplicate, and safe-area semantics", () => {
    const html = renderToString(
      <TabBar
        aria-labelledby="primary-navigation"
        safeArea
        items={[
          { key: "home", href: "/", icon: "H", label: "首页" },
          { key: "create", icon: "+", label: "发布" },
          { key: "locked", href: "/locked", icon: "L", label: "锁定", disabled: true },
          { key: "create", icon: "D", label: "重复发布" }
        ]}
      />
    );
    expect(html).toContain("<nav");
    expect(html).toContain('aria-labelledby="primary-navigation"');
    expect(html).not.toContain('aria-label="主导航"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('href="/"');
    expect(html).not.toContain('href="/locked"');
    expect(html).toContain('role="link"');
    expect(html).toContain('aria-disabled="true"');
    expect(html).not.toContain("重复发布");
    expect(html).toContain('data-meu-component="safe-area"');
  });
});
