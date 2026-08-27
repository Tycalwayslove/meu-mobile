// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { Rate } from "./Rate";

describe("Rate", () => {
  it("uses native range semantics and supports half values", () => {
    const onChange = vi.fn();
    render(<Rate aria-label="商品评分" allowHalf defaultValue={2} onChange={onChange} />);
    const rating = screen.getByRole("slider", { name: "商品评分" });

    fireEvent.change(rating, { target: { value: "3.5" } });
    expect(rating).toHaveProperty("value", "3.5");
    expect(rating.getAttribute("aria-valuetext")).toBe("3.5 / 5 星");
    expect(onChange).toHaveBeenCalledWith(3.5);
  });

  it("renders read-only ratings as a labelled image", () => {
    render(<Rate aria-label="用户评分" value={4} readOnly />);
    expect(screen.getByRole("img", { name: "用户评分" })).toBeTruthy();
    expect(screen.queryByRole("slider")).toBeNull();
  });

  it("inherits Field labels and errors", () => {
    render(
      <Field label="服务评分" error="请完成评分">
        <Rate />
      </Field>
    );

    const rating = screen.getByRole("slider", { name: "服务评分" });
    expect(rating.getAttribute("aria-invalid")).toBe("true");
    expect(rating.getAttribute("aria-describedby")).toContain("error");
  });
});
