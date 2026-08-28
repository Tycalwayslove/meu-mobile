// @vitest-environment jsdom
import { MeuIconSearch } from "@meu/icons-react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("renders an accessible native button", () => {
    const onClick = vi.fn();
    render(
      <IconButton aria-label="搜索" onClick={onClick}>
        <MeuIconSearch />
      </IconButton>
    );
    const button = screen.getByRole("button", { name: "搜索" });
    const icon = button.querySelector("svg");
    expect(button.getAttribute("type")).toBe("button");
    expect(icon && icon.closest('[aria-hidden="true"]')).toBeTruthy();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("supports an external accessible label and pressed state", () => {
    render(
      <>
        <span id="favorite-label">收藏商品</span>
        <IconButton aria-labelledby="favorite-label" aria-pressed>
          <MeuIconSearch title="不应重复进入按钮名称" />
        </IconButton>
      </>
    );

    const button = screen.getByRole("button", { name: "收藏商品" });
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.getAttribute("data-state")).toBe("pressed");
    expect(screen.queryByRole("img", { name: "不应重复进入按钮名称" })).toBeNull();
  });

  it("blocks interaction while loading", () => {
    const onClick = vi.fn();
    render(
      <IconButton aria-label="搜索" loading onClick={onClick}>
        <MeuIconSearch />
      </IconButton>
    );
    const button = screen.getByRole("button", { name: "搜索" });
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.getAttribute("data-state")).toBe("loading");
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(button.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });
});
