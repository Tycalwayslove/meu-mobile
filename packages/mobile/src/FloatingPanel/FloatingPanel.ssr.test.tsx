import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { FloatingPanel } from "./FloatingPanel";

describe("FloatingPanel SSR", () => {
  it("renders a deterministic modeless shell before viewport measurement", () => {
    const markup = renderToString(<FloatingPanel anchors={[180, 360]}>详情</FloatingPanel>);
    expect(markup).toContain('data-meu-component="floating-panel"');
    expect(markup).toContain('data-measured="false"');
    expect(markup).toContain('style="--meu-floating-panel-translate:0px;height:50vh"');
    expect(markup).toContain('type="button"');
  });

  it("renders localized modeless relationships and the complete configuration boundary", () => {
    const markup = renderToString(
      <ConfigProvider dir="rtl" locale="en-US" motion="reduced" theme="dark">
        <FloatingPanel anchors={[180, 360]} handleLabel="Resize route details">
          Route details
        </FloatingPanel>
      </ConfigProvider>
    );

    expect(markup).not.toContain('role="dialog"');
    expect(markup).toContain('aria-label="Resize route details"');
    expect(markup).toContain('aria-label="Floating panel content"');
    expect(markup).toContain('role="region"');
    expect(markup).toContain('dir="rtl"');
    expect(markup).toContain('lang="en-US"');
    expect(markup).toContain('data-meu-motion="reduced"');
    expect(markup).toContain('data-meu-theme="dark"');
  });
});
