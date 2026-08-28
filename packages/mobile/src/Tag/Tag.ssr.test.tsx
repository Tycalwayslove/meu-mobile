import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Tag } from "./Tag";

describe("Tag SSR", () => {
  it("renders static, filter and closable modes deterministically", () => {
    expect(renderToString(<Tag>新品</Tag>)).toContain('data-state="static"');
    expect(renderToString(<Tag onClick={() => undefined}>有货</Tag>)).toContain("<button");
    const closable = renderToString(<Tag onClose={() => undefined}>促销</Tag>);
    expect(closable).toContain("移除标签");
    expect(closable).toContain("data-meu-tag-close");
  });
});
