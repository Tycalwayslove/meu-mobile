// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CascadePicker } from "./CascadePicker";

describe("CascadePicker SSR", () => {
  it("renders the complete normalized path deterministically", () => {
    const html = renderToString(
      <CascadePicker
        open
        title="配送地区"
        options={[
          {
            label: "浙江省",
            value: "zhejiang",
            children: [{ label: "杭州市", value: "hangzhou" }]
          }
        ]}
      />
    );
    expect(html.match(/role="listbox"/g)).toHaveLength(2);
    expect(html).toContain("浙江省");
    expect(html).toContain("杭州市");
  });
});
