// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Collapse } from "./Collapse";

describe("Collapse SSR", () => {
  it("renders stable disclosure relationships and inert collapsed content", () => {
    const html = renderToString(
      <Collapse
        defaultValue={["open"]}
        items={[
          { value: "open", title: "展开项", content: "内容" },
          { value: "closed", title: "收起项", content: "隐藏内容" }
        ]}
      />
    );
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("aria-controls=");
    expect(html).toContain('inert=""');
  });
});
