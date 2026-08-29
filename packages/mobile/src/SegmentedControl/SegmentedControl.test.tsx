// @vitest-environment jsdom
import { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
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
    render(<SegmentedControl aria-label="展示方式" options={options} onChange={onChange} />);

    expect(screen.getByRole("radio", { name: "列表" })).toHaveProperty("checked", true);
    fireEvent.click(screen.getByRole("radio", { name: "卡片" }));
    expect(onChange).toHaveBeenCalledWith("card", expect.anything());
    expect(screen.getByRole("radio", { name: "卡片" })).toHaveProperty("checked", true);
    expect(screen.getByRole("radio", { name: "地图" })).toHaveProperty("disabled", true);
  });

  it("supports a controlled null value without drifting internally", () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl aria-label="展示方式" options={options} value={null} onChange={onChange} />
    );
    expect(
      screen.getAllByRole("radio").every((radio) => !(radio as HTMLInputElement).checked)
    ).toBe(true);

    fireEvent.click(screen.getByRole("radio", { name: "卡片" }));
    expect(onChange).toHaveBeenCalledWith("card", expect.anything());
    expect(
      screen.getAllByRole("radio").every((radio) => !(radio as HTMLInputElement).checked)
    ).toBe(true);
  });

  it("uses typed option values as identity and keeps the first duplicate", () => {
    render(
      <SegmentedControl<string | number>
        aria-label="密度"
        options={[
          { label: "数字一", value: 1 },
          { label: "字符串一", value: "1" },
          { label: "重复数字一", value: 1 }
        ]}
        defaultValue="1"
      />
    );

    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.queryByText("重复数字一")).toBeNull();
    expect(screen.getByRole("radio", { name: "字符串一" })).toHaveProperty("checked", true);
  });

  it("inherits and merges Field relationships, required, disabled, and error state", () => {
    render(
      <>
        <span id="business-hint">业务说明</span>
        <Field label="展示方式" description="切换内容布局" error="请选择展示方式" required>
          <SegmentedControl
            aria-describedby="business-hint"
            aria-invalid="grammar"
            disabled
            options={options}
            value={null}
          />
        </Field>
      </>
    );

    const group = screen.getByRole("radiogroup", { name: "展示方式" });
    expect(group.getAttribute("aria-disabled")).toBe("true");
    expect(group.getAttribute("aria-invalid")).toBe("true");
    expect(group.getAttribute("aria-required")).toBe("true");
    expect(group.getAttribute("aria-describedby")).toContain("business-hint");
    expect(group.getAttribute("aria-describedby")).toContain("description");
    expect(group.getAttribute("aria-describedby")).toContain("error");
    expect(screen.getByRole("radio", { name: "列表" })).toHaveProperty("disabled", true);
  });

  it.each([
    [false, "false", "default"],
    ["false", "false", "default"],
    ["grammar", "grammar", "error"],
    ["spelling", "spelling", "error"]
  ] as const)(
    "preserves aria-invalid=%s only on the radiogroup root",
    (ariaInvalid, expectedAttribute, expectedState) => {
      render(
        <SegmentedControl aria-invalid={ariaInvalid} aria-label="语义分段器" options={options} />
      );
      const group = screen.getByRole("radiogroup", { name: "语义分段器" });
      expect(group.getAttribute("aria-invalid")).toBe(expectedAttribute);
      expect(group.getAttribute("data-state")).toBe(expectedState);
      expect(group.querySelectorAll("input[aria-invalid]")).toHaveLength(0);
    }
  );

  it("does not let a disabled controlled selection satisfy required or enter FormData", () => {
    const { rerender } = render(
      <form data-testid="required-form">
        <SegmentedControl
          aria-label="展示方式"
          name="view"
          options={options}
          value="list"
          required
        />
      </form>
    );
    const form = screen.getByTestId<HTMLFormElement>("required-form");
    expect(form.checkValidity()).toBe(true);

    rerender(
      <form data-testid="required-form">
        <SegmentedControl
          aria-label="展示方式"
          name="view"
          options={[
            { disabled: true, label: "列表", value: "list" },
            { label: "卡片", value: "card" }
          ]}
          value="list"
          required
        />
      </form>
    );
    expect(form.checkValidity()).toBe(false);
    expect(new FormData(form).getAll("view")).toEqual([]);
    expect(screen.getByRole("radio", { name: "列表" })).toHaveProperty("checked", false);
  });

  it("submits its native value and supports an externally owned form", () => {
    render(
      <>
        <form id="preferences" data-testid="form" />
        <SegmentedControl
          aria-label="展示方式"
          form="preferences"
          name="view"
          options={options}
          defaultValue="card"
        />
      </>
    );

    const form = screen.getByTestId<HTMLFormElement>("form");
    expect(screen.getByRole<HTMLInputElement>("radio", { name: "卡片" }).form).toBe(form);
    expect(new FormData(form).get("view")).toBe("card");
  });

  it("restores DOM, FormData and state immediately on native form reset", () => {
    vi.useFakeTimers();
    render(
      <form data-testid="form">
        <SegmentedControl aria-label="展示方式" name="view" options={options} defaultValue="list" />
      </form>
    );

    fireEvent.click(screen.getByRole("radio", { name: "卡片" }));
    expect(screen.getByRole("radio", { name: "卡片" })).toHaveProperty("checked", true);
    const form = screen.getByTestId<HTMLFormElement>("form");
    act(() => form.reset());
    expect(screen.getByRole("radio", { name: "列表" })).toHaveProperty("checked", true);
    expect(new FormData(form).get("view")).toBe("list");
    void act(() => vi.runAllTimers());
    expect(screen.getByRole("radio", { name: "列表" })).toHaveProperty("checked", true);
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
          <SegmentedControl
            aria-label="展示方式"
            name="view"
            options={[
              { label: "列表", value: "list" },
              { label: "卡片", value: "card" }
            ]}
            defaultValue="list"
          />
        </form>
      );
    }

    const { rerender } = render(<ResetHarness />);
    fireEvent.click(screen.getByRole("radio", { name: "卡片" }));
    const form = screen.getByTestId<HTMLFormElement>("rerender-form");
    act(() => form.reset());
    expect(new FormData(form).get("view")).toBe("list");
    void act(() => vi.runAllTimers());
    expect(screen.getByRole("radio", { name: "列表" })).toHaveProperty("checked", true);

    rerender(<ResetHarness cancel />);
    fireEvent.click(screen.getByRole("radio", { name: "卡片" }));
    act(() => form.reset());
    expect(new FormData(form).get("view")).toBe("card");
    void act(() => vi.runAllTimers());
    expect(screen.getByRole("radio", { name: "卡片" })).toHaveProperty("checked", true);
    vi.useRealTimers();
  });

  it("observes reset from an external form inserted after mount", () => {
    vi.useFakeTimers();
    render(
      <SegmentedControl
        aria-label="展示方式"
        form="late-form"
        name="view"
        options={options}
        defaultValue="list"
      />
    );
    const form = document.createElement("form");
    form.id = "late-form";
    document.body.append(form);
    fireEvent.click(screen.getByRole("radio", { name: "卡片" }));
    expect(new FormData(form).get("view")).toBe("card");
    act(() => form.reset());
    expect(new FormData(form).get("view")).toBe("list");
    void act(() => vi.runAllTimers());
    expect(screen.getByRole("radio", { name: "列表" })).toHaveProperty("checked", true);
    form.remove();
    vi.useRealTimers();
  });

  it("falls back to the first enabled option when an uncontrolled identity disappears", () => {
    const { rerender } = render(
      <SegmentedControl aria-label="展示方式" options={options} defaultValue="card" />
    );
    expect(screen.getByRole("radio", { name: "卡片" })).toHaveProperty("checked", true);

    rerender(
      <SegmentedControl
        aria-label="展示方式"
        options={[
          { label: "列表", value: "list" },
          { label: "地图", value: "map" }
        ]}
        defaultValue="card"
      />
    );
    expect(screen.getByRole("radio", { name: "列表" })).toHaveProperty("checked", true);
  });

  it("keeps native radio controls in the keyboard path and the root available for error focus", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<SegmentedControl ref={ref} aria-label="展示方式" options={options} />);

    const group = screen.getByRole("radiogroup");
    expect(group).toHaveProperty("tabIndex", -1);
    expect(screen.getByRole("radio", { name: "列表" })).toHaveProperty("tabIndex", 0);
    expect(screen.getAllByRole<HTMLInputElement>("radio").map((radio) => radio.name)).toEqual([
      expect.any(String),
      expect.any(String),
      expect.any(String)
    ]);
    if (ref.current) ref.current.focus();
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "列表" }));
  });
});
