// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders bounded text lines and stays out of the accessibility tree", () => {
    const { container } = render(<Skeleton lines={3} lineWidths={["100%", "84%", "60%"]} />);
    const skeleton = container.querySelector('[data-meu-component="skeleton"]');
    if (!skeleton) throw new Error("Expected Skeleton root");
    expect(skeleton.getAttribute("aria-hidden")).toBe("true");
    const lines = skeleton.querySelectorAll("span");
    expect(lines).toHaveLength(3);
    expect(lines.item(2).style.getPropertyValue("--meu-skeleton-line-width")).toBe("60%");
  });

  it("matches circular dimensions when only width is supplied", () => {
    const { container } = render(<Skeleton variant="circle" width={52} animated />);
    const skeleton = container.querySelector('[data-meu-component="skeleton"]');
    if (!(skeleton instanceof HTMLElement)) throw new Error("Expected Skeleton root");
    expect(skeleton.style.getPropertyValue("--meu-skeleton-width")).toBe("52px");
    expect(skeleton.style.getPropertyValue("--meu-skeleton-height")).toBe("52px");
    expect(skeleton.getAttribute("data-animated")).toBe("true");
  });

  it("normalizes invalid line counts to one line", () => {
    const { container } = render(<Skeleton lines={Number.NaN} />);
    expect(container.querySelectorAll('[data-meu-component="skeleton"] span')).toHaveLength(1);
  });

  it("reserves an explicit aspect ratio without exposing loading semantics", () => {
    const { container } = render(
      <Skeleton variant="rectangle" width="100%" height="auto" aspectRatio="16 / 9" />
    );
    const skeleton = container.querySelector<HTMLElement>('[data-meu-component="skeleton"]');
    if (!skeleton) throw new Error("Expected Skeleton root");
    expect(skeleton.style.getPropertyValue("--meu-skeleton-aspect-ratio")).toBe("16 / 9");
    expect(skeleton.getAttribute("aria-hidden")).toBe("true");
  });

  it("falls back deterministically for non-finite numeric dimensions", () => {
    const { container } = render(
      <Skeleton
        variant="text"
        width={Number.POSITIVE_INFINITY}
        height={Number.NaN}
        lines={2}
        lineWidths={[Number.NaN, Number.POSITIVE_INFINITY]}
      />
    );
    const skeleton = container.querySelector<HTMLElement>('[data-meu-component="skeleton"]');
    if (!skeleton) {
      throw new Error("Expected skeleton root");
    }
    expect(skeleton.style.getPropertyValue("--meu-skeleton-width")).toBe("100%");
    expect(skeleton.style.getPropertyValue("--meu-skeleton-height")).toBe("16px");
    const lines = Array.from(skeleton.querySelectorAll<HTMLElement>("span"));
    expect(lines[0] && lines[0].style.getPropertyValue("--meu-skeleton-line-width")).toBe("100%");
    expect(lines[1] && lines[1].style.getPropertyValue("--meu-skeleton-line-width")).toBe("72%");
  });

  it("omits invalid numeric aspect ratios and preserves finite positive ratios", () => {
    const { container, rerender } = render(
      <Skeleton aspectRatio={Number.POSITIVE_INFINITY} height="auto" variant="rectangle" />
    );
    const skeleton = container.querySelector<HTMLElement>('[data-meu-component="skeleton"]');
    if (!skeleton) throw new Error("Expected Skeleton root");
    expect(skeleton.style.getPropertyValue("--meu-skeleton-aspect-ratio")).toBe("");

    rerender(<Skeleton aspectRatio={1.5} height="auto" variant="rectangle" />);
    expect(skeleton.style.getPropertyValue("--meu-skeleton-aspect-ratio")).toBe("1.5");
  });
});
