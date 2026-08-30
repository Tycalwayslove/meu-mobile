// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Cell } from "./Cell";
import { List } from "./List";

describe("List SSR", () => {
  it("renders a named empty list without inventing items or status", () => {
    const html = renderToString(<List aria-label="空订单" />);
    expect(html).toContain('role="list"');
    expect(html).toContain('aria-label="空订单"');
    expect(html).not.toContain('role="listitem"');
    expect(html).not.toContain('role="status"');
  });

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

  it("server-renders localized loading semantics without a live navigation target", () => {
    const html = renderToString(
      <List aria-label="订单">
        <Cell title="提交" onClick={() => undefined} loading loadingLabel="正在提交" />
        <Cell title="详情" href="/orders/1" loading loadingLabel="正在打开" />
      </List>
    );
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('role="status"');
    expect(html).toContain("正在提交");
    expect(html).toContain("正在打开");
    expect(html).not.toContain('href="/orders/1"');
  });
});
