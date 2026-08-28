import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import { PickerTrigger } from "../Picker";
import { ConfigProvider } from "../ConfigProvider";
import { waitForStory } from "../storyTestUtils";
import { TreeSelect } from "./TreeSelect";
import type { TreeSelectOption } from "./types";

const options = [
  {
    label: "数码家电",
    value: "digital",
    children: [
      {
        label: "手机通讯",
        value: "phone",
        children: [
          { label: "智能手机", value: "smartphone" },
          { disabled: true, label: "合约机（暂不可选）", value: "contract" }
        ]
      },
      { label: "电脑整机", value: "computer" }
    ]
  },
  {
    label: "家居生活",
    value: "home",
    children: [
      { label: "厨房用品", value: "kitchen" },
      { label: "收纳清洁", value: "storage" }
    ]
  }
] satisfies TreeSelectOption<string>[];

function ControlledExample({ multiple = false, readOnly = false }) {
  const [open, setOpen] = useState(false);
  const [confirmCount, setConfirmCount] = useState(0);
  const [value, setValue] = useState<string[]>(
    multiple ? ["smartphone", "kitchen"] : ["smartphone"]
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const labels = new Map([
    ["smartphone", "智能手机"],
    ["computer", "电脑整机"],
    ["kitchen", "厨房用品"],
    ["storage", "收纳清洁"]
  ]);
  return (
    <div style={{ width: "min(100%, 420px)" }}>
      <PickerTrigger
        ref={triggerRef}
        aria-describedby={readOnly ? "tree-select-readonly" : undefined}
        open={open}
        value={value.map((item) => labels.get(item)).join("、")}
        onClick={() => setOpen(true)}
      />
      {readOnly ? (
        <span id="tree-select-readonly" style={{ position: "absolute", clipPath: "inset(50%)" }}>
          只读
        </span>
      ) : null}
      <output hidden data-tree-confirm>
        {confirmCount}:{value.join(",")}
      </output>
      <TreeSelect<string>
        open={open}
        multiple={multiple}
        readOnly={readOnly}
        title="商品类目"
        options={options}
        value={value}
        defaultExpandedValues={["digital", "phone", "home"]}
        {...(multiple ? { maxCount: 3 } : {})}
        returnFocusRef={triggerRef}
        onConfirm={(nextValue) => {
          setValue([...nextValue]);
          setConfirmCount((current) => current + 1);
        }}
        onOpenChange={setOpen}
      />
    </div>
  );
}

function AsyncExample() {
  const [asyncOptions, setAsyncOptions] = useState<TreeSelectOption<string>[]>([
    { isLeaf: false, label: "远程商品类目", value: "remote" }
  ]);
  return (
    <TreeSelect
      open
      title="异步类目"
      options={asyncOptions}
      virtual={false}
      loadChildren={async (_option, { signal }) => {
        await new Promise((resolve) => window.setTimeout(resolve, 700));
        if (signal.aborted) return;
        setAsyncOptions([
          {
            label: "远程商品类目",
            value: "remote",
            children: [
              { label: "新到商品", value: "new" },
              { label: "补货商品", value: "restocked" }
            ]
          }
        ]);
      }}
    />
  );
}

const meta = {
  title: "Data Entry/TreeSelect",
  component: TreeSelect,
  parameters: { layout: "padded" }
} satisfies Meta<typeof TreeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  args: { open: false, "aria-label": "商品类目", options },
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLButtonElement>(
      '[data-meu-component="picker-trigger"]'
    );
    if (!trigger) throw new window.Error("Expected TreeSelect trigger");
    if (!(trigger.textContent || "").includes("智能手机")) {
      throw new window.Error("TreeSelect trigger did not show its committed value");
    }
    trigger.click();

    const body = canvasElement.ownerDocument.body;
    await waitForStory(
      () => body.querySelector('[data-meu-component="tree-select"]') !== null,
      "TreeSelect did not open in its portal"
    );
    const panel = body.querySelector<HTMLElement>('[data-meu-component="tree-select"]');
    if (!panel) throw new window.Error("TreeSelect did not open in its portal");
    const dialog = panel.closest<HTMLElement>('[role="dialog"]');
    const tree = panel.querySelector<HTMLElement>('[role="tree"]');
    if (!dialog || !tree) throw new window.Error("TreeSelect dialog content was incomplete");
    const cancel = Array.from(dialog.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => (button.textContent || "").trim() === "取消"
    );
    if (!cancel) throw new window.Error("Expected TreeSelect cancel action");
    await waitForStory(
      () => canvasElement.ownerDocument.activeElement === cancel,
      "TreeSelect did not move focus into the dialog"
    );

    const computer = Array.from(tree.querySelectorAll<HTMLElement>('[role="treeitem"]')).find(
      (item) => (item.textContent || "").includes("电脑整机")
    );
    if (!computer) throw new window.Error("Expected computer category tree item");
    computer.click();
    await waitForStory(
      () => computer.getAttribute("aria-selected") === "true",
      "TreeSelect did not update its draft selection"
    );
    if (!(trigger.textContent || "").includes("智能手机")) {
      throw new window.Error("TreeSelect committed its draft before confirmation");
    }

    const confirm = Array.from(dialog.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => (button.textContent || "").trim() === "确定"
    );
    if (!confirm) throw new window.Error("Expected TreeSelect confirm action");
    confirm.click();
    const confirmation = canvasElement.querySelector<HTMLOutputElement>("[data-tree-confirm]");
    await waitForStory(
      () =>
        Boolean(confirmation && (confirmation.textContent || "").trim() === "1:computer") &&
        (trigger.textContent || "").includes("电脑整机") &&
        canvasElement.ownerDocument.activeElement === trigger,
      "TreeSelect did not publish its confirmed value and restore trigger focus"
    );
  }
};
export const Multiple: Story = {
  args: { open: false, "aria-label": "商品类目", options },
  render: () => <ControlledExample multiple />
};
export const ReadOnly: Story = {
  args: { open: false, "aria-label": "商品类目", options },
  render: () => <ControlledExample readOnly />
};
export const Empty: Story = {
  args: { open: true, "aria-label": "空类目", options: [], virtual: false }
};
export const ValidationError: Story = {
  args: {
    open: true,
    title: "商品类目",
    options,
    status: "error",
    defaultExpandedValues: ["digital"],
    virtual: false
  }
};
export const AsyncBranch: Story = {
  args: { open: true, "aria-label": "异步类目", options: [] },
  render: () => <AsyncExample />
};
export const RightToLeft: Story = {
  args: { open: true, "aria-label": "Categories", options },
  render: () => (
    <ConfigProvider dir="rtl" locale="en-US">
      <TreeSelect
        open
        title="Categories"
        options={options}
        defaultExpandedValues={["digital"]}
        virtual={false}
      />
    </ConfigProvider>
  )
};
