// @vitest-environment jsdom
import { act, createRef } from "react";
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

  it("forwards its span ref and keeps focusable as a component-only prop", () => {
    const ref = createRef<HTMLSpanElement>();
    const markup = renderToString(
      <VisuallyHidden focusable tabIndex={0}>
        跳至主要内容
      </VisuallyHidden>
    );
    expect(markup).toContain('tabindex="0"');
    expect(markup).not.toContain("focusable");

    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    cleanup = () => act(() => root.unmount());
    act(() => {
      root.render(
        <VisuallyHidden ref={ref} focusable tabIndex={0}>
          跳至主要内容
        </VisuallyHidden>
      );
    });

    expect(ref.current).toBe(host.querySelector("span"));
    expect(ref.current && ref.current.getAttribute("focusable")).toBeNull();
  });

  it("uses a separate focus-reveal class without weakening the persistent mode", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    cleanup = () => act(() => root.unmount());

    act(() => {
      root.render(
        <>
          <VisuallyHidden data-testid="persistent">说明</VisuallyHidden>
          <VisuallyHidden data-testid="focusable" focusable>
            <a href="#main">跳至主要内容</a>
          </VisuallyHidden>
        </>
      );
    });

    const persistent = host.querySelector<HTMLElement>('[data-testid="persistent"]');
    const focusable = host.querySelector<HTMLElement>('[data-testid="focusable"]');
    expect(persistent && persistent.className).toBeTruthy();
    expect(focusable && focusable.className).toBeTruthy();
    expect(focusable && focusable.className).not.toBe(persistent && persistent.className);
    const link = focusable ? focusable.querySelector("a") : null;
    expect(link && link.getAttribute("href")).toBe("#main");
  });
});
