// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { Slider } from "./Slider";

describe("Slider", () => {
  it("uses a native range input and publishes changes", () => {
    const onChange = vi.fn();
    const onChangeComplete = vi.fn();
    render(
      <Slider
        aria-label="价格"
        defaultValue={20}
        min={0}
        max={50}
        step={5}
        showValue
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />
    );
    const slider = screen.getByRole("slider", { name: "价格" });

    fireEvent.change(slider, { target: { value: "35" } });
    fireEvent.pointerUp(slider);
    expect(slider).toHaveProperty("value", "35");
    expect(onChange).toHaveBeenCalledWith(35, expect.anything());
    expect(onChangeComplete).toHaveBeenCalledWith(35, expect.anything());
    expect(screen.getByText("35")).toBeTruthy();
  });

  it("inherits Field semantics and renders marks as presentation", () => {
    render(
      <Field label="配送距离" error="距离不可用">
        <Slider
          marks={[
            { value: 0, label: "近" },
            { value: 100, label: "远" }
          ]}
        />
      </Field>
    );

    const slider = screen.getByRole("slider", { name: "配送距离" });
    expect(slider.getAttribute("aria-invalid")).toBe("true");
    expect(slider.getAttribute("aria-describedby")).toContain("error");
    expect(screen.getByText("近")).toBeTruthy();
  });
});
