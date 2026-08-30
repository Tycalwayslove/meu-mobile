// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Radio } from "./Radio";
import { RadioGroup } from "./RadioGroup";

describe("Radio commercial lifecycle", () => {
  it("restores the full readonly group after a keyboard-style native selection", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <form>
        <RadioGroup defaultValue="standard" name="shipping" onChange={onChange} readOnly>
          <Radio value="standard">标准配送</Radio>
          <Radio value="express">急速配送</Radio>
        </RadioGroup>
      </form>
    );
    const standard = screen.getByRole<HTMLInputElement>("radio", { name: "标准配送" });
    const express = screen.getByRole<HTMLInputElement>("radio", { name: "急速配送" });

    fireEvent.keyDown(standard, { key: "ArrowRight" });
    standard.checked = false;
    express.checked = true;
    fireEvent.click(express, { detail: 0 });

    await waitFor(() => {
      expect(standard.checked).toBe(true);
      expect(express.checked).toBe(false);
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(new FormData(container.querySelector("form")!).get("shipping")).toBe("standard");
  });

  it("uses native required validation and submits exactly one selected value", () => {
    const onInvalid = vi.fn((event: React.InvalidEvent<HTMLInputElement>) =>
      event.preventDefault()
    );
    const { container } = render(
      <form>
        <RadioGroup aria-label="配送方式" name="shipping" required>
          <Radio onInvalid={onInvalid} value="standard">
            标准配送
          </Radio>
          <Radio onInvalid={onInvalid} value="express">
            急速配送
          </Radio>
        </RadioGroup>
      </form>
    );
    const form = container.querySelector("form")!;
    const express = screen.getByRole<HTMLInputElement>("radio", { name: "急速配送" });

    expect(form.reportValidity()).toBe(false);
    expect(onInvalid).toHaveBeenCalled();
    expect(new FormData(form).has("shipping")).toBe(false);
    fireEvent.click(express);
    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).getAll("shipping")).toEqual(["express"]);
  });

  it("excludes a disabled checked group from FormData and constraint validation", () => {
    const { container } = render(
      <form>
        <RadioGroup defaultValue="standard" disabled name="shipping" required>
          <Radio value="standard">标准配送</Radio>
          <Radio value="express">急速配送</Radio>
        </RadioGroup>
      </form>
    );
    const form = container.querySelector("form")!;

    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).has("shipping")).toBe(false);
  });
});
