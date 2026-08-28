import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Tabs } from "./Tabs";

describe("Tabs SSR", () => {
  it("renders stable APG associations and a lazy initial panel", () => {
    const html = renderToString(
      <Tabs
        aria-label="账户"
        lazy
        items={[
          { key: "profile", label: "资料", content: "资料内容" },
          { key: "security", label: "安全", content: "安全内容" }
        ]}
      />
    );
    expect(html).toContain('role="tablist"');
    expect(html.match(/role="tab"/g)).toHaveLength(2);
    expect(html.match(/role="tabpanel"/g)).toHaveLength(1);
    expect(html).toContain('aria-selected="true"');
  });
});
