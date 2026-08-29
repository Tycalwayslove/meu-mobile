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
    expect(html).toContain('role="heading"');
    expect(html).toContain('aria-level="3"');
  });

  it("deduplicates values and derives identities from values instead of positions", () => {
    const first = renderToString(
      <Collapse
        items={[
          { value: "配送", title: "配送", content: "内容" },
          { value: "returns", title: "退换", content: "内容" },
          { value: "配送", title: "重复", content: "不应出现" }
        ]}
      />
    );
    const reordered = renderToString(
      <Collapse
        items={[
          { value: "returns", title: "退换", content: "内容" },
          { value: "配送", title: "配送", content: "内容" }
        ]}
      />
    );
    const firstDeliveryMatch = first.match(/id="([^"]*trigger-914d-9001)"/);
    const reorderedDeliveryMatch = reordered.match(/id="([^"]*trigger-914d-9001)"/);
    const firstDeliveryId = firstDeliveryMatch ? firstDeliveryMatch[1] : undefined;
    const reorderedDeliveryId = reorderedDeliveryMatch ? reorderedDeliveryMatch[1] : undefined;

    expect(first.match(/data-meu-collapse-trigger="配送"/g)).toHaveLength(1);
    expect(first).not.toContain("重复");
    expect(firstDeliveryId).toBeTruthy();
    expect(reorderedDeliveryId).toBe(firstDeliveryId);
  });
});
