// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TreeSelect } from "./TreeSelect";

describe("TreeSelect SSR", () => {
  it("renders the full initial tree before client virtualization activates", () => {
    const html = renderToString(
      <TreeSelect
        open
        title="商品类目"
        options={[
          {
            label: "数码家电",
            value: "digital",
            children: [{ label: "智能手机", value: "smartphone" }]
          }
        ]}
        defaultExpandedValues={["digital"]}
      />
    );
    expect(html).toContain('role="dialog"');
    expect(html).toContain('role="tree"');
    expect(html.match(/role="treeitem"/g)).toHaveLength(2);
    expect(html).toContain("智能手机");
  });
});
