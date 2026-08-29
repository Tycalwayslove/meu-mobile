// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { Field } from "../Field";
import { TextInput } from "./TextInput";

describe("TextInput", () => {
  it("inherits label and error semantics from Field", () => {
    render(
      <Field label="手机号" error="手机号格式不正确">
        <TextInput aria-invalid="grammar" />
      </Field>
    );
    const input = screen.getByRole("textbox", { name: "手机号" });
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toContain("error");
  });

  it("exposes a clear action", () => {
    const onClear = vi.fn();
    render(<TextInput clearable defaultValue="喵呜" onClear={onClear} />);
    fireEvent.click(screen.getByRole("button", { name: "清除输入" }));
    expect(onClear).toHaveBeenCalledOnce();
    expect(screen.getByRole("textbox")).toHaveProperty("value", "");
    expect(document.activeElement).toBe(screen.getByRole("textbox"));
  });

  it("clears controlled values through the native change contract", () => {
    const callOrder: string[] = [];
    const onChange = vi.fn();
    const onClear = vi.fn();

    function ControlledInput() {
      const [value, setValue] = useState("喵呜");
      return (
        <TextInput
          aria-label="店铺名称"
          clearable
          value={value}
          onChange={(event) => {
            callOrder.push("change");
            onChange(event.currentTarget.value);
            setValue(event.currentTarget.value);
          }}
          onClear={() => {
            callOrder.push("clear");
            onClear();
          }}
        />
      );
    }

    render(<ControlledInput />);
    fireEvent.click(screen.getByRole("button", { name: "清除输入" }));

    expect(onChange).toHaveBeenCalledWith("");
    expect(onClear).toHaveBeenCalledOnce();
    expect(callOrder).toEqual(["change", "clear"]);
    expect(screen.getByRole("textbox", { name: "店铺名称" })).toHaveProperty("value", "");
  });

  it("localizes the clear action and removes it from read-only fields", () => {
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <TextInput aria-label="Name" clearable defaultValue="Meu" />
      </ConfigProvider>
    );
    expect(screen.getByRole("button", { name: "Clear input" })).toBeTruthy();

    rerender(
      <ConfigProvider locale="en-US">
        <TextInput aria-label="Name" clearable defaultValue="Meu" readOnly />
      </ConfigProvider>
    );
    expect(screen.queryByRole("button", { name: "Clear input" })).toBeNull();
    expect(screen.getByRole("textbox", { name: "Name" }).getAttribute("data-state")).toBe(
      "readonly"
    );
  });

  it.each([
    ["false", "false", "default"],
    [false, "false", "default"],
    ["grammar", "grammar", "error"],
    ["spelling", "spelling", "error"]
  ] as const)(
    "preserves aria-invalid=%s without collapsing its semantics",
    (ariaInvalid, expectedAttribute, expectedState) => {
      render(<TextInput aria-label="语义输入框" aria-invalid={ariaInvalid} />);
      const input = screen.getByRole("textbox", { name: "语义输入框" });

      expect(input.getAttribute("aria-invalid")).toBe(expectedAttribute);
      expect(input.getAttribute("data-state")).toBe(expectedState);
    }
  );
});
