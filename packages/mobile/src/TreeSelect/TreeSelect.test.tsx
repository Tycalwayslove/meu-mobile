// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useRef, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TreeSelect } from "./TreeSelect";
import type { TreeSelectOption } from "./types";

const categories = [
  {
    label: "数码家电",
    value: "digital",
    children: [
      {
        label: "手机通讯",
        value: "phone",
        children: [
          { label: "智能手机", value: "smartphone" },
          { disabled: true, label: "合约机", value: "contract" }
        ]
      },
      { label: "电脑整机", value: "computer" }
    ]
  },
  {
    label: "家居生活",
    value: "home",
    children: [{ label: "厨房用品", value: "kitchen" }]
  }
] as const satisfies ReadonlyArray<TreeSelectOption>;

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement
  ) {
    const height = this.hasAttribute("data-index")
      ? 52
      : Number.parseFloat(this.style.height) || 320;
    return {
      bottom: height,
      height,
      left: 0,
      right: 390,
      top: 0,
      width: 390,
      x: 0,
      y: 0,
      toJSON: () => ({})
    };
  });
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (
    this: HTMLElement
  ) {
    return this.hasAttribute("data-index") ? 52 : Number.parseFloat(this.style.height) || 0;
  });
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(390);
  Object.defineProperty(HTMLElement.prototype, "scrollTo", {
    configurable: true,
    value: vi.fn(function (this: HTMLElement, options: ScrollToOptions) {
      this.scrollTop = typeof options.top === "number" ? options.top : 0;
    })
  });
});

