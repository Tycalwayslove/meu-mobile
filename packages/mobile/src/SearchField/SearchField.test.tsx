// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { SearchField } from "./SearchField";
import type {
  SearchFieldChangeDetails,
  SearchFieldClearDetails,
  SearchFieldSearchDetails
} from "./types";

describe("SearchField", () => {
  it("server-renders a stable native search input", () => {
    const html = renderToString(
      <SearchField
        aria-label="搜索商品"
        defaultValue="猫粮"
        enterKeyHint="search"
        name="query"
        readOnly
      />
    );

    expect(html).toContain('type="search"');
    expect(html).toContain('name="query"');
    expect(html).toContain('value="猫粮"');
    expect(html).toContain("readonly");
    expect(html).toContain('data-state="read-only"');
  });

  it("reports input, Enter and clear with stable details while keeping legacy first arguments", () => {
    const onChange = vi.fn<(value: string, details: SearchFieldChangeDetails) => void>();
    const onClear = vi.fn<(details: SearchFieldClearDetails) => void>();
    const onSearch = vi.fn<(value: string, details: SearchFieldSearchDetails) => void>();
    render(
      <SearchField
        aria-label="搜索商品"
        onChange={onChange}
        onClear={onClear}
        onSearch={onSearch}
      />
    );
    const input = screen.getByRole<HTMLInputElement>("searchbox", { name: "搜索商品" });

    fireEvent.change(input, { target: { value: "猫粮" } });
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0] && onChange.mock.calls[0][0]).toBe("猫粮");
    expect(onChange.mock.calls[0] && onChange.mock.calls[0][1].source).toBe("input");
    expect(onChange.mock.calls[0] && onChange.mock.calls[0][1].event).toBeTruthy();

    const keepsNativeDefault = fireEvent.keyDown(input, { key: "Enter" });
    expect(keepsNativeDefault).toBe(false);
    expect(onSearch).toHaveBeenCalledOnce();
    expect(onSearch.mock.calls[0] && onSearch.mock.calls[0][0]).toBe("猫粮");
    expect(onSearch.mock.calls[0] && onSearch.mock.calls[0][1].source).toBe("enter");
    expect(onSearch.mock.calls[0] && onSearch.mock.calls[0][1].event.defaultPrevented).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "清除搜索" }));
    const lastChangeCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastChangeCall && lastChangeCall[0]).toBe("");
    expect(lastChangeCall && lastChangeCall[1].source).toBe("clear");
    expect(onClear).toHaveBeenCalledOnce();
    expect(onClear.mock.calls[0] && onClear.mock.calls[0][0].source).toBe("clear");
    expect(onClear.mock.calls[0] && onClear.mock.calls[0][0]).toBe(
      lastChangeCall && lastChangeCall[1]
    );
    expect(input.value).toBe("");
    expect(document.activeElement).toBe(input);
  });

  it("lets a native form own Enter when onSearch is absent", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <SearchField aria-label="原生搜索" name="query" defaultValue="订单" />
      </form>
    );

    await user.click(screen.getByRole("searchbox", { name: "原生搜索" }));
    await user.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("makes onSearch the sole Enter owner instead of double-submitting a form", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <SearchField aria-label="回调搜索" name="query" defaultValue="订单" onSearch={onSearch} />
      </form>
    );

    await user.click(screen.getByRole("searchbox", { name: "回调搜索" }));
    await user.keyboard("{Enter}");
    expect(onSearch).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("respects a consumer keydown cancellation before running onSearch", () => {
    const onSearch = vi.fn();
    const onKeyDown = vi.fn((event: React.KeyboardEvent<HTMLInputElement>) => {
      event.preventDefault();
    });
    render(
      <SearchField
        aria-label="可取消搜索"
        defaultValue="订单"
        onKeyDown={onKeyDown}
        onSearch={onSearch}
      />
    );

    const keepsNativeDefault = fireEvent.keyDown(
      screen.getByRole("searchbox", { name: "可取消搜索" }),
      { key: "Enter" }
    );
    expect(keepsNativeDefault).toBe(false);
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("does not search while an IME composition is active or for repeated Enter", () => {
    const onBlur = vi.fn();
    const onSearch = vi.fn();
    render(
      <SearchField aria-label="组合输入" defaultValue="商品" onBlur={onBlur} onSearch={onSearch} />
    );
    const input = screen.getByRole("searchbox", { name: "组合输入" });

    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(onSearch).not.toHaveBeenCalled();

    fireEvent.compositionEnd(input);
    const keepsRepeatDefault = fireEvent.keyDown(input, { key: "Enter", repeat: true });
    expect(keepsRepeatDefault).toBe(false);
    expect(onSearch).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSearch).toHaveBeenCalledOnce();

    fireEvent.compositionStart(input);
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledOnce();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSearch).toHaveBeenCalledTimes(2);
  });

  it("keeps read-only values focusable and searchable but never exposes clear", () => {
    const onSearch = vi.fn();
    render(
      <SearchField aria-label="只读搜索" defaultValue="固定条件" readOnly onSearch={onSearch} />
    );
    const input = screen.getByRole<HTMLInputElement>("searchbox", { name: "只读搜索" });

    expect(input.readOnly).toBe(true);
    expect(screen.queryByRole("button", { name: "清除搜索" })).toBeNull();
    input.focus();
    expect(document.activeElement).toBe(input);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSearch).toHaveBeenCalledWith("固定条件", expect.objectContaining({ source: "enter" }));
  });

  it("announces loading, hides clear and blocks repeated search and form submission", () => {
    const onSearch = vi.fn();
    render(
      <SearchField
        aria-label="远程搜索"
        defaultValue="订单"
        loading
        loadingLabel="订单搜索中"
        onSearch={onSearch}
      />
    );
    const input = screen.getByRole("searchbox", { name: "远程搜索" });
    const root = input.parentElement;

    const keepsNativeDefault = fireEvent.keyDown(input, { key: "Enter" });
    expect(keepsNativeDefault).toBe(false);
    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole("status", { name: "订单搜索中" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "清除搜索" })).toBeNull();
    expect(input.getAttribute("aria-busy")).toBe("true");
    expect(root && root.getAttribute("data-state")).toBe("loading");
  });

  it("lets Field errors override caller grammar and hides actions while disabled", () => {
    render(
      <Field label="站内搜索" error="请输入关键词">
        <SearchField aria-invalid="grammar" defaultValue="订单" disabled />
      </Field>
    );

    const input = screen.getByRole<HTMLInputElement>("searchbox", { name: "站内搜索" });
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.disabled).toBe(true);
    expect(screen.queryByRole("button", { name: "清除搜索" })).toBeNull();
  });

  it.each([
    [false, "false", "default"],
    ["false", "false", "default"],
    ["grammar", "grammar", "error"],
    ["spelling", "spelling", "error"]
  ] as const)(
    "preserves aria-invalid=%s on the searchbox",
    (ariaInvalid, expectedAttribute, expectedState) => {
      render(<SearchField aria-invalid={ariaInvalid} aria-label="语义搜索" />);
      const input = screen.getByRole("searchbox", { name: "语义搜索" });
      expect(input.getAttribute("aria-invalid")).toBe(expectedAttribute);
      const root = input.parentElement;
      expect(root && root.getAttribute("data-state")).toBe(expectedState);
    }
  );

  it("searches the live native value before a controlled render catches up", () => {
    const onSearch = vi.fn();
    render(<SearchField aria-label="即时搜索" value="" onSearch={onSearch} />);
    const input = screen.getByRole("searchbox", { name: "即时搜索" });

    fireEvent.keyDown(input, { key: "Enter", target: { value: "TextArea" } });
    expect(onSearch).toHaveBeenCalledWith("TextArea", expect.objectContaining({ source: "enter" }));
  });
});
