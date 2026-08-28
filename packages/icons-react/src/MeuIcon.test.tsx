// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MeuIconChevronLeft, MeuIconSearch } from "./MeuIcon";

describe("MeuIcon", () => {
  it("is decorative without a title", () => {
    const { container } = render(<MeuIconSearch />);
    const icon = container.querySelector("svg");
    expect(icon && icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon && icon.getAttribute("focusable")).toBe("false");
  });

  it("becomes an accessible image when titled", () => {
    render(<MeuIconSearch title="搜索" />);
    expect(screen.getByRole("img", { name: "搜索" })).toBeTruthy();
  });

  it("supports explicit aria-label and aria-labelledby names", () => {
    const { rerender } = render(<MeuIconSearch aria-label="查找商品" />);
    expect(screen.getByRole("img", { name: "查找商品" })).toBeTruthy();

    rerender(
      <>
        <span id="icon-label">站内搜索</span>
        <MeuIconSearch aria-labelledby="icon-label" />
      </>
    );
    expect(screen.getByRole("img", { name: "站内搜索" })).toBeTruthy();
  });

  it("honors an explicit decorative override even when a title is present", () => {
    const { container } = render(<MeuIconSearch title="不应公告" aria-hidden="true" />);
    const icon = container.querySelector("svg");
    expect(icon && icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon && icon.getAttribute("role")).toBeNull();
  });

  it("keeps Meu names, sizing, stroke geometry and DevTools names stable", () => {
    const { container } = render(<MeuIconChevronLeft size="1.5em" strokeWidth={2.5} />);
    const icon = container.querySelector("svg");
    expect(icon && icon.getAttribute("data-meu-icon")).toBe("chevron-left");
    expect(icon && icon.getAttribute("width")).toBe("1.5em");
    expect(icon && icon.getAttribute("height")).toBe("1.5em");
    expect(icon && icon.getAttribute("stroke-width")).toBe("2.5");
    expect(MeuIconChevronLeft.displayName).toBe("MeuIconChevronLeft");
  });
});
