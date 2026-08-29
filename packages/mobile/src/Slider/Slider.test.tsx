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
    expect(screen.getByText("35").getAttribute("aria-hidden")).toBe("true");
  });

  it("inherits Field semantics and renders marks as presentation", () => {
    render(
      <Field label="配送距离" error="距离不可用">
        <Slider
          aria-invalid="grammar"
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

  it("merges nested Field and caller accessibility relationships", () => {
    render(
      <>
        <span id="distance-name">配送范围</span>
        <span id="distance-hint">单位为公里</span>
        <Field label="配送距离" description="零到一百公里">
          <div>
            <Slider aria-labelledby="distance-name" aria-describedby="distance-hint" />
          </div>
        </Field>
      </>
    );

    const slider = screen.getByRole("slider", { name: "配送范围 配送距离" });
    expect(slider.getAttribute("aria-labelledby")).toContain("distance-name");
    expect(slider.getAttribute("aria-labelledby")).toContain("label");
    expect(slider.getAttribute("aria-describedby")).toContain("distance-hint");
    expect(slider.getAttribute("aria-describedby")).toContain("description");
  });

  it("renders read-only values as a meter while preserving native form data and ref", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(
      <form aria-label="预算表单">
        <Field label="预算上限" description="审核后不可修改">
          <Slider ref={ref} name="budget" value={35} readOnly showValue />
        </Field>
      </form>
    );

    const meter = screen.getByRole("meter", { name: "预算上限" });
    const form = screen.getByRole<HTMLFormElement>("form", { name: "预算表单" });
    expect(meter.getAttribute("aria-valuenow")).toBe("35");
    expect(meter.getAttribute("aria-describedby")).toContain("description");
    expect(screen.queryByRole("slider")).toBeNull();
    expect(new FormData(form).get("budget")).toBe("35");
    expect(ref.current && ref.current.type).toBe("hidden");
  });

  it("excludes disabled read-only values from FormData", () => {
    render(
      <form aria-label="禁用预算表单">
        <Slider aria-label="预算" name="budget" value={35} readOnly disabled />
      </form>
    );
    const form = screen.getByRole<HTMLFormElement>("form", { name: "禁用预算表单" });
    expect(new FormData(form).get("budget")).toBeNull();
    expect(screen.getByRole("meter", { name: "预算" }).getAttribute("data-state")).toBe("disabled");
  });

  it.each([
    [false, "false", "default"],
    ["false", "false", "default"],
    ["grammar", "grammar", "error"],
    ["spelling", "spelling", "error"]
  ] as const)(
    "preserves aria-invalid=%s on the native range",
    (ariaInvalid, expectedAttribute, expectedState) => {
      render(<Slider aria-invalid={ariaInvalid} aria-label="语义滑块" />);
      const slider = screen.getByRole("slider", { name: "语义滑块" });
      expect(slider.getAttribute("aria-invalid")).toBe(expectedAttribute);
      const controlRow = slider.parentElement;
      const root = controlRow ? controlRow.parentElement : null;
      expect(root && root.getAttribute("data-state")).toBe(expectedState);
    }
  );

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
