// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Popover } from "./Popover";

describe("Popover SSR", () => {
  it("renders a stable associated trigger while deferring the floating panel", () => {
    const html = renderToString(
      <Popover aria-label="订单操作" content="操作内容" defaultOpen>
        <button type="button">更多</button>
      </Popover>
    );
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain("aria-controls=");
    expect(html).not.toContain('data-meu-component="popover"');
  });
});
