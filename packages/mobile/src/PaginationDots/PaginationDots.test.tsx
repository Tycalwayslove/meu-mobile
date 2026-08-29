// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { PaginationDots } from "./PaginationDots";

describe("PaginationDots", () => {
  it("clamps values and exposes a localized summary", () => {
    render(<PaginationDots count={3.8} activeIndex={99} />);
    const indicator = screen.getByRole("img", { name: "第 3 页，共 3 页" });
    expect(indicator.children).toHaveLength(3);
    expect(indicator.getAttribute("data-index")).toBe("2");
    expect(indicator.querySelectorAll('[data-active="true"]')).toHaveLength(1);
  });

  it("supports English and an empty state without interactive semantics", () => {
    render(
      <ConfigProvider locale="en-US">
        <PaginationDots count={-2} activeIndex={0} variant="line" />
      </ConfigProvider>
    );
    const indicator = screen.getByRole("img", { name: "Page 0 of 0" });
    expect(indicator.children).toHaveLength(0);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("compresses long ranges and only becomes interactive when requested", () => {
    const onChange = vi.fn();
    render(
      <div dir="rtl">
        <PaginationDots count={20} activeIndex={10} interactive onChange={onChange} />
      </div>
    );
    const group = screen.getByRole("group", { name: "第 11 页，共 20 页" });
    expect(group.querySelectorAll("button")).toHaveLength(5);
    expect(group.textContent).toContain("…");
    const current = screen.getByRole("button", { name: "前往第 11 页，共 20 页" });
    expect(current.getAttribute("aria-current")).toBe("page");
    fireEvent.click(screen.getByRole("button", { name: "前往第 12 页，共 20 页" }));
    expect(onChange).toHaveBeenCalledWith(11, expect.anything());
  });

  it("uses one tab stop and physical arrow navigation in LTR, RTL and vertical layouts", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <PaginationDots
        aria-label="商品分页"
        count={5}
        activeIndex={2}
        interactive
        onChange={onChange}
      />
    );
    const current = screen.getByRole("button", { name: "前往第 3 页，共 5 页" });
    const next = screen.getByRole("button", { name: "前往第 4 页，共 5 页" });
    expect(current.getAttribute("tabindex")).toBe("0");
    expect(next.getAttribute("tabindex")).toBe("-1");
    await user.tab();
    expect(document.activeElement).toBe(current);
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(next);
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith(3, expect.anything());

    rerender(
      <div dir="rtl">
        <PaginationDots aria-label="RTL 分页" count={5} activeIndex={2} interactive />
      </div>
    );
    const rtlCurrent = screen.getByRole("button", { name: "前往第 3 页，共 5 页" });
    rtlCurrent.focus();
    fireEvent.keyDown(rtlCurrent, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "前往第 4 页，共 5 页" })
    );

    rerender(
      <PaginationDots
        aria-label="纵向分页"
        count={5}
        activeIndex={2}
        interactive
        direction="vertical"
      />
    );
    const verticalCurrent = screen.getByRole("button", { name: "前往第 3 页，共 5 页" });
    verticalCurrent.focus();
    fireEvent.keyDown(verticalCurrent, { key: "ArrowDown" });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "前往第 4 页，共 5 页" })
    );
    fireEvent.keyDown(document.activeElement!, { key: "Home" });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "前往第 1 页，共 5 页" })
    );
  });

  it("supports a globally disabled interactive state without publishing navigation", () => {
    const onChange = vi.fn();
    render(<PaginationDots count={5} activeIndex={2} interactive disabled onChange={onChange} />);
    const group = screen.getByRole("group");
    expect(group.getAttribute("aria-disabled")).toBe("true");
    for (const target of screen.getAllByRole("button")) {
      expect(target.hasAttribute("disabled")).toBe(true);
      expect(target.getAttribute("tabindex")).toBe("-1");
      fireEvent.click(target);
    }
    expect(onChange).not.toHaveBeenCalled();
  });

  it("uses aria-labelledby, forwards refs and composes focus capture handlers", () => {
    const ref = createRef<HTMLDivElement>();
    const onFocusCapture = vi.fn();
    const onBlurCapture = vi.fn();
    render(
      <>
        <h2 id="pages-heading">商品分页</h2>
        <PaginationDots
          ref={ref}
          aria-labelledby="pages-heading"
          count={5}
          activeIndex={2}
          interactive
          onFocusCapture={onFocusCapture}
          onBlurCapture={onBlurCapture}
        />
      </>
    );
    const group = screen.getByRole("group", { name: "商品分页" });
    expect(group.getAttribute("aria-label")).toBeNull();
    expect(ref.current).toBe(group);
    const current = screen.getByRole("button", { name: "前往第 3 页，共 5 页" });
    current.focus();
    expect(onFocusCapture).toHaveBeenCalledOnce();
    current.blur();
    expect(onBlurCapture).toHaveBeenCalledOnce();
  });

  it("recovers focus to the controlled page when compression removes the focused marker", () => {
    const { rerender } = render(
      <PaginationDots count={20} activeIndex={2} interactive maxVisible={7} />
    );
    const pageFour = screen.getByRole("button", { name: "前往第 4 页，共 20 页" });
    pageFour.focus();
    rerender(<PaginationDots count={20} activeIndex={17} interactive maxVisible={7} />);
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "前往第 18 页，共 20 页" })
    );
  });

  it("never exceeds a caller-provided five-item compression budget", () => {
    render(<PaginationDots count={100} activeIndex={50} interactive maxVisible={5} />);
    const group = screen.getByRole("group");
    expect(group.children).toHaveLength(5);
    expect(group.querySelectorAll("button")).toHaveLength(3);
    expect(group.querySelectorAll('[aria-hidden="true"]')).toHaveLength(5);
  });

  it("normalizes non-finite indexes and bounds extreme allocation inputs", () => {
    const { rerender } = render(<PaginationDots count={10} activeIndex={Number.NaN} interactive />);
    let group = screen.getByRole("group", { name: "第 1 页，共 10 页" });
    expect(group.getAttribute("data-index")).toBe("0");
    expect(group.querySelectorAll('[aria-current="page"]')).toHaveLength(1);

    rerender(
      <PaginationDots
        count={Number.MAX_VALUE}
        activeIndex={Number.POSITIVE_INFINITY}
        interactive
        maxVisible={Number.MAX_VALUE}
      />
    );
    group = screen.getByRole("group");
    expect(Number(group.getAttribute("data-count"))).toBe(Number.MAX_SAFE_INTEGER);
    expect(group.children.length).toBeLessThanOrEqual(99);
    expect(group.getAttribute("data-index")).toBe("0");
  });
});
