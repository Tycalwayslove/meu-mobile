import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Card } from "./Card";

describe("Card SSR", () => {
  it("renders stable non-interactive slot markup", () => {
    const html = renderToString(
      <Card title={<h2>订单</h2>} media="封面" footer={<a href="/orders">查看</a>}>
        订单内容
      </Card>
    );
    expect(html).toContain('data-meu-component="card"');
    expect(html).toContain("<h2>订单</h2>");
    expect(html).toContain('data-meu-card-media="true"');
    expect(html).toContain('href="/orders"');
    expect(html).not.toContain('role="button"');
  });
});
