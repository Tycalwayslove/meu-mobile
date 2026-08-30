// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { CascadePicker } from "./CascadePicker";
import { resolveCascadePath } from "./resolveCascadePath";
import type { CascadePickerOption } from "./types";

const regions = [
  {
    label: "浙江省",
    value: "zhejiang",
    children: [
      {
        label: "杭州市",
        value: "hangzhou",
        children: [
          { label: "西湖区", value: "xihu" },
          { label: "滨江区", value: "binjiang" }
        ]
      },
      { disabled: true, label: "嘉兴市（暂不可用）", value: "jiaxing" },
      {
        label: "宁波市",
        value: "ningbo",
        children: [{ label: "海曙区", value: "haishu" }]
      }
    ]
  },
  {
    label: "江苏省",
    value: "jiangsu",
    children: [
      {
        label: "南京市",
        value: "nanjing",
        children: [{ label: "玄武区", value: "xuanwu" }]
      },
      {
        label: "苏州市",
        value: "suzhou",
        children: [{ label: "姑苏区", value: "gusu" }]
      }
    ]
  },
  { label: "港澳台及海外", value: "other" }
] as const satisfies ReadonlyArray<CascadePickerOption>;

describe("CascadePicker", () => {
  it("normalizes and exposes the complete accessible path", () => {
    render(
      <CascadePicker
        open
        title="配送地区"
        columnLabels={["省份", "城市", "区县"]}
        options={regions}
        defaultValue={["missing"]}
      />
    );

    const dialog = screen.getByRole("dialog", { name: "配送地区" });
    const wheels = within(dialog).getAllByRole("listbox");
    expect(wheels).toHaveLength(3);
    expect(wheels.map((wheel) => wheel.getAttribute("aria-label"))).toEqual([
      "省份",
      "城市",
      "区县"
    ]);
    expect(
      within(dialog).getByRole("option", { name: "浙江省" }).getAttribute("aria-selected")
    ).toBe("true");
    expect(
      within(dialog).getByRole("option", { name: "杭州市" }).getAttribute("aria-selected")
    ).toBe("true");
    expect(
      within(dialog).getByRole("option", { name: "西湖区" }).getAttribute("aria-selected")
    ).toBe("true");
    expect(document.body.querySelector('[data-meu-component="cascade-picker"]')).toBeTruthy();
  });

  it("resets the stale suffix when a parent changes", async () => {
    const onSelect = vi.fn();
    render(
      <CascadePicker
        open
        aria-label="配送地区"
        options={regions}
        defaultValue={["zhejiang", "ningbo", "haishu"]}
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByRole("option", { name: "江苏省" }));
    expect(onSelect).toHaveBeenLastCalledWith(
      ["jiangsu", "nanjing", "xuanwu"],
      [regions[1], regions[1].children[0], regions[1].children[0].children[0]],
      { columnIndex: 0, reason: "pointer" }
    );
    await waitFor(() => expect(screen.getByRole("option", { name: "南京市" })).toBeTruthy());
    expect(screen.queryByRole("option", { name: "宁波市" })).toBeNull();

    fireEvent.click(screen.getByRole("option", { name: "苏州市" }));
    expect(onSelect).toHaveBeenLastCalledWith(
      ["jiangsu", "suzhou", "gusu"],
      [regions[1], regions[1].children[1], regions[1].children[1].children[0]],
      { columnIndex: 1, reason: "pointer" }
    );
  });

  it("shortens the path when the selected item is a leaf", async () => {
    const onSelect = vi.fn();
    render(
      <CascadePicker
        open
        aria-label="配送地区"
        options={regions}
        defaultValue={["zhejiang", "hangzhou", "xihu"]}
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByRole("option", { name: "港澳台及海外" }));
    expect(onSelect).toHaveBeenLastCalledWith(["other"], [regions[2]], {
      columnIndex: 0,
      reason: "pointer"
    });
    await waitFor(() => expect(screen.getAllByRole("listbox")).toHaveLength(1));
  });

  it("discards a cancelled draft and commits the normalized path only on confirm", async () => {
    const onConfirm = vi.fn();

    function Example() {
      const [open, setOpen] = useState(true);
      const triggerRef = useRef<HTMLButtonElement>(null);
      return (
        <>
          <button ref={triggerRef} type="button" onClick={() => setOpen(true)}>
            选择地区
          </button>
          <CascadePicker
            open={open}
            title="配送地区"
            options={regions}
            defaultValue={["zhejiang", "hangzhou", "xihu"]}
            returnFocusRef={triggerRef}
            onConfirm={onConfirm}
            onOpenChange={setOpen}
          />
        </>
      );
    }

    render(<Example />);
    fireEvent.click(screen.getByRole("option", { name: "江苏省" }));
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "选择地区" }));
    expect(screen.getByRole("option", { name: "浙江省" }).getAttribute("aria-selected")).toBe(
      "true"
    );
    fireEvent.click(screen.getByRole("option", { name: "江苏省" }));
    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    expect(onConfirm).toHaveBeenCalledWith(
      ["jiangsu", "nanjing", "xuanwu"],
      [regions[1], regions[1].children[0], regions[1].children[0].children[0]]
    );
  });

  it("reports controlled confirm intent without mutating external state", () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <CascadePicker
        open
        aria-label="配送地区"
        options={regions}
        value={["zhejiang", "hangzhou", "xihu"]}
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />
    );

    fireEvent.click(screen.getByRole("option", { name: "江苏省" }));
    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    expect(onConfirm).toHaveBeenCalledWith(
      ["jiangsu", "nanjing", "xuanwu"],
      [regions[1], regions[1].children[0], regions[1].children[0].children[0]]
    );
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: "confirm" });
    expect(screen.getByRole("dialog", { name: "配送地区" })).toBeTruthy();
  });

  it("keeps an explicit empty child column invalid until options load", () => {
    const onSelect = vi.fn();
    const pending = [{ label: "浙江省", value: "zhejiang", children: [] }] as const;
    const { rerender } = render(
      <CascadePicker
        open
        aria-label="配送地区"
        options={pending}
        value={["zhejiang", null]}
        onSelect={onSelect}
      />
    );

    expect(screen.getAllByRole("listbox")).toHaveLength(2);
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "确定" }).disabled).toBe(true);

    const loaded = [
      {
        label: "浙江省",
        value: "zhejiang",
        children: [{ label: "杭州市", value: "hangzhou" }]
      }
    ] as const;
    rerender(
      <CascadePicker
        open
        aria-label="配送地区"
        options={loaded}
        value={["zhejiang", null]}
        onSelect={onSelect}
      />
    );

    expect(screen.getByRole("option", { name: "杭州市" }).getAttribute("aria-selected")).toBe(
      "true"
    );
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "确定" }).disabled).toBe(false);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("silently normalizes each immutable options update and keeps only the latest branch", () => {
    const onSelect = vi.fn();
    const initial = [
      {
        label: "地区",
        value: "region",
        children: [{ label: "旧城市", value: "old-city" }]
      }
    ] as const;
    const { rerender } = render(
      <CascadePicker
        open
        aria-label="异步地区"
        options={initial}
        defaultValue={["region", "old-city"]}
        onSelect={onSelect}
      />
    );

    const pending = [{ label: "地区", value: "region", children: [] }] as const;
    rerender(<CascadePicker open aria-label="异步地区" options={pending} onSelect={onSelect} />);
    expect(screen.getAllByRole("listbox")).toHaveLength(2);
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "确定" }).disabled).toBe(true);

    const latest = [
      {
        label: "地区",
        value: "region",
        children: [
          { disabled: true, label: "仍不可用", value: "disabled" },
          { label: "最新城市", value: "latest-city" }
        ]
      }
    ] as const;
    rerender(<CascadePicker open aria-label="异步地区" options={latest} onSelect={onSelect} />);

    expect(screen.queryByRole("option", { name: "旧城市" })).toBeNull();
    expect(screen.getByRole("option", { name: "最新城市" }).getAttribute("aria-selected")).toBe(
      "true"
    );
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "确定" }).disabled).toBe(false);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("follows controlled path replacement without publishing a synthetic selection", () => {
    const onSelect = vi.fn();
    const { rerender } = render(
      <CascadePicker
        open
        aria-label="受控地区"
        options={regions}
        value={["zhejiang", "hangzhou", "xihu"]}
        onSelect={onSelect}
      />
    );

    rerender(
      <CascadePicker
        open
        aria-label="受控地区"
        options={regions}
        value={["other"]}
        onSelect={onSelect}
      />
    );
    expect(screen.getAllByRole("listbox")).toHaveLength(1);
    expect(screen.getByRole("option", { name: "港澳台及海外" }).getAttribute("aria-selected")).toBe(
      "true"
    );
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("truncates cyclic object references before repeating a selected level", () => {
    const cyclic: CascadePickerOption<string> = { label: "循环节点", value: "cycle" };
    cyclic.children = [cyclic];

    const path = resolveCascadePath([cyclic], ["cycle", "cycle"]);
    expect(path.columns).toHaveLength(1);
    expect(path.values).toEqual(["cycle"]);
    expect(path.options).toEqual([cyclic]);
  });
});
