// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { InfiniteList } from "./InfiniteList";

describe("InfiniteList SSR", () => {
  it("renders a deterministic manual fallback and completion state", () => {
    const idle = renderToString(<InfiniteList hasMore loadMore={() => Promise.resolve()} />);
    const complete = renderToString(
      <InfiniteList hasMore={false} loadMore={() => Promise.resolve()} />
    );
    expect(idle).toContain('data-status="idle"');
    expect(idle).toContain('data-auto-load="true"');
    expect(idle).toContain("加载更多");
    expect(complete).toContain('data-status="complete"');
    expect(complete).toContain("没有更多内容了");
  });
});
