// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
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
