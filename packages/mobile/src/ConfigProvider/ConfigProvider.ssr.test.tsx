// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider, useMeuConfig } from "./ConfigProvider";

function ServerReadout() {
  const { dir, locale, motion, theme } = useMeuConfig();
  return <span>{[dir, locale, motion, theme].join("|")}</span>;
}

describe("ConfigProvider SSR", () => {
  it("renders without browser globals and preserves the system strategies", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
    const getPortalTarget = vi.fn(() => {
      throw new Error("Portal resolver must not run during SSR");
    });

    const markup = renderToString(
      <ConfigProvider
        dir="rtl"
        locale="en-US"
        motion="system"
        portalContainer={getPortalTarget}
        theme="system"
      >
        <ServerReadout />
      </ConfigProvider>
    );

    expect(markup).toContain('dir="rtl"');
    expect(markup).toContain('lang="en-US"');
    expect(markup).toContain('data-meu-motion="system"');
    expect(markup).toContain('data-meu-theme="system"');
    expect(markup).toContain("rtl|en-US|system|system");
    expect(getPortalTarget).not.toHaveBeenCalled();
  });
});
