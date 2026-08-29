// @vitest-environment jsdom
import { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { Selector } from "./Selector";

const options = [
  { value: "delivery", label: "配送", description: "预计两天送达" },
  { value: "pickup", label: "自提" },
  { value: "locker", label: "快递柜", disabled: true }
] as const;

describe("Selector", () => {
  it("publishes normalized single selection and an explicit clear source", () => {
    const onChange = vi.fn();
    render(
      <Selector
        aria-label="履约方式"
        options={options}
        defaultValue={["delivery"]}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole("radio", { name: "自提" }));
    expect(onChange).toHaveBeenLastCalledWith(
      ["pickup"],
      [options[1]],
      expect.objectContaining({ option: options[1], source: "option" })
    );
    fireEvent.click(screen.getByRole("radio", { name: "自提" }));
    expect(onChange).toHaveBeenLastCalledWith(
      [],
      [],
      expect.objectContaining({ option: options[1], source: "clear" })
    );
  });

  it("maintains source option order, de-duplicates identities, and ignores disabled input", () => {
    const onChange = vi.fn();
    render(
      <Selector
        aria-label="服务范围"
        options={[...options, { value: "pickup", label: "重复自提" }]}
        defaultValue={["pickup"]}
        multiple
        onChange={onChange}
      />
    );

    expect(screen.queryByText("重复自提")).toBeNull();
    fireEvent.click(screen.getByRole("checkbox", { name: "配送" }));
    expect(onChange).toHaveBeenLastCalledWith(
      ["delivery", "pickup"],
      [options[0], options[1]],
      expect.objectContaining({ source: "option" })
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "快递柜" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("checkbox", { name: "快递柜" })).toHaveProperty("disabled", true);
  });

  it("keeps controlled state authoritative", () => {
    const onChange = vi.fn();
    render(
      <Selector aria-label="履约方式" options={options} value={["delivery"]} onChange={onChange} />
    );

    fireEvent.click(screen.getByRole("radio", { name: "自提" }));
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByRole("radio", { name: "配送" })).toHaveProperty("checked", true);
    expect(screen.getByRole("radio", { name: "自提" })).toHaveProperty("checked", false);
  });

  it("uses native required semantics for single and at-least-one multiple selection", () => {
    const { rerender } = render(
      <Selector aria-label="履约方式" options={options} required allowClear />
    );
    const delivery = screen.getByRole("radio", { name: "配送" });
    expect(delivery).toHaveProperty("required", true);
    fireEvent.click(delivery);
    fireEvent.click(delivery);
    expect(delivery).toHaveProperty("checked", true);

    rerender(<Selector key="multiple" aria-label="服务范围" options={options} required multiple />);
    const deliveryCheckbox = screen.getByRole("checkbox", { name: "配送" });
    const pickupCheckbox = screen.getByRole("checkbox", { name: "自提" });
    expect(deliveryCheckbox).toHaveProperty("required", true);
    expect(pickupCheckbox).toHaveProperty("required", false);
    expect(screen.getByRole("group", { name: "服务范围" }).hasAttribute("aria-required")).toBe(
      false
    );
    fireEvent.click(pickupCheckbox);
    expect(deliveryCheckbox).toHaveProperty("required", false);
  });

  it("does not let a disabled selected option satisfy required or enter FormData", () => {
    const initialOptions = [
      { value: "delivery", label: "配送" },
      { value: "pickup", label: "自提" }
    ] as const;
    const { rerender } = render(
      <form data-testid="required-form">
        <Selector
          aria-label="履约方式"
          name="shipping"
          options={initialOptions}
          value={["delivery"]}
          required
        />
      </form>
    );
    const form = screen.getByTestId<HTMLFormElement>("required-form");
    expect(form.checkValidity()).toBe(true);

    const disabledOptions = [
      { value: "delivery", label: "配送", disabled: true },
      { value: "pickup", label: "自提" }
    ] as const;
    rerender(
      <form data-testid="required-form">
        <Selector
          aria-label="履约方式"
          name="shipping"
          options={disabledOptions}
          value={["delivery"]}
          required
        />
      </form>
    );
    expect(form.checkValidity()).toBe(false);
    expect(new FormData(form).getAll("shipping")).toEqual([]);
    expect(screen.getByRole("radio", { name: "配送" })).toHaveProperty("checked", false);

    rerender(
      <form data-testid="required-form">
        <Selector
          aria-label="服务范围"
          name="shipping"
          options={disabledOptions}
          value={["delivery"]}
          required
          multiple
        />
      </form>
    );
    expect(form.checkValidity()).toBe(false);
    expect(new FormData(form).getAll("shipping")).toEqual([]);
    expect(screen.getByRole("checkbox", { name: "配送" })).toHaveProperty("checked", false);
  });

  it("submits native values and supports external form ownership", () => {
    render(
      <>
        <form id="checkout" data-testid="form" />
        <Selector
          aria-label="服务范围"
          form="checkout"
          name="service"
          options={options}
          defaultValue={["delivery", "pickup"]}
          multiple
        />
      </>
    );

    const form = screen.getByTestId<HTMLFormElement>("form");
    const inputs = screen.getAllByRole<HTMLInputElement>("checkbox");
    expect(inputs[0]!.form).toBe(form);
    expect(new FormData(form).getAll("service")).toEqual(["delivery", "pickup"]);
  });

  it("restores DOM, FormData and state immediately on native form reset", () => {
    vi.useFakeTimers();
    render(
      <form data-testid="form">
        <Selector
          aria-label="履约方式"
          name="shipping"
          options={options}
          defaultValue={["delivery"]}
        />
      </form>
    );

    fireEvent.click(screen.getByRole("radio", { name: "自提" }));
    expect(screen.getByRole("radio", { name: "自提" })).toHaveProperty("checked", true);
    const form = screen.getByTestId<HTMLFormElement>("form");
    act(() => form.reset());
    expect(screen.getByRole("radio", { name: "配送" })).toHaveProperty("checked", true);
    expect(new FormData(form).get("shipping")).toBe("delivery");
    void act(() => vi.runAllTimers());
    expect(screen.getByRole("radio", { name: "配送" })).toHaveProperty("checked", true);
    vi.useRealTimers();
  });

  it("survives a parent onReset rerender and respects canceled reset", () => {
    vi.useFakeTimers();

    function ResetHarness({ cancel = false }: { cancel?: boolean }) {
      const [, setRevision] = useState(0);
      return (
        <form
          data-testid="rerender-form"
          onReset={(event) => {
            setRevision((revision) => revision + 1);
            if (cancel) event.preventDefault();
          }}
        >
          <Selector
            aria-label="履约方式"
            name="shipping"
            options={[
              { value: "delivery", label: "配送" },
              { value: "pickup", label: "自提" }
            ]}
            defaultValue={["delivery"]}
          />
        </form>
      );
    }

    const { rerender } = render(<ResetHarness />);
    fireEvent.click(screen.getByRole("radio", { name: "自提" }));
    const form = screen.getByTestId<HTMLFormElement>("rerender-form");
    act(() => form.reset());
    expect(new FormData(form).get("shipping")).toBe("delivery");
    void act(() => vi.runAllTimers());
    expect(screen.getByRole("radio", { name: "配送" })).toHaveProperty("checked", true);

    rerender(<ResetHarness cancel />);
    fireEvent.click(screen.getByRole("radio", { name: "自提" }));
    act(() => form.reset());
    expect(new FormData(form).get("shipping")).toBe("pickup");
    void act(() => vi.runAllTimers());
    expect(screen.getByRole("radio", { name: "自提" })).toHaveProperty("checked", true);
    vi.useRealTimers();
  });

  it("inherits and merges Field labels, descriptions, required, and error state", () => {
    render(
      <>
        <span id="business-hint">业务说明</span>
        <Field label="服务类型" description="选择服务" error="请选择服务类型" required>
          <Selector aria-describedby="business-hint" options={options} />
        </Field>
      </>
    );

    const group = screen.getByRole("radiogroup", { name: "服务类型" });
    expect(group.getAttribute("aria-invalid")).toBe("true");
    expect(group.getAttribute("aria-required")).toBe("true");
    expect(group.getAttribute("aria-describedby")).toContain("business-hint");
    expect(group.getAttribute("aria-describedby")).toContain("description");
    expect(group.getAttribute("aria-describedby")).toContain("error");
    expect(screen.getByRole("radio", { name: "配送" })).toHaveProperty("required", true);
  });

  it.each([
    [false, "false", "default"],
    ["false", "false", "default"],
    ["grammar", "grammar", "error"],
    ["spelling", "spelling", "error"]
  ] as const)(
    "preserves aria-invalid=%s without collapsing its semantics",
    (ariaInvalid, expectedAttribute, expectedState) => {
      render(<Selector aria-invalid={ariaInvalid} aria-label="履约方式" options={options} />);

      const group = screen.getByRole("radiogroup", { name: "履约方式" });
      expect(group.getAttribute("aria-invalid")).toBe(expectedAttribute);
      expect(group.getAttribute("data-state")).toBe(expectedState);
    }
  );

  it("lets Field validation override a caller grammar token", () => {
    render(
      <Field label="服务类型" error="请选择服务">
        <Selector aria-invalid="grammar" options={options} />
      </Field>
    );

    expect(screen.getByRole("radiogroup", { name: "服务类型" }).getAttribute("aria-invalid")).toBe(
      "true"
    );
  });

  it("keeps native controls in the keyboard path while the group is programmatically focusable", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Selector ref={ref} aria-label="履约方式" options={options} />);

    const group = screen.getByRole("radiogroup");
    expect(group).toHaveProperty("tabIndex", -1);
    expect(screen.getByRole("radio", { name: "配送" })).toHaveProperty("tabIndex", 0);
    if (ref.current) ref.current.focus();
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "配送" }));
  });

  it("clamps invalid column counts to a safe grid value", () => {
    const { rerender } = render(<Selector aria-label="履约方式" columns={99} options={options} />);
    expect(screen.getByRole("radiogroup").style.getPropertyValue("--meu-selector-columns")).toBe(
      "6"
    );
    rerender(<Selector aria-label="履约方式" columns={Number.NaN} options={options} />);
    expect(screen.getByRole("radiogroup").style.getPropertyValue("--meu-selector-columns")).toBe(
      "2"
    );
  });
});
