import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Steps } from "./Steps";

describe("Steps SSR", () => {
  it("renders an ordered list with current-step semantics", () => {
    const html = renderToString(
      <Steps current={1} items={[{ title: "提交" }, { title: "支付" }, { title: "完成" }]} />
    );
    expect(html).toContain("<ol");
    expect(html.match(/<li/g)).toHaveLength(3);
    expect(html).toContain('aria-current="step"');
  });

  it("renders deterministic interactive controls and stable item keys", () => {
    const html = renderToString(
      <Steps
        current={0}
        indicator="dot"
        items={[
          { key: "account", title: "账户" },
          { key: "profile", title: "资料", disabled: true }
        ]}
        onChange={() => undefined}
      />
    );
    expect(html.match(/<button/g)).toHaveLength(2);
    expect(html).toContain('data-interactive="true"');
    expect(html).toContain('data-indicator="dot"');
    expect(html).toContain('disabled=""');
  });
});
