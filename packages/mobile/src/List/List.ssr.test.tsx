// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Cell } from "./Cell";
import { List } from "./List";

describe("List SSR", () => {
  it("renders stable native list, link and button semantics", () => {
    const html = renderToString(
      <List header="账户">
        <Cell title="详情" href="/details" />
        <Cell title="编辑" onClick={() => undefined} />
      </List>
    );
    expect(html).toContain('role="list"');
    expect(html).toContain('role="listitem"');
    expect(html).toContain('href="/details"');
    expect(html).toContain('type="button"');
  });
});
