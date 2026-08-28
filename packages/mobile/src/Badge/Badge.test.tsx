// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./Badge";

describe("Badge", () => {
  it("handles zero and numeric overflow explicitly", () => {
    const { rerender } = render(<Badge content={0} />);
    expect(document.querySelector('[data-meu-component="badge"]')).toBeNull();

    rerender(<Badge content={0} showZero />);
    expect(screen.getByText("0")).toBeTruthy();

    rerender(<Badge content={128} max={99} />);
    expect(screen.getByText("99+")).toBeTruthy();
  });

  it("keeps an unlabeled dot decorative", () => {
    const { rerender } = render(
      <Badge dot>
        <span>消息</span>
      </Badge>
    );
    const marker = document.querySelector("[data-meu-badge-marker]");
    expect(marker && marker.getAttribute("aria-hidden")).toBe("true");

    rerender(
      <Badge dot label="有新消息">
        <span>消息</span>
      </Badge>
    );
    expect(screen.getByLabelText("有新消息")).toBeTruthy();
  });

  it("uses text or an explicit label instead of color alone", () => {
    const { rerender } = render(<Badge content="失败" tone="danger" />);
    expect(screen.getByText("失败")).toBeTruthy();

    rerender(<Badge content={12} label="12 条未读消息" tone="accent" />);
    const marker = screen.getByLabelText("12 条未读消息");
    expect(marker.getAttribute("data-tone")).toBe("accent");
    expect(marker.textContent).toBe("12");
  });

  it("uses logical positioning for RTL anchors", () => {
    render(
      <div dir="rtl">
        <Badge content={3} offset={[2, 4]}>
          <span>消息</span>
        </Badge>
      </div>
    );
    const marker = document.querySelector<HTMLElement>("[data-meu-badge-marker]");
    expect(marker && marker.style.getPropertyValue("--meu-badge-offset-x")).toBe("2px");
    expect(marker && marker.style.getPropertyValue("--meu-badge-offset-y")).toBe("4px");
  });

  it("normalizes invalid counts and offsets without emitting invalid CSS", () => {
    const { rerender } = render(<Badge content={Number.POSITIVE_INFINITY} showZero />);
    expect(screen.getByText("0")).toBeTruthy();

    rerender(
      <Badge content={-3} showZero offset={[Number.NaN, Number.POSITIVE_INFINITY]}>
        {0}
      </Badge>
    );
    const marker = document.querySelector<HTMLElement>("[data-meu-badge-marker]");
    if (!marker) {
      throw new Error("Expected badge marker");
    }
    expect(marker.textContent).toBe("0");
    expect(marker && marker.style.getPropertyValue("--meu-badge-offset-x")).toBe("0px");
    expect(marker && marker.style.getPropertyValue("--meu-badge-offset-y")).toBe("0px");
  });
});
