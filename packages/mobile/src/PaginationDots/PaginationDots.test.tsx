// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

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
});
