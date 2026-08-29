// @vitest-environment jsdom
import { useState } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("clears an optional active single selection with the native Space path", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Selector
        aria-label="履约方式"
        options={options}
        defaultValue={["delivery"]}
        onChange={onChange}
      />
    );

    const delivery = screen.getByRole("radio", { name: "配送" });
    await user.tab();
    expect(document.activeElement).toBe(delivery);
    await user.keyboard(" ");
    expect(delivery).toHaveProperty("checked", false);
    expect(onChange).toHaveBeenLastCalledWith(
      [],
      [],
      expect.objectContaining({ option: options[0], source: "clear" })
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

  it("keeps every enabled checkbox in the native Tab and Space path", async () => {
    const user = userEvent.setup();
    render(<Selector aria-label="服务范围" options={options} multiple />);

    const delivery = screen.getByRole("checkbox", { name: "配送" });
    const pickup = screen.getByRole("checkbox", { name: "自提" });
    await user.tab();
    expect(document.activeElement).toBe(delivery);
    await user.keyboard(" ");
    expect(delivery).toHaveProperty("checked", true);
    await user.tab();
    expect(document.activeElement).toBe(pickup);
    await user.keyboard(" ");
    expect(pickup).toHaveProperty("checked", true);
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(document.activeElement).toBe(delivery);
  });

  it("enforces maxCount without removing blocked options from the keyboard path", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const limitOptions = [
      { value: "delivery", label: "配送" },
      { value: "pickup", label: "自提" },
      { value: "store", label: "门店" }
    ] as const;
    render(
      <Selector
        aria-label="服务范围"
        defaultValue={["delivery"]}
        maxCount={2}
        multiple
        onChange={onChange}
        options={limitOptions}
      />
    );

    const delivery = screen.getByRole("checkbox", { name: "配送" });
    const pickup = screen.getByRole("checkbox", { name: "自提" });
    const store = screen.getByRole("checkbox", { name: "门店" });
    await user.click(pickup);
    expect(store.getAttribute("aria-disabled")).toBe("true");
    expect(store).toHaveProperty("disabled", false);
    delivery.focus();
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(store);
    await user.keyboard(" ");
    expect(store).toHaveProperty("checked", false);
    expect(onChange).toHaveBeenCalledTimes(1);

    await user.click(delivery);
    expect(store.hasAttribute("aria-disabled")).toBe(false);
    await user.click(store);
    expect(store).toHaveProperty("checked", true);
    expect(pickup).toHaveProperty("checked", true);
  });

  it("keeps read-only selections focusable and in FormData while blocking changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <form data-testid="readonly-form">
        <Selector
          aria-label="服务范围"
          defaultValue={["delivery"]}
          multiple
          name="service"
          onChange={onChange}
          options={options}
          readOnly
        />
      </form>
    );

    const group = screen.getByRole("group", { name: "服务范围" });
    const delivery = screen.getByRole("checkbox", { name: "配送" });
    const pickup = screen.getByRole("checkbox", { name: "自提" });
    expect(group.hasAttribute("aria-readonly")).toBe(false);
    expect(group.getAttribute("data-state")).toBe("readonly");
    expect(delivery.getAttribute("aria-readonly")).toBe("true");
    expect(delivery).toHaveProperty("disabled", false);
    await user.click(pickup);
    expect(pickup).toHaveProperty("checked", false);
    pickup.focus();
    await user.keyboard(" ");
    expect(pickup).toHaveProperty("checked", false);
    expect(onChange).not.toHaveBeenCalled();
    expect(
      new FormData(screen.getByTestId<HTMLFormElement>("readonly-form")).getAll("service")
    ).toEqual(["delivery"]);
  });

  it("blocks single selection and clear paths while exposing radiogroup read-only semantics", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <form data-testid="readonly-single-form">
        <Selector
          aria-label="履约方式"
          defaultValue={["delivery"]}
          name="shipping"
          onChange={onChange}
          options={options}
          readOnly
        />
      </form>
    );

    const group = screen.getByRole("radiogroup", { name: "履约方式" });
    const delivery = screen.getByRole("radio", { name: "配送" });
    const pickup = screen.getByRole("radio", { name: "自提" });
    expect(group.getAttribute("aria-readonly")).toBe("true");
    expect(fireEvent.keyDown(delivery, { key: "ArrowRight" })).toBe(false);
    await user.click(delivery);
    await user.click(pickup);
    expect(delivery).toHaveProperty("checked", true);
    expect(pickup).toHaveProperty("checked", false);
    expect(onChange).not.toHaveBeenCalled();
    expect(
      new FormData(screen.getByTestId<HTMLFormElement>("readonly-single-form")).get("shipping")
    ).toBe("delivery");
  });

  it("renders more than 20 options without truncating identity, focus, or form data", async () => {
    const user = userEvent.setup();
    const manyOptions = Array.from({ length: 24 }, (_, index) => ({
      label: `选项 ${index + 1}`,
      value: `option-${index + 1}`
    }));
    render(
      <form data-testid="many-form">
        <Selector aria-label="全部服务" multiple name="services" options={manyOptions} />
      </form>
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(24);
    checkboxes[23]!.focus();
    await user.keyboard(" ");
    expect(document.activeElement).toBe(checkboxes[23]);
    expect(
      new FormData(screen.getByTestId<HTMLFormElement>("many-form")).getAll("services")
    ).toEqual(["option-24"]);
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

  it("keeps controlled values and native FormData aligned when they exceed maxCount", () => {
    const onChange = vi.fn();
    render(
      <form data-testid="controlled-limit-form">
        <Selector
          aria-label="服务范围"
          maxCount={1}
          multiple
          name="services"
          onChange={onChange}
          options={[
            { value: "delivery", label: "配送" },
            { value: "pickup", label: "自提" },
            { value: "store", label: "门店" }
          ]}
          value={["delivery", "pickup", "store"]}
        />
      </form>
    );

    expect(
      new FormData(screen.getByTestId<HTMLFormElement>("controlled-limit-form")).getAll("services")
    ).toEqual(["delivery", "pickup", "store"]);
    fireEvent.click(screen.getByRole("checkbox", { name: "配送" }));
    expect(onChange.mock.calls[0]![0]).toEqual(["pickup", "store"]);
    expect(
      screen.getAllByRole<HTMLInputElement>("checkbox").every((option) => option.checked)
    ).toBe(true);
  });

  it("normalizes uncontrolled limits while keeping controlled values authoritative", () => {
    const onChange = vi.fn();
    const dynamicOptions = [
      { value: "delivery", label: "配送" },
      { value: "pickup", label: "自提" },
      { value: "store", label: "门店" }
    ] as const;
    const { rerender } = render(
      <Selector
        aria-label="服务范围"
        defaultValue={["store", "pickup"]}
        multiple
        onChange={onChange}
        options={dynamicOptions}
      />
    );

    rerender(
      <Selector
        aria-label="服务范围"
        defaultValue={["delivery"]}
        maxCount={1.9}
        multiple
        onChange={onChange}
        options={dynamicOptions.slice(0, 2)}
      />
    );
    expect(screen.getByRole("checkbox", { name: "自提" })).toHaveProperty("checked", true);
    expect(onChange).not.toHaveBeenCalled();

    rerender(
      <Selector
        aria-label="服务范围"
        maxCount={1}
        multiple
        onChange={onChange}
        options={dynamicOptions}
        value={["store", "delivery", "pickup"]}
      />
    );
    expect(screen.getByRole("checkbox", { name: "配送" })).toHaveProperty("checked", true);
    expect(screen.getByRole("checkbox", { name: "自提" })).toHaveProperty("checked", true);
    expect(screen.getByRole("checkbox", { name: "门店" })).toHaveProperty("checked", true);
    expect(onChange).not.toHaveBeenCalled();

    rerender(
      <Selector
        aria-label="履约方式"
        maxCount={0}
        onChange={onChange}
        options={dynamicOptions}
        value={["pickup"]}
      />
    );
    expect(screen.getByRole("radio", { name: "自提" })).toHaveProperty("checked", true);
    expect(onChange).not.toHaveBeenCalled();
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

  it("observes native reset in the component ownerDocument", () => {
    const frame = document.createElement("iframe");
    document.body.append(frame);
    const ownerDocument = frame.contentDocument;
    if (!ownerDocument) throw new Error("Expected an iframe document");
    const container = ownerDocument.createElement("div");
    ownerDocument.body.append(container);
    const rendered = render(
      <form aria-label="frame selector form">
        <Selector
          aria-label="frame selector"
          defaultValue={["delivery"]}
          name="shipping"
          options={options}
        />
      </form>,
      { container, baseElement: ownerDocument.body }
    );
    const queries = within(ownerDocument.body);
    const form = queries.getByRole<HTMLFormElement>("form", { name: "frame selector form" });
    fireEvent.click(queries.getByRole("radio", { name: "自提" }));
    expect(new FormData(form).get("shipping")).toBe("pickup");

    act(() => form.reset());
    expect(queries.getByRole("radio", { name: "配送" })).toHaveProperty("checked", true);
    expect(new FormData(form).get("shipping")).toBe("delivery");
    rendered.unmount();
    frame.remove();
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
