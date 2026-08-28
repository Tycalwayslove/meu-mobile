// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { VisuallyHidden } from "./VisuallyHidden";

let cleanup: (() => void) | undefined;

afterEach(() => {
  if (cleanup) {
    cleanup();
    cleanup = undefined;
  }
  document.body.replaceChildren();
});

describe("VisuallyHidden", () => {
  it("keeps its text and semantic attributes in SSR output", () => {
    const markup = renderToString(
      <VisuallyHidden id="status" role="status" aria-live="polite">
        已保存
      </VisuallyHidden>
    );

    expect(markup).toContain("已保存");
    expect(markup).toContain('role="status"');
    expect(markup).not.toContain("aria-hidden");
    expect(markup).not.toContain('hidden="');
  });

  it("merges a caller class without removing the clipping class", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    cleanup = () => act(() => root.unmount());

    act(() => {
      root.render(<VisuallyHidden className="consumer-class">搜索订单</VisuallyHidden>);
    });

    const element = host.querySelector("span");
    expect(element).not.toBeNull();
    expect(element && element.classList.contains("consumer-class")).toBe(true);
    expect(element && element.classList.length).toBeGreaterThan(1);
    expect(element && element.textContent).toBe("搜索订单");
    expect(element && element.hasAttribute("aria-hidden")).toBe(false);
  });
});
