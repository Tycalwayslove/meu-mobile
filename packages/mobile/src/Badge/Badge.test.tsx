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
});
