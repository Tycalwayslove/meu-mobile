// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { VirtualList } from "./VirtualList";

describe("VirtualList SSR", () => {
  it("renders only a deterministic initial window with complete collection semantics", () => {
    const items = Array.from({ length: 1_000 }, (_, index) => ({ id: `row-${index}`, index }));
    const markup = renderToString(
      <VirtualList
        aria-label="Orders"
        estimateSize={48}
        getItemKey={(item) => item.id}
        height={240}
        items={items}
        renderItem={(item) => <span>Order {item.index}</span>}
      />
    );
    expect(markup).toContain('role="list"');
    expect(markup).toContain('aria-setsize="1000"');
    expect(markup).toContain('data-meu-virtual-index="0"');
    expect(markup).not.toContain('data-meu-virtual-index="999"');
  });
});
