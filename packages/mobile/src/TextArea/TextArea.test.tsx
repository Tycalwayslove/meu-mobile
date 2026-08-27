// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { TextArea } from "./TextArea";

describe("TextArea", () => {
  it("inherits label and error semantics from Field", () => {
    render(
      <Field label="商品介绍" error="介绍不能为空">
        <TextArea />
      </Field>
    );

    const textArea = screen.getByRole("textbox", { name: "商品介绍" });
    expect(textArea.getAttribute("aria-invalid")).toBe("true");
    expect(textArea.getAttribute("aria-describedby")).toContain("error");
  });

  it("tracks an uncontrolled value and exposes its character count", () => {
    const onChange = vi.fn();
    render(<TextArea aria-label="备注" maxLength={20} showCount onChange={onChange} />);

    fireEvent.change(screen.getByRole("textbox", { name: "备注" }), {
      target: { value: "喵呜组件" }
    });

    expect(screen.getByText("4 / 20")).toBeTruthy();
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("resizes within configured row bounds", async () => {
    render(<TextArea aria-label="自动高度" autoSize={{ minRows: 2, maxRows: 4 }} />);
    const textArea = screen.getByRole("textbox", { name: "自动高度" });
    Object.defineProperty(textArea, "scrollHeight", { configurable: true, value: 120 });

    fireEvent.change(textArea, { target: { value: "第一行\n第二行\n第三行" } });

    await waitFor(() => expect(textArea.style.height).not.toBe(""));
    expect(Number.parseFloat(textArea.style.height)).toBeLessThanOrEqual(130);
    expect(textArea.style.overflowY).toBe("auto");
    expect(textArea.getAttribute("data-auto-size")).toBe("true");
  });
});
