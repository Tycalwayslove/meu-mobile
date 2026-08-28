import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FloatingPanel } from "./FloatingPanel";

describe("FloatingPanel SSR", () => {
  it("renders a deterministic modeless shell before viewport measurement", () => {
    const markup = renderToString(<FloatingPanel anchors={[180, 360]}>详情</FloatingPanel>);
    expect(markup).toContain('data-meu-component="floating-panel"');
    expect(markup).toContain('data-measured="false"');
    expect(markup).toContain('style="--meu-floating-panel-translate:0px;height:50vh"');
    expect(markup).toContain('type="button"');
  });
});
