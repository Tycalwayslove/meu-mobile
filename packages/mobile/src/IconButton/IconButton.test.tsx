// @vitest-environment jsdom
import { MeuIconSearch } from "@meu/icons-react";
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { IconButton } from "./IconButton";
import type { IconButtonProps } from "./types";

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

  it("rejects empty or competing accessible names at runtime", () => {
    const emptyLabel = {
      "aria-label": "   ",
      children: <MeuIconSearch />
    } as IconButtonProps;
    const competingNames = {
      "aria-label": "搜索",
      "aria-labelledby": "search-label",
      children: <MeuIconSearch />
    } as unknown as IconButtonProps;

    expect(() => render(<IconButton {...emptyLabel} />)).toThrow(/exactly one non-empty/);
    expect(() => render(<IconButton {...competingNames} />)).toThrow(/exactly one non-empty/);
  });

  it("forwards its ref and native form attributes", () => {
    const ref = createRef<HTMLButtonElement>();
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <IconButton
          ref={ref}
          aria-label="提交搜索"
          type="submit"
          name="intent"
          value="search"
          formNoValidate
        >
          <MeuIconSearch />
        </IconButton>
      </form>
    );

    const button = screen.getByRole("button", { name: "提交搜索" });
    expect(ref.current).toBe(button);
    expect(button.getAttribute("name")).toBe("intent");
    expect(button.getAttribute("value")).toBe("search");
    expect(button.hasAttribute("formnovalidate")).toBe(true);
    fireEvent.click(button);
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("renders stable SSR semantics for disabled mixed toggles", () => {
    const html = renderToString(
      <IconButton aria-label="收藏状态" aria-pressed="mixed" disabled data-business-id="favorite">
        <MeuIconSearch />
      </IconButton>
    );

    expect(html).toContain('type="button"');
    expect(html).toContain('aria-label="收藏状态"');
    expect(html).toContain('aria-pressed="mixed"');
    expect(html).toContain("disabled");
    expect(html).toContain('data-business-id="favorite"');
    expect(html).toContain('data-state="disabled"');
  });
});
