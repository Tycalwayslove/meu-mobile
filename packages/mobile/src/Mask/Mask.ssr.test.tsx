// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Mask } from "./Mask";

describe("Mask SSR", () => {
  it("renders deterministic decorative overlay markup without browser globals", () => {
    const html = renderToString(<Mask opacity="thick">加载中</Mask>);
    expect(html).toContain('data-meu-component="mask"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("--meu-mask-opacity:0.72");
    expect(html).toContain("加载中");
  });
});
