// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { SegmentedControl } from "./SegmentedControl";

const options = [
  { label: "列表", value: "list" },
  { label: "卡片", value: "card" },
  { disabled: true, label: "地图", value: "map" }
] as const;

describe("SegmentedControl", () => {
  it("selects the first enabled option and publishes native radio changes", () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={options} onChange={onChange} />);

    expect(screen.getByRole("radio", { name: "列表" })).toHaveProperty("checked", true);
    fireEvent.click(screen.getByRole("radio", { name: "卡片" }));
    expect(onChange).toHaveBeenCalledWith("card", expect.anything());
    expect(screen.getByRole("radio", { name: "卡片" })).toHaveProperty("checked", true);
    expect(screen.getByRole("radio", { name: "地图" }).hasAttribute("disabled")).toBe(true);
  });

  it("supports a controlled null value", () => {
    render(<SegmentedControl options={options} value={null} />);
    expect(
      screen.getAllByRole("radio").every((radio) => !(radio as HTMLInputElement).checked)
    ).toBe(true);
  });

  it("inherits Field labels and error relationships", () => {
    render(
      <Field label="展示方式" error="请选择展示方式" required>
        <SegmentedControl options={options} value={null} />
      </Field>
    );

    const group = screen.getByRole("radiogroup", { name: "展示方式" });
    expect(group.getAttribute("aria-invalid")).toBe("true");
    expect(group.getAttribute("aria-describedby")).toBeTruthy();
  });
});
