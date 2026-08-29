// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { Radio } from "./Radio";
import { RadioGroup } from "./RadioGroup";

describe("Radio", () => {
  it("supports standalone uncontrolled state", () => {
    const onChange = vi.fn();
    render(<Radio onChange={onChange}>默认地址</Radio>);
    const radio = screen.getByRole("radio", { name: "默认地址" });

    fireEvent.click(radio);
    expect(radio).toHaveProperty("checked", true);
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it("keeps standalone radios with the same native name visually synchronized", async () => {
    const { rerender } = render(
      <>
        <Radio defaultChecked name="address" value="home">
          家庭
        </Radio>
        <Radio name="address" value="office">
          公司
        </Radio>
      </>
    );

    const home = screen.getByRole("radio", { name: "家庭" });
    const office = screen.getByRole("radio", { name: "公司" });
    fireEvent.click(office);

    await waitFor(() => {
      expect(home).toHaveProperty("checked", false);
      expect(office).toHaveProperty("checked", true);
      const homeLabel = home.closest("label");
      const officeLabel = office.closest("label");
      expect(homeLabel && homeLabel.getAttribute("data-state")).toBe("unchecked");
      expect(officeLabel && officeLabel.getAttribute("data-state")).toBe("checked");
    });

    rerender(
      <>
        <Radio defaultChecked name="address" value="home">
          家庭
        </Radio>
        <Radio name="address" value="office">
          公司
        </Radio>
      </>
    );
    expect(home).toHaveProperty("checked", false);
    expect(office).toHaveProperty("checked", true);
  });

  it("keeps a controlled standalone radio authoritative within a native name group", async () => {
    render(
      <>
        <Radio checked name="primary" value="home">
          家庭
        </Radio>
        <Radio name="primary" value="office">
          公司
        </Radio>
      </>
    );

    fireEvent.click(screen.getByRole("radio", { name: "公司" }));
    await waitFor(() => {
      expect(screen.getByRole("radio", { name: "家庭" })).toHaveProperty("checked", true);
      expect(screen.getByRole("radio", { name: "公司" })).toHaveProperty("checked", false);
    });
  });

  it("supports a controlled empty group without selecting optimistically", () => {
    const onChange = vi.fn();
    render(
      <RadioGroup value={null} onChange={onChange}>
        <Radio value="standard">标准配送</Radio>
      </RadioGroup>
    );
    const radio = screen.getByRole("radio", { name: "标准配送" });
    fireEvent.click(radio);

    expect(onChange).toHaveBeenCalledWith("standard", expect.anything());
    expect(radio).toHaveProperty("checked", false);
  });

  it("blocks programmatic change events while disabled", () => {
    const onChange = vi.fn();
    render(
      <Radio disabled onChange={onChange}>
        不可选择
      </Radio>
    );

    fireEvent.click(screen.getByRole("radio", { name: "不可选择" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps readonly selection focusable and included in FormData", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <form>
        <Radio defaultChecked name="primary" readOnly value="yes" onChange={onChange}>
          主要地址
        </Radio>
      </form>
    );
    const radio = screen.getByRole("radio", { name: "主要地址" });
    fireEvent.click(radio);

    await waitFor(() => expect(radio).toHaveProperty("checked", true));
    expect(radio.getAttribute("aria-disabled")).toBe("true");
    expect(onChange).not.toHaveBeenCalled();
    expect(new FormData(container.querySelector("form")!).get("primary")).toBe("yes");
  });

  it("exposes standalone invalid state to assistive technology", () => {
    render(<Radio aria-invalid>无效选项</Radio>);
    expect(screen.getByRole("radio", { name: "无效选项" }).getAttribute("aria-invalid")).toBe(
      "true"
    );
  });

  it.each([
    [false, "false"],
    ["false", "false"],
    ["grammar", "grammar"],
    ["spelling", "spelling"]
  ] as const)("preserves aria-invalid=%s on a standalone radio", (ariaInvalid, expected) => {
    render(<Radio aria-invalid={ariaInvalid}>语义单选项</Radio>);
    expect(screen.getByRole("radio", { name: "语义单选项" }).getAttribute("aria-invalid")).toBe(
      expected
    );
  });

  it("lets Field validation override a caller grammar token", () => {
    render(
      <Field label="默认地址" error="请选择地址">
        <Radio aria-invalid="grammar">家庭地址</Radio>
      </Field>
    );

    expect(screen.getByRole("radio", { name: "默认地址" }).getAttribute("aria-invalid")).toBe(
      "true"
    );
  });

  it("rebinds reset behavior when the external form owner changes", async () => {
    const { rerender } = render(
      <>
        <form id="radio-a" />
        <form id="radio-b" />
        <Radio form="radio-a" name="choice" value="yes">
          外部单选
        </Radio>
      </>
    );
    const radio = screen.getByRole("radio", { name: "外部单选" });
    fireEvent.click(radio);
    rerender(
      <>
        <form id="radio-a" />
        <form id="radio-b" />
        <Radio form="radio-b" name="choice" value="yes">
          外部单选
        </Radio>
      </>
    );
    const form = document.getElementById("radio-b") as HTMLFormElement;
    act(() => form.reset());
    expect(new FormData(form).get("choice")).toBeNull();
    await waitFor(() => expect(radio).toHaveProperty("checked", false));
  });
});

describe("RadioGroup", () => {
  it("selects one value, shares a native name and inherits Field semantics", () => {
    const onChange = vi.fn();
    render(
      <Field label="配送方式" error="请选择配送方式">
        <RadioGroup<string> defaultValue="standard" onChange={onChange} required>
          <Radio value="standard">标准配送</Radio>
          <Radio value="express">急速配送</Radio>
        </RadioGroup>
      </Field>
    );

    const group = screen.getByRole("radiogroup", { name: "配送方式" });
    const standard = screen.getByRole("radio", { name: "标准配送" });
    const express = screen.getByRole("radio", { name: "急速配送" });
    expect(group.getAttribute("aria-invalid")).toBe("true");
    expect(standard.getAttribute("aria-invalid")).toBeNull();
    expect(standard.getAttribute("name")).toBe(express.getAttribute("name"));
    expect(standard).toHaveProperty("checked", true);

    fireEvent.click(express);
    expect(onChange).toHaveBeenCalledWith("express", expect.anything());
    expect(express).toHaveProperty("checked", true);
    expect(standard).toHaveProperty("checked", false);
  });

  it.each([
    [false, "false"],
    ["false", "false"],
    ["grammar", "grammar"],
    ["spelling", "spelling"]
  ] as const)(
    "keeps group aria-invalid=%s on the semantic root without manufacturing child tokens",
    (ariaInvalid, expected) => {
      render(
        <RadioGroup aria-invalid={ariaInvalid} aria-label="配送方式">
          <Radio value="standard">标准配送</Radio>
        </RadioGroup>
      );

      expect(
        screen.getByRole("radiogroup", { name: "配送方式" }).getAttribute("aria-invalid")
      ).toBe(expected);
      expect(
        screen.getByRole("radio", { name: "标准配送" }).getAttribute("aria-invalid")
      ).toBeNull();
    }
  );

  it("lets group validation override a caller spelling token", () => {
    render(
      <Field label="配送方式" error="请选择配送方式">
        <RadioGroup aria-invalid="spelling">
          <Radio value="standard">标准配送</Radio>
        </RadioGroup>
      </Field>
    );

    expect(screen.getByRole("radiogroup", { name: "配送方式" }).getAttribute("aria-invalid")).toBe(
      "true"
    );
  });

  it("inherits Field required semantics and merges caller descriptions", () => {
    render(
      <Field label="配送方式" description="只能选一项" required>
        <RadioGroup aria-describedby="external-help">
          <Radio value="standard">标准配送</Radio>
        </RadioGroup>
      </Field>
    );

    const group = screen.getByRole("radiogroup", { name: "配送方式" });
    const radio = screen.getByRole("radio", { name: "标准配送" });
    expect(group.getAttribute("aria-required")).toBe("true");
    expect(group.getAttribute("aria-describedby")).toContain("external-help");
    expect(group.getAttribute("aria-describedby")).toContain("description");
    expect(radio).toHaveProperty("required", true);
  });

  it("restores an uncontrolled group on form reset", async () => {
    const { container } = render(
      <form>
        <RadioGroup defaultValue="standard" name="shipping">
          <Radio value="standard">标准配送</Radio>
          <Radio value="express">急速配送</Radio>
        </RadioGroup>
      </form>
    );
    fireEvent.click(screen.getByRole("radio", { name: "急速配送" }));
    expect(new FormData(container.querySelector("form")!).get("shipping")).toBe("express");

    const form = container.querySelector("form")!;
    act(() => form.reset());
    expect(new FormData(form).get("shipping")).toBe("standard");
    await waitFor(() =>
      expect(screen.getByRole("radio", { name: "标准配送" })).toHaveProperty("checked", true)
    );
  });

  it("does not reset a group when the native reset event is canceled", async () => {
    const { container } = render(
      <form onReset={(event) => event.preventDefault()}>
        <RadioGroup defaultValue="standard" name="shipping">
          <Radio value="standard">标准配送</Radio>
          <Radio value="express">急速配送</Radio>
        </RadioGroup>
      </form>
    );
    fireEvent.click(screen.getByRole("radio", { name: "急速配送" }));

    act(() => container.querySelector("form")!.reset());
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(screen.getByRole("radio", { name: "急速配送" })).toHaveProperty("checked", true);
  });

  it("blocks readonly group changes and preserves native submission", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <form>
        <RadioGroup defaultValue="standard" name="shipping" onChange={onChange} readOnly>
          <Radio value="standard">标准配送</Radio>
          <Radio value="express">急速配送</Radio>
        </RadioGroup>
      </form>
    );
    fireEvent.click(screen.getByRole("radio", { name: "急速配送" }));

    await waitFor(() =>
      expect(screen.getByRole("radio", { name: "标准配送" })).toHaveProperty("checked", true)
    );

    expect(onChange).not.toHaveBeenCalled();
    expect(new FormData(container.querySelector("form")!).get("shipping")).toBe("standard");
  });
});
