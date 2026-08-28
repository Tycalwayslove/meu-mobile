import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TabBar } from "./TabBar";

describe("TabBar SSR", () => {
  it("renders navigation links, buttons, current route, and safe area", () => {
    const html = renderToString(
      <TabBar
        safeArea
        items={[
          { key: "home", href: "/", icon: "H", label: "首页" },
          { key: "create", icon: "+", label: "发布" }
        ]}
      />
    );
    expect(html).toContain("<nav");
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('href="/"');
    expect(html).toContain('data-meu-component="safe-area"');
  });
});
