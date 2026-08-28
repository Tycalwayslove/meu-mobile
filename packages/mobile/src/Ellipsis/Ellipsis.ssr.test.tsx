// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Ellipsis } from "./Ellipsis";

describe("Ellipsis SSR", () => {
  it("renders complete accessible text with a stable native clamp fallback", () => {
    const html = renderToString(<Ellipsis content="服务端完整文本" rows={2} />);
    expect(html.match(/服务端完整文本/g)).toHaveLength(2);
    expect(html).toContain('data-state="pending"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain("<button");
  });
});
