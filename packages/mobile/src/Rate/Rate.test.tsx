// @vitest-environment jsdom
import { createRef } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("renders read-only ratings as a labelled meter", () => {
    render(<Rate aria-label="用户评分" value={4} readOnly />);
    const rating = screen.getByRole("meter", { name: "用户评分" });
    expect(rating.getAttribute("aria-valuenow")).toBe("4");
    expect(rating.getAttribute("aria-valuetext")).toBe("4 / 5 星");
    expect(screen.queryByRole("slider")).toBeNull();
  });

  it("inherits Field labels and errors", () => {
    render(
      <Field label="服务评分" error="请完成评分">
        <Rate aria-invalid="grammar" />
      </Field>
    );

    const rating = screen.getByRole("slider", { name: "服务评分" });
    expect(rating.getAttribute("aria-invalid")).toBe("true");
    expect(rating.getAttribute("aria-describedby")).toContain("error");
  });

  it("merges nested Field and caller accessibility relationships", () => {
    render(
      <>
        <span id="rating-name">订单评分</span>
        <span id="rating-hint">仅评价本次服务</span>
        <Field label="服务评分" description="一到五分">
          <div>
            <Rate aria-labelledby="rating-name" aria-describedby="rating-hint" />
          </div>
        </Field>
      </>
    );

    const rating = screen.getByRole("slider", { name: "订单评分 服务评分" });
    expect(rating.getAttribute("aria-labelledby")).toContain("rating-name");
    expect(rating.getAttribute("aria-labelledby")).toContain("label");
    expect(rating.getAttribute("aria-describedby")).toContain("rating-hint");
    expect(rating.getAttribute("aria-describedby")).toContain("description");
  });

  it.each([
    [false, "false", "default"],
    ["false", "false", "default"],
    ["grammar", "grammar", "error"],
    ["spelling", "spelling", "error"]
  ] as const)(
    "preserves aria-invalid=%s on the interactive semantic root",
    (ariaInvalid, expectedAttribute, expectedState) => {
      render(<Rate aria-invalid={ariaInvalid} aria-label="语义评分" />);
      const rating = screen.getByRole("slider", { name: "语义评分" });
      expect(rating.getAttribute("aria-invalid")).toBe(expectedAttribute);
      const root = rating.parentElement;
      expect(root && root.getAttribute("data-state")).toBe(expectedState);
    }
  );

  it("puts the caller token on the read-only meter without duplicating it on the hidden input", () => {
    render(<Rate aria-invalid="spelling" aria-label="只读语义评分" readOnly value={4} />);
    expect(screen.getByRole("meter", { name: "只读语义评分" }).getAttribute("aria-invalid")).toBe(
      "spelling"
    );
    expect(document.querySelectorAll('[aria-invalid="spelling"]')).toHaveLength(1);
  });

  it("clamps and aligns controlled and uncontrolled values", () => {
    const { rerender } = render(
      <Rate aria-label="评分" count={5} defaultValue={2.7} allowHalf={false} />
    );
    const rating = screen.getByRole("slider", { name: "评分" });
    expect(rating).toHaveProperty("value", "3");

    rerender(<Rate aria-label="评分" count={5} value={8} allowHalf />);
    expect(rating).toHaveProperty("value", "5");
    expect(rating.getAttribute("aria-valuetext")).toBe("5 / 5 星");

    rerender(<Rate aria-label="评分" count={5} value={2.7} allowHalf />);
    expect(rating).toHaveProperty("value", "2.5");
  });

  it("maps repeated pointer selection correctly in RTL", () => {
    const onChange = vi.fn();
    render(<Rate aria-label="RTL 评分" dir="rtl" defaultValue={4} onChange={onChange} />);
    const rating = screen.getByRole("slider", { name: "RTL 评分" });
    vi.spyOn(rating, "getBoundingClientRect").mockReturnValue({
      bottom: 40,
      height: 40,
      left: 0,
      right: 100,
      top: 0,
      width: 100,
      x: 0,
      y: 0,
      toJSON: () => ({})
    });

    fireEvent.pointerDown(rating, { clientX: 20 });
    fireEvent.click(rating, { detail: 1 });
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("does not clear after a pointer session changes the range value", () => {
    const onChange = vi.fn();
    render(<Rate aria-label="拖动评分" defaultValue={2} onChange={onChange} />);
    const rating = screen.getByRole("slider", { name: "拖动评分" });
    vi.spyOn(rating, "getBoundingClientRect").mockReturnValue({
      bottom: 40,
      height: 40,
      left: 0,
      right: 100,
      top: 0,
      width: 100,
      x: 0,
      y: 0,
      toJSON: () => ({})
    });

    fireEvent.pointerDown(rating, { clientX: 40 });
    fireEvent.change(rating, { target: { value: "4" } });
    fireEvent.click(rating, { detail: 1 });

    expect(rating).toHaveProperty("value", "4");
    expect(onChange).toHaveBeenCalledWith(4);
    expect(onChange).not.toHaveBeenCalledWith(0);
  });

  it("keeps read-only values in native forms and forwards the input ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <form aria-label="评价表单">
        <Field label="用户评分">
          <Rate name="rating" value={4.5} allowHalf readOnly ref={ref} />
        </Field>
      </form>
    );
    const form = screen.getByRole("form", { name: "评价表单" });
    if (!(form instanceof HTMLFormElement)) throw new Error("Expected a form element");
    const rating = screen.getByRole("meter", { name: "用户评分" });
    expect(rating.getAttribute("aria-valuetext")).toBe("4.5 / 5 星");
    expect(new FormData(form).get("rating")).toBe("4.5");
    expect(ref.current && ref.current.type).toBe("hidden");
  });

  it("restores an uncontrolled form value without calling onChange", async () => {
    const onChange = vi.fn();
    render(
      <form aria-label="评分表单">
        <Rate aria-label="评分" name="rating" defaultValue={2} onChange={onChange} />
      </form>
    );
    const form = screen.getByRole("form", { name: "评分表单" });
    if (!(form instanceof HTMLFormElement)) throw new Error("Expected a form element");
    const rating = screen.getByRole("slider", { name: "评分" });
    fireEvent.change(rating, { target: { value: "4" } });
    expect(new FormData(form).get("rating")).toBe("4");

    form.reset();
    expect(rating).toHaveProperty("value", "2");
    expect(new FormData(form).get("rating")).toBe("2");
    await waitFor(() => expect(rating).toHaveProperty("value", "2"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("keeps the current value when native form reset is cancelled", async () => {
    render(
      <form aria-label="评分表单" onReset={(event) => event.preventDefault()}>
        <Rate aria-label="评分" name="rating" defaultValue={2} />
      </form>
    );
    const form = screen.getByRole("form", { name: "评分表单" });
    if (!(form instanceof HTMLFormElement)) throw new Error("Expected a form element");
    const rating = screen.getByRole("slider", { name: "评分" });
    fireEvent.change(rating, { target: { value: "4" } });

    form.reset();
    await Promise.resolve();
    expect(rating).toHaveProperty("value", "4");
    expect(new FormData(form).get("rating")).toBe("4");
  });
});
