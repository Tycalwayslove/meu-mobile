// @vitest-environment jsdom
import { useState } from "react";
import type { ChangeEvent } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { Field } from "../Field";
import { SegmentedControl } from "./SegmentedControl";

const options = [
  { label: "列表", value: "list" },
  { label: "卡片", value: "card" },
  { disabled: true, label: "地图", value: "map" }
] as const;

describe("SegmentedControl", () => {
  it("preserves the native radio callback type for the default mode", () => {
    const onChange = vi.fn((value: string, event: ChangeEvent<HTMLInputElement>) => {
      expect(value).toBe("card");
      expect(event.target.type).toBe("radio");
    });
    render(<SegmentedControl aria-label="展示方式" options={options} onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "卡片" }));
    expect(onChange).toHaveBeenCalledWith("card", expect.anything());
  });

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

  it("observes native reset in the component ownerDocument", () => {
    const frame = document.createElement("iframe");
    document.body.append(frame);
    const ownerDocument = frame.contentDocument;
    if (!ownerDocument) throw new Error("Expected an iframe document");
    const container = ownerDocument.createElement("div");
    ownerDocument.body.append(container);
    const rendered = render(
      <form aria-label="frame segmented form">
        <SegmentedControl
          aria-label="frame segmented"
          defaultValue="list"
          name="view"
          options={options}
        />
      </form>,
      { container, baseElement: ownerDocument.body }
    );
    const queries = within(ownerDocument.body);
    const form = queries.getByRole<HTMLFormElement>("form", { name: "frame segmented form" });
    fireEvent.click(queries.getByRole("radio", { name: "卡片" }));
    expect(new FormData(form).get("view")).toBe("card");

    act(() => form.reset());
    expect(queries.getByRole("radio", { name: "列表" })).toHaveProperty("checked", true);
    expect(new FormData(form).get("view")).toBe("list");
    rendered.unmount();
    frame.remove();
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

  it("renders a real tablist without leaking radio or form semantics", () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        mode="tabs"
        aria-label="订单视图"
        options={[
          { label: "待付款", panelId: "pending-panel", tabId: "pending-tab", value: "pending" },
          { label: "已完成", panelId: "done-panel", tabId: "done-tab", value: "done" }
        ]}
        onChange={onChange}
      />
    );

    const tablist = screen.getByRole("tablist", { name: "订单视图" });
    expect(tablist.getAttribute("aria-orientation")).toBe("horizontal");
    expect(tablist.hasAttribute("aria-required")).toBe(false);
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    const pending = screen.getByRole("tab", { name: "待付款" });
    const done = screen.getByRole("tab", { name: "已完成" });
    expect(pending.id).toBe("pending-tab");
    expect(pending.getAttribute("aria-controls")).toBe("pending-panel");
    expect(pending.getAttribute("aria-selected")).toBe("true");
    fireEvent.click(done);
    expect(onChange).toHaveBeenCalledWith("done", expect.anything());
    expect(done.getAttribute("aria-selected")).toBe("true");
  });

  it("uses APG horizontal tab keys, skips disabled tabs, and reverses arrows in RTL", () => {
    const onChange = vi.fn();
    const tabOptions = [
      { label: "日", panelId: "day-panel", tabId: "day-tab", value: "day" },
      {
        disabled: true,
        label: "周",
        panelId: "week-panel",
        tabId: "week-tab",
        value: "week"
      },
      { label: "月", panelId: "month-panel", tabId: "month-tab", value: "month" }
    ] as const;
    const { rerender } = render(
      <SegmentedControl mode="tabs" aria-label="周期" options={tabOptions} onChange={onChange} />
    );
    const day = screen.getByRole("tab", { name: "日" });
    const month = screen.getByRole("tab", { name: "月" });
    fireEvent.focus(day);
    fireEvent.keyDown(day, { key: "ArrowRight" });
    expect(document.activeElement).toBe(month);
    expect(month.getAttribute("aria-selected")).toBe("true");
    expect(onChange).toHaveBeenLastCalledWith("month", expect.anything());
    fireEvent.keyDown(month, { key: "Home" });
    expect(document.activeElement).toBe(day);

    rerender(
      <ConfigProvider dir="rtl">
        <SegmentedControl mode="tabs" aria-label="周期" options={tabOptions} />
      </ConfigProvider>
    );
    const rtlDay = screen.getByRole("tab", { name: "日" });
    fireEvent.focus(rtlDay);
    fireEvent.keyDown(rtlDay, { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "月" }));
  });

  it("recovers selection and focus when the active uncontrolled option is disabled dynamically", () => {
    const { rerender } = render(
      <SegmentedControl
        mode="tabs"
        aria-label="展示方式"
        defaultValue="card"
        options={[
          { label: "列表", panelId: "list-panel", tabId: "list-tab", value: "list" },
          { label: "卡片", panelId: "card-panel", tabId: "card-tab", value: "card" }
        ]}
      />
    );
    fireEvent.focus(screen.getByRole("tab", { name: "卡片" }));

    rerender(
      <SegmentedControl
        mode="tabs"
        aria-label="展示方式"
        defaultValue="card"
        options={[
          { label: "列表", panelId: "list-panel", tabId: "list-tab", value: "list" },
          {
            disabled: true,
            label: "卡片",
            panelId: "card-panel",
            tabId: "card-tab",
            value: "card"
          }
        ]}
      />
    );

    const list = screen.getByRole("tab", { name: "列表" });
    expect(list.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(list);
  });

  it("recovers a focused native radio after removal without stealing external focus", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <>
        <button type="button">组件外操作</button>
        <SegmentedControl
          aria-label="展示方式"
          defaultValue="card"
          onChange={onChange}
          options={[
            { label: "列表", value: "list" },
            { label: "卡片", value: "card" }
          ]}
        />
      </>
    );
    fireEvent.focus(screen.getByRole("radio", { name: "卡片" }));
    rerender(
      <>
        <button type="button">组件外操作</button>
        <SegmentedControl
          aria-label="展示方式"
          defaultValue="card"
          onChange={onChange}
          options={[{ label: "列表", value: "list" }]}
        />
      </>
    );
    const list = screen.getByRole("radio", { name: "列表" });
    expect(list).toHaveProperty("checked", true);
    expect(document.activeElement).toBe(list);
    expect(onChange).not.toHaveBeenCalled();

    const outside = screen.getByRole("button", { name: "组件外操作" });
    act(() => outside.focus());
    await act(() => Promise.resolve());
    rerender(
      <>
        <button type="button">组件外操作</button>
        <SegmentedControl
          aria-label="展示方式"
          defaultValue="card"
          onChange={onChange}
          options={[
            { disabled: true, label: "列表", value: "list" },
            { label: "地图", value: "map" }
          ]}
        />
      </>
    );
    expect(document.activeElement).toBe(outside);
  });

  it("preserves focus when the same identity switches between radio and tab modes", () => {
    const { rerender } = render(
      <SegmentedControl aria-label="展示方式" options={options} value="list" />
    );
    const radio = screen.getByRole("radio", { name: "列表" });
    radio.focus();

    rerender(
      <SegmentedControl
        mode="tabs"
        aria-label="展示方式"
        options={[
          { label: "列表", panelId: "list-panel", tabId: "list-tab", value: "list" },
          { label: "卡片", panelId: "card-panel", tabId: "card-tab", value: "card" }
        ]}
        value="list"
      />
    );
    const tab = screen.getByRole("tab", { name: "列表" });
    expect(document.activeElement).toBe(tab);

    rerender(<SegmentedControl aria-label="展示方式" options={options} value="list" />);
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "列表" }));
  });

  it("tracks the selected item with a measured indicator and hides it for controlled null", () => {
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function getRect(this: HTMLElement) {
        if (this.getAttribute("data-meu-component") === "segmented-control") {
          return {
            bottom: 50,
            height: 50,
            left: 10,
            right: 310,
            top: 0,
            width: 300,
            x: 10,
            y: 0,
            toJSON() {}
          };
        }
        if (this.getAttribute("data-selected") === "true") {
          return {
            bottom: 48,
            height: 44,
            left: 110,
            right: 210,
            top: 2,
            width: 100,
            x: 110,
            y: 2,
            toJSON() {}
          };
        }
        return {
          bottom: 48,
          height: 44,
          left: 10,
          right: 110,
          top: 2,
          width: 100,
          x: 10,
          y: 2,
          toJSON() {}
        };
      });
    const { container, rerender } = render(
      <SegmentedControl aria-label="展示方式" options={options} value="card" />
    );
    const indicator = container.querySelector<HTMLElement>("[aria-hidden='true']");
    expect(indicator).not.toBeNull();
    expect(indicator && indicator.style.getPropertyValue("--meu-segmented-indicator-x")).toBe(
      "100px"
    );
    expect(indicator && indicator.style.getPropertyValue("--meu-segmented-indicator-width")).toBe(
      "100px"
    );
    expect(indicator && indicator.style.getPropertyValue("--meu-segmented-indicator-opacity")).toBe(
      "1"
    );

    rerender(<SegmentedControl aria-label="展示方式" options={options} value={null} />);
    expect(indicator && indicator.style.getPropertyValue("--meu-segmented-indicator-opacity")).toBe(
      "0"
    );
    rectSpy.mockRestore();
  });

  it("honors provider motion reduction, native root attributes, and a localized fallback name", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <ConfigProvider locale="en-US" motion="reduced">
        <SegmentedControl
          ref={ref}
          data-business="orders"
          options={options}
          style={{ maxWidth: 320 }}
        />
      </ConfigProvider>
    );
    const group = screen.getByRole("radiogroup", { name: "Segmented control" });
    expect(group.getAttribute("data-motion")).toBe("reduced");
    expect(group.getAttribute("data-business")).toBe("orders");
    expect(group.getAttribute("style")).toContain("max-width: 320px");
    expect(ref.current).toBe(group);
  });
});
