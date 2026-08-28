// @vitest-environment jsdom
import { render } from "@testing-library/react";
import type { CSSProperties } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SafeArea } from "./SafeArea";

describe("SafeArea", () => {
  it("renders a non-interactive safe-area spacer", () => {
    const { container } = render(<SafeArea position="top" />);
    const element = container.firstElementChild as HTMLElement | null;
    expect(element).not.toBeNull();
    expect(element && element.getAttribute("data-position")).toBe("top");
    expect(element && element.getAttribute("aria-hidden")).toBe("true");
    expect(element && element.style.pointerEvents).toBe("");
  });

  it.each(["top", "right", "bottom", "left"] as const)(
    "supports the %s viewport edge",
    (position) => {
      const { container } = render(<SafeArea position={position} />);
      const element = container.firstElementChild;
      expect(element && element.getAttribute("data-position")).toBe(position);
    }
  );

  it("normalizes numeric fallback values and lets caller styles override them", () => {
    const { rerender, container } = render(<SafeArea fallback={24} />);
    const element = container.firstElementChild as HTMLElement;
    expect(element.style.getPropertyValue("--meu-safe-area-fallback")).toBe("24px");

    rerender(<SafeArea fallback={-1} />);
    expect(element.style.getPropertyValue("--meu-safe-area-fallback")).toBe("0px");

    rerender(
      <SafeArea
        fallback="var(--consumer-fallback)"
        style={{ "--meu-safe-area-fallback": "32px" } as CSSProperties}
      />
    );
    expect(element.style.getPropertyValue("--meu-safe-area-fallback")).toBe("32px");
  });

  it("is SSR-safe and preserves its fallback contract in markup", () => {
    const markup = renderToString(<SafeArea position="left" fallback={16} />);
    expect(markup).toContain('data-position="left"');
    expect(markup).toContain("--meu-safe-area-fallback:16px");
    expect(markup).toContain('aria-hidden="true"');
  });
});
