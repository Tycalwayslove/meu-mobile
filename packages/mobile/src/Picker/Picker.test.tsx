// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { ConfigProvider } from "../ConfigProvider";
import { Picker } from "./Picker";
import { PickerTrigger } from "./PickerTrigger";

const deliveryColumn = [
  { label: "普通配送", value: "standard" },
  { disabled: true, label: "次日达", value: "next-day" },
  { label: "当日达", value: "same-day" },
  { label: "到店自提", value: "pickup" },
  { label: "快递柜", value: "locker" }
] as const;

describe("Picker", () => {
  it("exposes a modal dialog and named single-select wheel semantics", async () => {
    render(
      <Picker
        open
        title="配送方式"
        columns={[deliveryColumn]}
        columnLabels={["方式"]}
        defaultValue={["same-day"]}
      />
    );

    const dialog = screen.getByRole("dialog", { name: "配送方式" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    const wheel = within(dialog).getByRole("listbox", { name: "方式" });
    expect(wheel.getAttribute("aria-orientation")).toBe("vertical");
    const selected = within(wheel).getByRole("option", { name: "当日达" });
    expect(selected.getAttribute("aria-selected")).toBe("true");
    expect(wheel.getAttribute("aria-activedescendant")).toBe(selected.id);
    expect(
      within(wheel).getByRole("option", { name: "次日达" }).getAttribute("aria-disabled")
    ).toBe("true");
    await waitFor(() =>
      expect(document.activeElement).toBe(within(dialog).getByRole("button", { name: "取消" }))
    );
  });

  it("supports arrows, boundaries and typeahead while skipping disabled options", () => {
    const onSelect = vi.fn();
    render(
      <Picker
        open
        aria-label="配送方式"
        columns={[deliveryColumn]}
        defaultValue={["standard"]}
        onSelect={onSelect}
      />
    );

    const wheel = screen.getByRole("listbox", { name: "第 1 列" });
    fireEvent.keyDown(wheel, { key: "ArrowDown" });
    expect(onSelect).toHaveBeenLastCalledWith(["same-day"], [deliveryColumn[2]], {
      columnIndex: 0,
      reason: "keyboard"
    });
    fireEvent.keyDown(wheel, { key: "End" });
    expect(onSelect).toHaveBeenLastCalledWith(["locker"], [deliveryColumn[4]], {
      columnIndex: 0,
      reason: "keyboard"
    });
    fireEvent.keyDown(wheel, { key: "到" });
    expect(onSelect).toHaveBeenLastCalledWith(["pickup"], [deliveryColumn[3]], {
      columnIndex: 0,
      reason: "keyboard"
    });
    fireEvent.keyDown(wheel, { key: "Home" });
    expect(onSelect).toHaveBeenLastCalledWith(["standard"], [deliveryColumn[0]], {
      columnIndex: 0,
      reason: "keyboard"
    });
    fireEvent.keyDown(wheel, { key: "PageDown" });
    expect(onSelect).toHaveBeenLastCalledWith(["locker"], [deliveryColumn[4]], {
      columnIndex: 0,
      reason: "keyboard"
    });
    fireEvent.keyDown(wheel, { key: "PageUp" });
    expect(onSelect).toHaveBeenLastCalledWith(["standard"], [deliveryColumn[0]], {
      columnIndex: 0,
      reason: "keyboard"
    });
  });

  it("reports pointer and settled scroll selection without selecting disabled rows", async () => {
    const onSelect = vi.fn();
    render(
      <Picker
        open
        aria-label="配送方式"
        columns={[deliveryColumn]}
        defaultValue={["standard"]}
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByRole("option", { name: "次日达" }));
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("option", { name: "当日达" }));
    expect(document.activeElement).toBe(screen.getByRole("listbox"));
    expect(onSelect).toHaveBeenLastCalledWith(["same-day"], [deliveryColumn[2]], {
      columnIndex: 0,
      reason: "pointer"
    });

    const wheel = screen.getByRole("listbox");
    wheel.scrollTop = 96;
    fireEvent.scroll(wheel);
    await new Promise<void>((resolve) => window.setTimeout(resolve, 100));
    expect(onSelect).toHaveBeenCalledTimes(1);

    wheel.scrollTop = 192;
    fireEvent.scroll(wheel);
    await waitFor(() =>
      expect(onSelect).toHaveBeenLastCalledWith(["locker"], [deliveryColumn[4]], {
        columnIndex: 0,
        reason: "scroll"
      })
    );
    expect(wheel.scrollTop).toBe(192);
  });

  it("discards cancelled drafts and commits only confirmed values", async () => {
    const onConfirm = vi.fn();

    function Example() {
      const [open, setOpen] = useState(true);
      const triggerRef = useRef<HTMLButtonElement>(null);
      return (
        <>
          <button ref={triggerRef} type="button" onClick={() => setOpen(true)}>
            选择配送方式
          </button>
          <Picker
            open={open}
            title="配送方式"
            columns={[deliveryColumn]}
            defaultValue={["standard"]}
            returnFocusRef={triggerRef}
            onConfirm={onConfirm}
            onOpenChange={setOpen}
          />
        </>
      );
    }

    render(<Example />);
    fireEvent.click(screen.getByRole("option", { name: "当日达" }));
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onConfirm).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "选择配送方式" }))
    );

    fireEvent.click(screen.getByRole("button", { name: "选择配送方式" }));
    expect(screen.getByRole("option", { name: "普通配送" }).getAttribute("aria-selected")).toBe(
      "true"
    );
    fireEvent.click(screen.getByRole("option", { name: "当日达" }));
    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    expect(onConfirm).toHaveBeenCalledWith(["same-day"], [deliveryColumn[2]]);

    fireEvent.click(screen.getByRole("button", { name: "选择配送方式" }));
    expect(screen.getByRole("option", { name: "当日达" }).getAttribute("aria-selected")).toBe(
      "true"
    );
  });

  it("reports controlled confirm intent without mutating external state", () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Picker
        open
        aria-label="配送方式"
        columns={[deliveryColumn]}
        value={["standard"]}
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />
    );

    fireEvent.click(screen.getByRole("option", { name: "当日达" }));
    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    expect(onConfirm).toHaveBeenCalledWith(["same-day"], [deliveryColumn[2]]);
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "confirm" });
    expect(screen.getByRole("dialog", { name: "配送方式" })).toBeTruthy();
  });

  it("normalizes invalid values and blocks confirmation for an empty column", () => {
    render(
      <Picker
        open
        aria-label="配送方式"
        columns={[deliveryColumn, []]}
        defaultValue={["missing", null]}
      />
    );

    expect(screen.getByRole("option", { name: "普通配送" }).getAttribute("aria-selected")).toBe(
      "true"
    );
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "确定" }).disabled).toBe(true);
    const emptyWheel = screen.getAllByRole("listbox")[1]!;
    expect(emptyWheel.tabIndex).toBe(-1);
    expect(emptyWheel.getAttribute("aria-disabled")).toBe("true");
  });

  it("renormalizes changing columns without reporting a user selection", () => {
    const onSelect = vi.fn();
    const { rerender } = render(
      <Picker
        open
        aria-label="配送方式"
        columns={[deliveryColumn]}
        value={["same-day"]}
        onSelect={onSelect}
      />
    );

    const reducedColumn = [
      { label: "普通配送", value: "standard" },
      { label: "到店自提", value: "pickup" }
    ] as const;
    rerender(
      <Picker
        open
        aria-label="配送方式"
        columns={[reducedColumn]}
        value={["same-day"]}
        onSelect={onSelect}
      />
    );

    expect(screen.getByRole("option", { name: "普通配送" }).getAttribute("aria-selected")).toBe(
      "true"
    );
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("distinguishes Escape and mask cancellation reasons", async () => {
    const onCancel = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Picker
        open
        aria-label="配送方式"
        columns={[deliveryColumn]}
        onCancel={onCancel}
        onOpenChange={onOpenChange}
      />
    );

    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "取消" }))
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenLastCalledWith({ reason: "escape" });
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: "escape" });

    const mask = document.body.querySelector(
      '[data-meu-overlay-layer="popup"] [data-meu-component="mask"]'
    );
    if (!(mask instanceof HTMLElement) || !(mask.firstElementChild instanceof HTMLElement)) {
      throw new Error("Expected Picker mask");
    }
    fireEvent.click(mask.firstElementChild);
    expect(onCancel).toHaveBeenLastCalledWith({ reason: "mask" });
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: "mask" });
  });

  it("keeps force-mounted closed content out of the accessibility tree", () => {
    render(<Picker open={false} forceMount aria-label="配送方式" columns={[deliveryColumn]} />);
    expect(screen.queryByRole("dialog", { name: "配送方式" })).toBeNull();
    const picker = document.body.querySelector('[data-meu-component="picker"]');
    expect(picker).toBeTruthy();
    const layer = picker && picker.closest('[data-meu-overlay-layer="popup"]');
    expect(layer && layer.hasAttribute("hidden")).toBe(true);
  });

  it("inherits locale, direction, theme and reduced motion through its body portal", () => {
    render(
      <ConfigProvider dir="rtl" locale="en-US" motion="reduced" theme="dark">
        <Picker open aria-label="Delivery" columns={[deliveryColumn]} />
      </ConfigProvider>
    );
    const layer = document.body.querySelector('[data-meu-overlay-layer="popup"]');
    if (!(layer instanceof HTMLElement)) throw new Error("Expected Picker popup layer");
    expect(layer.dir).toBe("rtl");
    expect(layer.lang).toBe("en-US");
    expect(layer.getAttribute("data-meu-theme")).toBe("dark");
    expect(layer.getAttribute("data-meu-motion")).toBe("reduced");
    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
  });
});

