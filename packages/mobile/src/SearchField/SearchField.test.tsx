// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { SearchField } from "./SearchField";

describe("SearchField", () => {
  it("supports value changes, enter search and clearing", () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    const onSearch = vi.fn();
    render(
      <SearchField
        aria-label="搜索商品"
        onChange={onChange}
        onClear={onClear}
        onSearch={onSearch}
      />
    );
    const input = screen.getByRole("searchbox", { name: "搜索商品" });

    fireEvent.change(input, { target: { value: "猫粮" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith("猫粮");
    expect(onSearch).toHaveBeenCalledWith("猫粮");

    fireEvent.click(screen.getByRole("button", { name: "清除搜索" }));
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(onClear).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(input);
  });

  it("inherits Field semantics and hides actions while disabled", () => {
    render(
      <Field label="站内搜索" error="请输入关键词">
        <SearchField defaultValue="订单" disabled />
      </Field>
    );

    const input = screen.getByRole("searchbox", { name: "站内搜索" });
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input).toHaveProperty("disabled", true);
    expect(screen.queryByRole("button", { name: "清除搜索" })).toBeNull();
  });

  it("exposes loading state and prevents repeated search", () => {
    const onSearch = vi.fn();
    render(<SearchField aria-label="远程搜索" defaultValue="订单" loading onSearch={onSearch} />);
    const input = screen.getByRole("searchbox", { name: "远程搜索" });
    const root = input.parentElement;

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSearch).not.toHaveBeenCalled();
    expect(root && root.getAttribute("aria-busy")).toBe("true");
    expect(root && root.getAttribute("data-state")).toBe("loading");
  });

  it("searches the native input value before a controlled render catches up", () => {
    const onSearch = vi.fn();
    render(<SearchField aria-label="即时搜索" value="" onSearch={onSearch} />);
    const input = screen.getByRole("searchbox", { name: "即时搜索" });

    fireEvent.keyDown(input, { key: "Enter", target: { value: "TextArea" } });
    expect(onSearch).toHaveBeenCalledWith("TextArea");
  });
});
