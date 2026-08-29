// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(0);
  });

  it("merges caller and Field descriptions without duplicate IDs", () => {
    render(
      <>
        <span id="external-search-help">外部搜索提示</span>
        <Field label="订单搜索" description="支持订单号" error="请输入关键词">
          <SearchField aria-describedby="external-search-help external-search-help" />
        </Field>
      </>
    );
    const input = screen.getByRole("searchbox", { name: "订单搜索" });
    const ids = (input.getAttribute("aria-describedby") || "").split(" ");

    expect(ids).toContain("external-search-help");
    expect(ids.some((id) => id.includes("description"))).toBe(true);
    expect(ids.some((id) => id.includes("error"))).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("forwards native attributes and the real input ref", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(
      <SearchField
        ref={ref}
        aria-label="原生属性搜索"
        autoComplete="search"
        inputMode="search"
        maxLength={40}
        name="query"
        required
      />
    );
    const input = screen.getByRole<HTMLInputElement>("searchbox", { name: "原生属性搜索" });

    expect(ref.current).toBe(input);
    expect(input.name).toBe("query");
    expect(input.required).toBe(true);
    expect(input.autocomplete).toBe("search");
    expect(input.inputMode).toBe("search");
    expect(input.maxLength).toBe(40);
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

  it("restores an uncontrolled value on native form reset without publishing a change", async () => {
    const onChange = vi.fn();
    const onSearch = vi.fn();
    const { container } = render(
      <form>
        <SearchField
          aria-label="可重置搜索"
          defaultValue="初始订单"
          name="query"
          onChange={onChange}
          onSearch={onSearch}
        />
      </form>
    );
    const form = container.querySelector("form")!;
    const input = screen.getByRole<HTMLInputElement>("searchbox", { name: "可重置搜索" });

    fireEvent.change(input, { target: { value: "修改后的订单" } });
    input.focus();
    fireEvent.compositionStart(input);
    expect(new FormData(form).get("query")).toBe("修改后的订单");
    act(() => form.reset());

    expect(input.value).toBe("初始订单");
    await waitFor(() => expect(input.value).toBe("初始订单"));
    expect(document.activeElement).toBe(input);
    expect(new FormData(form).get("query")).toBe("初始订单");
    expect(onChange).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSearch).toHaveBeenCalledOnce();
  });

  it("honors cancelled reset and an external form owner", async () => {
    const onReset = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());
    render(
      <>
        <form id="search-owner" onReset={onReset} />
        <SearchField
          aria-label="外部表单搜索"
          defaultValue="初始"
          form="search-owner"
          name="query"
        />
      </>
    );
    const form = document.getElementById("search-owner") as HTMLFormElement;
    const input = screen.getByRole<HTMLInputElement>("searchbox", { name: "外部表单搜索" });

    fireEvent.change(input, { target: { value: "保留修改" } });
    act(() => form.reset());
    expect(input.value).toBe("保留修改");
    await act(() => new Promise<void>((resolve) => window.setTimeout(resolve, 0)));

    expect(onReset).toHaveBeenCalledOnce();
    expect(input.value).toBe("保留修改");
    expect(new FormData(form).get("query")).toBe("保留修改");
  });

  it("keeps the latest controlled value after native form reset", async () => {
    const { container, rerender } = render(
      <form>
        <SearchField aria-label="受控重置" name="query" value="第一版" />
      </form>
    );
    rerender(
      <form>
        <SearchField aria-label="受控重置" name="query" value="第二版" />
      </form>
    );
    const form = container.querySelector("form")!;
    const input = screen.getByRole<HTMLInputElement>("searchbox", { name: "受控重置" });

    act(() => form.reset());
    await waitFor(() => expect(input.value).toBe("第二版"));
    expect(new FormData(form).get("query")).toBe("第二版");
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

  it("keeps the non-standard native search event separate from the Enter callback", () => {
    const onSearch = vi.fn();
    const nativeSearch = vi.fn();
    render(<SearchField aria-label="原生事件" defaultValue="订单" onSearch={onSearch} />);
    const input = screen.getByRole("searchbox", { name: "原生事件" });
    input.addEventListener("search", nativeSearch);

    fireEvent(input, new Event("search", { bubbles: true }));

    expect(nativeSearch).toHaveBeenCalledOnce();
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("does not claim Escape as a cross-browser cancel action", () => {
    const onKeyDown = vi.fn();
    const onSearch = vi.fn();
    render(
      <SearchField
        aria-label="取消边界"
        defaultValue="订单"
        onKeyDown={onKeyDown}
        onSearch={onSearch}
      />
    );
    const input = screen.getByRole<HTMLInputElement>("searchbox", { name: "取消边界" });

    expect(fireEvent.keyDown(input, { key: "Escape" })).toBe(true);
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(onSearch).not.toHaveBeenCalled();
    expect(input.value).toBe("订单");
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
    fireEvent.keyDown(input, { key: "Enter", keyCode: 229 });
    expect(onSearch).not.toHaveBeenCalled();
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

  it("treats controlled clear as a rejectable value request", () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    render(
      <SearchField aria-label="受控清除" value="固定查询" onChange={onChange} onClear={onClear} />
    );
    const input = screen.getByRole<HTMLInputElement>("searchbox", { name: "受控清除" });

    fireEvent.click(screen.getByRole("button", { name: "清除搜索" }));

    expect(onChange).toHaveBeenCalledWith("", expect.objectContaining({ source: "clear" }));
    expect(onClear).toHaveBeenCalledOnce();
    expect(input.value).toBe("固定查询");
    expect(document.activeElement).toBe(input);
  });

  it("announces loading, hides clear and blocks repeated search and form submission", async () => {
    const onSearch = vi.fn();
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());
    const user = userEvent.setup();
    render(
      <form onSubmit={onSubmit}>
        <SearchField
          aria-label="远程搜索"
          defaultValue="订单"
          loading
          loadingLabel="订单搜索中"
          onSearch={onSearch}
        />
      </form>
    );
    const input = screen.getByRole("searchbox", { name: "远程搜索" });
    const root = input.parentElement;

    await user.click(input);
    await user.keyboard("{Enter}");
    const keepsNativeDefault = fireEvent.keyDown(input, { key: "Enter" });
    expect(keepsNativeDefault).toBe(false);
    expect(onSearch).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("status", { name: "订单搜索中" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "清除搜索" })).toBeNull();
    expect(input.getAttribute("aria-busy")).toBe("true");
    expect(root && root.getAttribute("data-state")).toBe("loading");
  });

  it("returns keyboard focus to the input when loading replaces a focused clear action", async () => {
    const { rerender } = render(
      <SearchField aria-label="焦点搜索" defaultValue="订单" loading={false} />
    );
    const input = screen.getByRole<HTMLInputElement>("searchbox", { name: "焦点搜索" });
    const clearAction = screen.getByRole("button", { name: "清除搜索" });
    clearAction.focus();
    expect(document.activeElement).toBe(clearAction);

    rerender(<SearchField aria-label="焦点搜索" defaultValue="订单" loading />);

    await waitFor(() => expect(document.activeElement).toBe(input));
    expect(screen.queryByRole("button", { name: "清除搜索" })).toBeNull();
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

  it("uses native disabled and read-only FormData semantics", () => {
    const { container } = render(
      <form>
        <SearchField aria-label="禁用条件" defaultValue="disabled" disabled name="disabledQuery" />
        <SearchField aria-label="只读条件" defaultValue="readonly" name="readOnlyQuery" readOnly />
      </form>
    );
    const form = container.querySelector("form")!;
    const data = new FormData(form);

    expect(data.has("disabledQuery")).toBe(false);
    expect(data.get("readOnlyQuery")).toBe("readonly");
  });

  it("applies an explicit writing direction to both the visual root and native input", () => {
    render(<SearchField aria-label="RTL 搜索" defaultValue="طلب" dir="rtl" />);
    const input = screen.getByRole("searchbox", { name: "RTL 搜索" });

    expect(input.getAttribute("dir")).toBe("rtl");
    expect(input.parentElement && input.parentElement.getAttribute("dir")).toBe("rtl");
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
