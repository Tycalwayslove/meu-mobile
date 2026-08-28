// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

    fireEvent.pointerDown(slider);
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

  it("normalizes reversed bounds, invalid steps and controlled values", () => {
    const { rerender } = render(
      <Slider aria-label="库存" min={10} max={0} step={3} value={8} showValue />
    );
    const slider = screen.getByRole("slider", { name: "库存" });

    expect(slider).toHaveProperty("min", "0");
    expect(slider).toHaveProperty("max", "9");
    expect(slider).toHaveProperty("value", "9");
    expect(screen.getByText("9")).toBeTruthy();

    rerender(<Slider aria-label="库存" min={0} max={10} step={0} value={20} />);
    expect(slider).toHaveProperty("step", "1");
    expect(slider).toHaveProperty("value", "10");
  });

  it("completes each changed pointer or keyboard interaction once", () => {
    const onChangeComplete = vi.fn();
    render(<Slider aria-label="音量" defaultValue={2} onChangeComplete={onChangeComplete} />);
    const slider = screen.getByRole("slider", { name: "音量" });

    fireEvent.pointerDown(slider);
    fireEvent.pointerUp(slider);
    expect(onChangeComplete).not.toHaveBeenCalled();

    fireEvent.pointerDown(slider);
    fireEvent.change(slider, { target: { value: "3" } });
    fireEvent.pointerUp(slider);
    fireEvent.pointerUp(slider);
    expect(onChangeComplete).toHaveBeenCalledTimes(1);
    expect(onChangeComplete).toHaveBeenLastCalledWith(3, expect.anything());

    fireEvent.keyDown(slider, { key: "ArrowUp" });
    fireEvent.change(slider, { target: { value: "4" } });
    fireEvent.keyUp(slider, { key: "ArrowUp" });
    expect(onChangeComplete).toHaveBeenCalledTimes(2);
  });

  it("restores the uncontrolled default on native form reset without publishing", async () => {
    const onChange = vi.fn();
    render(
      <form aria-label="价格表单">
        <Slider aria-label="价格" name="price" defaultValue={20} onChange={onChange} />
      </form>
    );
    const form = screen.getByRole("form", { name: "价格表单" });
    const slider = screen.getByRole("slider", { name: "价格" });

    fireEvent.change(slider, { target: { value: "60" } });
    expect(new FormData(form as HTMLFormElement).get("price")).toBe("60");
    (form as HTMLFormElement).reset();

    expect(slider).toHaveProperty("value", "20");
    expect(new FormData(form as HTMLFormElement).get("price")).toBe("20");
    await waitFor(() => expect(slider).toHaveProperty("value", "20"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("keeps the current value when native form reset is cancelled", async () => {
    render(
      <form aria-label="价格表单" onReset={(event) => event.preventDefault()}>
        <Slider aria-label="价格" name="price" defaultValue={20} />
      </form>
    );
    const form = screen.getByRole("form", { name: "价格表单" });
    const slider = screen.getByRole("slider", { name: "价格" });
    fireEvent.change(slider, { target: { value: "60" } });

    (form as HTMLFormElement).reset();
    await Promise.resolve();
    expect(slider).toHaveProperty("value", "60");
    expect(new FormData(form as HTMLFormElement).get("price")).toBe("60");
  });

  it("uses logical mark positions for RTL layouts", () => {
    render(<Slider aria-label="RTL" dir="rtl" marks={[{ value: 25, label: "ربع" }]} />);
    expect(screen.getByText("ربع").style.insetInlineStart).toBe("25%");
    expect(screen.getByRole("slider", { name: "RTL" }).getAttribute("dir")).toBe("rtl");
  });
});
