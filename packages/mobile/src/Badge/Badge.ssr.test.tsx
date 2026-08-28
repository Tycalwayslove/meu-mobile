import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Badge } from "./Badge";

describe("Badge SSR", () => {
  it("renders deterministic count and labelled dot markup", () => {
    expect(renderToString(<Badge content={128} max={99} />)).toContain("99+");
    const dot = renderToString(<Badge dot label="有新消息" />);
    expect(dot).toContain('aria-label="有新消息"');
    expect(dot).toContain('data-state="dot"');
  });
});
