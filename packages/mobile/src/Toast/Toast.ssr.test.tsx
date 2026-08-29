// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { Toast } from "./Toast";
import { ToastProvider } from "./ToastProvider";

describe("Toast SSR", () => {
  it("renders closed declarative and empty provider states without browser globals", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
    expect(renderToString(<Toast message="Saved" />)).toBe("");
    expect(renderToString(<ToastProvider>content</ToastProvider>)).toContain("content");
  });

  it("renders an open in-place Portal with config and live-region semantics", () => {
    const markup = renderToString(
      <ConfigProvider dir="rtl" locale="en-US" motion="reduced" theme="dark">
        <Toast action={{ label: "Undo" }} duration={0} message="Saved" open tone="success" />
      </ConfigProvider>
    );

    expect(markup).toContain('data-meu-overlay-layer="toast"');
    expect(markup).toContain('data-meu-theme="dark"');
    expect(markup).toContain('data-meu-motion="reduced"');
    expect(markup).toContain('dir="rtl"');
    expect(markup).toContain('lang="en-US"');
    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('type="button"');
  });
});
