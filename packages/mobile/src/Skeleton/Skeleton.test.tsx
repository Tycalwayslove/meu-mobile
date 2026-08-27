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
});
