// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { TextInput } from "./TextInput";

describe("TextInput", () => {
  it("inherits label and error semantics from Field", () => {
    render(
      <Field label="手机号" error="手机号格式不正确">
        <TextInput />
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
  });
});