describe("PickerTrigger", () => {
  it("inherits Field naming, descriptions and error state", () => {
    render(
      <Field label="配送方式" description="请选择可用方式" error="配送方式必填">
        <PickerTrigger open placeholder="请选择" aria-invalid="grammar" />
      </Field>
    );

    const trigger = screen.getByRole("button", { name: "配送方式" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("data-invalid")).toBe("true");
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
    expect(trigger.getAttribute("aria-describedby")).toContain("description");
    expect(trigger.getAttribute("aria-describedby")).toContain("error");
    expect(within(trigger).getByText("请选择")).toBeTruthy();
  });

  it("preserves caller aria-invalid tokens unless status reports an error", () => {
    const { rerender } = render(<PickerTrigger aria-label="配送方式" aria-invalid={false} />);
    const trigger = screen.getByRole("button", { name: "配送方式" });
    expect(trigger.getAttribute("aria-invalid")).toBe("false");

    rerender(<PickerTrigger aria-label="配送方式" aria-invalid="grammar" />);
    expect(trigger.getAttribute("aria-invalid")).toBe("grammar");
    expect(trigger.getAttribute("data-state")).toBe("error");

    rerender(<PickerTrigger aria-label="配送方式" aria-invalid="spelling" />);
    expect(trigger.getAttribute("aria-invalid")).toBe("spelling");

    rerender(<PickerTrigger aria-label="配送方式" aria-invalid="grammar" status="error" />);
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
    expect(trigger.querySelectorAll("[aria-invalid]")).toHaveLength(0);
  });
});
