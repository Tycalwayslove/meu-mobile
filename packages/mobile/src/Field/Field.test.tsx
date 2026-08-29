// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import type { HTMLAttributes } from "react";
import { describe, expect, it } from "vitest";

import { TextInput } from "../TextInput";
import { Field } from "./Field";
import { useFieldContext } from "./FieldContext";

function CompositeControl(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} role="group" />;
}

function ContextReadout() {
  const context = useFieldContext();
  return (
    <output>
      {context
        ? `${context.required}|${context.invalid}|${context.labelId}|${context.describedBy}`
        : "outside"}
    </output>
  );
}

describe("Field", () => {
  it("keeps an explicit native child id connected and merges caller descriptions", () => {
    render(
      <Field label="收货人" description="请与证件一致" error="请输入收货人" required>
        <input id="customer-name" aria-describedby="external-help field-description" />
      </Field>
    );

    const control = screen.getByRole("textbox", { name: "收货人" });
    const describedBy = (control.getAttribute("aria-describedby") || "").split(" ");

    expect(control.id).toBe("customer-name");
    expect(control).toHaveProperty("required", true);
    expect(control.getAttribute("aria-invalid")).toBe("true");
    expect(describedBy).toContain("external-help");
    expect(describedBy).toContain("field-description");
    expect(describedBy).toContain("customer-name-description");
    expect(describedBy).toContain("customer-name-error");
    expect(new Set(describedBy).size).toBe(describedBy.length);
    expect(document.querySelector('label[for="customer-name"]')).toBeTruthy();
  });

  it("uses labelledby instead of an invalid label-for relationship for composite controls", () => {
    render(
      <Field
        label="配送方式"
        labelAssociation="aria"
        description="选择一个可用方式"
        error="必须选择配送方式"
        required
      >
        <CompositeControl id="delivery-options" aria-describedby="shipping-policy" />
      </Field>
    );

    const control = screen.getByRole("group", { name: "配送方式" });
    expect(control.getAttribute("aria-labelledby")).toBe("delivery-options-label");
    expect(control.getAttribute("aria-required")).toBeNull();
    expect(control.getAttribute("aria-invalid")).toBe("true");
    expect(control.getAttribute("aria-describedby")).toBe(
      "shipping-policy delivery-options-required delivery-options-description delivery-options-error"
    );
    const requiredDescription = document.getElementById("delivery-options-required");
    expect(requiredDescription ? requiredDescription.textContent : null).toBe("必填");
    expect(document.querySelector('label[for="delivery-options"]')).toBeNull();
    const labelElement = document.getElementById("delivery-options-label");
    expect(labelElement && labelElement.tagName).toBe("SPAN");
  });

  it("merges Field semantics into a Field-aware control with its own id and description", () => {
    render(
      <>
        <span id="account-policy">公开显示</span>
        <Field label="店铺名称" labelAssociation="native" description="最多 20 个字符" required>
          <TextInput id="shop-name" aria-describedby="account-policy" />
        </Field>
      </>
    );

    const control = screen.getByRole("textbox", { name: "店铺名称" });
    expect(control.id).toBe("shop-name");
    expect(control).toHaveProperty("required", true);
    expect(control.getAttribute("aria-describedby")).toBe("account-policy shop-name-description");
  });

  it("associates a nested Field-aware input without cloning a layout wrapper", () => {
    render(
      <Field label="联系人" description="用于配送通知" error="请输入联系人" required>
        <div data-testid="control-layout">
          <TextInput name="contact" />
        </div>
      </Field>
    );

    const layout = screen.getByTestId("control-layout");
    const control = screen.getByRole<HTMLInputElement>("textbox", { name: "联系人" });
    const describedBy = (control.getAttribute("aria-describedby") || "").split(" ");

    expect(layout.getAttribute("id")).toBeNull();
    expect(layout.getAttribute("aria-labelledby")).toBeNull();
    expect(control.required).toBe(true);
    expect(control.getAttribute("aria-invalid")).toBe("true");
    expect(describedBy).toContain(`${control.id}-required`);
    expect(describedBy).toContain(`${control.id}-description`);
    expect(describedBy).toContain(`${control.id}-error`);
    expect(document.querySelectorAll(`[id="${control.id}"]`)).toHaveLength(1);
  });

  it("keeps the visible native label in an existing aria-labelledby chain", () => {
    render(
      <>
        <span id="name-policy">实名信息</span>
        <Field label="收货人姓名">
          <input aria-labelledby="name-policy" />
        </Field>
      </>
    );

    const control = screen.getByRole("textbox", { name: "实名信息 收货人姓名" });
    expect(control.getAttribute("aria-labelledby")).toBe(`name-policy ${control.id}-label`);
  });

  it("does not create empty labels, descriptions, alerts, or invalid state", () => {
    render(
      <Field label={<></>} description={[]} error={<>{false}</>}>
        <input aria-label="独立名称" />
      </Field>
    );

    const control = screen.getByRole("textbox", { name: "独立名称" });
    expect(control.getAttribute("aria-describedby")).toBeNull();
    expect(control.getAttribute("aria-invalid")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(document.querySelector('[data-meu-slot="label"]')).toBeNull();
    expect(document.querySelector('[data-meu-slot="description"]')).toBeNull();
  });

  it("lets an explicit accessible name take precedence over the visible ARIA label", () => {
    render(
      <Field label="订单操作">
        <CompositeControl aria-label="批量订单操作" />
      </Field>
    );

    const control = screen.getByRole("group", { name: "批量订单操作" });
    expect(control.getAttribute("aria-labelledby")).toBeNull();
  });

  it("propagates required and invalid through context without requiring visible feedback", () => {
    render(
      <Field label="备注" invalid required>
        <ContextReadout />
      </Field>
    );

    expect(screen.getByRole("status").textContent).toContain("true|true|");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("forwards root DOM props, styles and ref without reusing the root id for the control", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Field
        ref={ref}
        id="checkout-field"
        className="checkout-field"
        style={{ marginBlockStart: 12 }}
        data-testid="field-root"
        label="联系电话"
      >
        <input />
      </Field>
    );

    const root = screen.getByTestId("field-root");
    const control = screen.getByRole("textbox", { name: "联系电话" });
    expect(ref.current).toBe(root);
    expect(root.id).toBe("checkout-field");
    expect(root.className).toContain("checkout-field");
    expect(root.style.marginBlockStart).toBe("12px");
    expect(control.id).toBe("checkout-field-control");
  });

  it("allows native association for a component that forwards to one native control", () => {
    render(
      <Field label="手机号" labelAssociation="native" required>
        <TextInput id="phone" inputMode="tel" />
      </Field>
    );

    const control = screen.getByRole("textbox", { name: "手机号" });
    expect(control).toHaveProperty("required", true);
    expect(document.querySelector('label[for="phone"]')).toBeTruthy();
  });
});