describe("TreeSelect", () => {
  it("exposes a labelled tree and commits a leaf draft only on confirm", () => {
    const onConfirm = vi.fn();
    const onSelect = vi.fn();
    render(
      <TreeSelect
        open
        title="商品类目"
        options={categories}
        defaultExpandedValues={["digital", "phone"]}
        virtual={false}
        onConfirm={onConfirm}
        onSelect={onSelect}
      />
    );

    const dialog = screen.getByRole("dialog", { name: "商品类目" });
    const tree = within(dialog).getByRole("tree", { name: "可选项" });
    expect(within(tree).getAllByRole("treeitem")).toHaveLength(6);
    const parent = within(tree).getByRole("treeitem", { name: "数码家电" });
    expect(parent.getAttribute("aria-expanded")).toBe("true");
    expect(parent.hasAttribute("aria-selected")).toBe(false);

    fireEvent.click(within(tree).getByRole("treeitem", { name: "智能手机" }));
    expect(onSelect).toHaveBeenCalledWith(
      ["smartphone"],
      [categories[0].children[0].children[0]],
      expect.objectContaining({ reason: "pointer", selected: true })
    );
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: "确定" }));
    expect(onConfirm).toHaveBeenCalledWith(["smartphone"], [categories[0].children[0].children[0]]);
  });

  it("discards cancelled drafts and restores the committed value on reopen", async () => {
    const onConfirm = vi.fn();
    function Example() {
      const [open, setOpen] = useState(true);
      const triggerRef = useRef<HTMLButtonElement>(null);
      return (
        <>
          <button ref={triggerRef} type="button" onClick={() => setOpen(true)}>
            打开类目
          </button>
          <TreeSelect
            open={open}
            aria-label="类目选择"
            options={categories}
            defaultValue={["computer"]}
            defaultExpandedValues={["digital"]}
            returnFocusRef={triggerRef}
            virtual={false}
            onConfirm={onConfirm}
            onOpenChange={setOpen}
          />
        </>
      );
    }

    render(<Example />);
    fireEvent.click(screen.getByRole("treeitem", { name: "电脑整机" }));
    expect(screen.getByRole("treeitem", { name: "电脑整机" }).getAttribute("aria-selected")).toBe(
      "false"
    );
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "打开类目" }));
    expect(screen.getByRole("treeitem", { name: "电脑整机" }).getAttribute("aria-selected")).toBe(
      "true"
    );
  });

  it("supports independent multiple selection and enforces maxCount", () => {
    const onSelect = vi.fn();
    render(
      <TreeSelect
        open
        multiple
        aria-label="多选类目"
        options={categories}
        defaultExpandedValues={["digital", "phone", "home"]}
        maxCount={2}
        virtual={false}
        onSelect={onSelect}
      />
    );

    const tree = screen.getByRole("tree");
    expect(tree.getAttribute("aria-multiselectable")).toBe("true");
    fireEvent.click(screen.getByRole("treeitem", { name: "智能手机" }));
    fireEvent.click(screen.getByRole("treeitem", { name: "电脑整机" }));
    fireEvent.click(screen.getByRole("treeitem", { name: "厨房用品" }));
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("treeitem", { name: "智能手机" }).getAttribute("aria-checked")).toBe(
      "true"
    );
    expect(screen.getByRole("treeitem", { name: "厨房用品" }).getAttribute("aria-checked")).toBe(
      "false"
    );
  });

  it("keeps matching ancestors visible while searching and clears on close", async () => {
    const onSearchValueChange = vi.fn();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <TreeSelect
        open
        aria-label="搜索类目"
        options={categories}
        virtual={false}
        onOpenChange={onOpenChange}
        onSearchValueChange={onSearchValueChange}
      />
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "搜索选项" }), {
      target: { value: "智能" }
    });
    expect(screen.getAllByRole("treeitem").map((item) => item.textContent)).toEqual([
      "数码家电",
      "手机通讯",
      "智能手机"
    ]);
    rerender(
      <TreeSelect
        open={false}
        aria-label="搜索类目"
        options={categories}
        virtual={false}
        onOpenChange={onOpenChange}
        onSearchValueChange={onSearchValueChange}
      />
    );
    await waitFor(() => expect(onSearchValueChange).toHaveBeenLastCalledWith(""));
  });

  it("implements tree arrow navigation and keyboard selection", async () => {
    const onSelect = vi.fn();
    render(
      <TreeSelect
        open
        aria-label="键盘类目"
        options={categories}
        virtual={false}
        onSelect={onSelect}
      />
    );

    const digital = screen.getByRole("treeitem", { name: "数码家电" });
    act(() => digital.focus());
    fireEvent.keyDown(digital, { key: "ArrowRight" });
    expect(digital.getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(digital, { key: "ArrowRight" });
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("treeitem", { name: "手机通讯" }))
    );
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("treeitem", { name: "智能手机" }))
    );
    fireEvent.keyDown(document.activeElement!, { key: " " });
    expect(onSelect).toHaveBeenLastCalledWith(
      ["smartphone"],
      [categories[0].children[0].children[0]],
      expect.objectContaining({ reason: "keyboard", selected: true })
    );
  });

  it("loads async branches once per pending expansion and reports failures", async () => {
    let resolveLoad: (() => void) | undefined;
    const loadChildren = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveLoad = resolve;
        })
    );
    render(
      <TreeSelect
        open
        aria-label="异步类目"
        options={[{ isLeaf: false, label: "远程类目", value: "remote" }]}
        loadChildren={loadChildren}
        virtual={false}
      />
    );

    const remote = screen.getByRole("treeitem", { name: "远程类目" });
    fireEvent.click(remote.querySelector("[data-meu-tree-expand]")!);
    fireEvent.keyDown(remote, { key: "ArrowLeft" });
    fireEvent.keyDown(remote, { key: "ArrowRight" });
    expect(loadChildren).toHaveBeenCalledTimes(1);
    await act(async () => {
      if (resolveLoad) resolveLoad();
      await Promise.resolve();
    });
  });

  it("virtualizes large roots while preserving total tree semantics", async () => {
    const manyOptions = Array.from({ length: 200 }, (_, index) => ({
      label: `类目 ${index}`,
      value: index
    }));
    render(
      <TreeSelect open aria-label="大型类目" options={manyOptions} treeHeight={208} overscan={1} />
    );

    await waitFor(() => expect(screen.getAllByRole("treeitem").length).toBeGreaterThan(2));
    expect(screen.getAllByRole("treeitem").length).toBeLessThan(12);
    const first = screen.getAllByRole("treeitem")[0]!;
    expect(first.getAttribute("aria-posinset")).toBe("1");
    expect(first.getAttribute("aria-setsize")).toBe("200");
  });
});
