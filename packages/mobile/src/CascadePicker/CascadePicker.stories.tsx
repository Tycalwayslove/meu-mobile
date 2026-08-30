import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import { Field } from "../Field";
import { PickerTrigger } from "../Picker";
import { waitForStory } from "../storyTestUtils";
import { CascadePicker } from "./CascadePicker";
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
          { label: "滨江区", value: "binjiang" },
          { label: "上城区", value: "shangcheng" }
        ]
      },
      {
        label: "宁波市",
        value: "ningbo",
        children: [
          { label: "海曙区", value: "haishu" },
          { label: "鄞州区", value: "yinzhou" }
        ]
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
        children: [
          { label: "玄武区", value: "xuanwu" },
          { label: "鼓楼区", value: "gulou" }
        ]
      },
      {
        label: "苏州市",
        value: "suzhou",
        children: [
          { label: "姑苏区", value: "gusu" },
          { label: "吴中区", value: "wuzhong" }
        ]
      }
    ]
  },
  { label: "港澳台及海外", value: "other" }
] satisfies ReadonlyArray<CascadePickerOption>;

const fiveLevelPath = [
  {
    label: "East China commercial distribution region",
    textValue: "East China",
    value: "east-china",
    children: [
      {
        label: "Zhejiang Province fulfillment network",
        textValue: "Zhejiang Province",
        value: "zhejiang-network",
        children: [
          {
            label: "Hangzhou metropolitan delivery zone",
            textValue: "Hangzhou",
            value: "hangzhou-zone",
            children: [
              {
                label: "Xihu district neighborhood cluster",
                textValue: "Xihu district",
                value: "xihu-cluster",
                children: [
                  {
                    label: "Gudang subdistrict pickup location",
                    textValue: "Gudang pickup",
                    value: "gudang-pickup"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
] satisfies ReadonlyArray<CascadePickerOption>;

function labelsForPath(value: ReadonlyArray<string | number | null>) {
  const labels: Array<string> = [];
  let options: ReadonlyArray<CascadePickerOption> = regions;
  value.forEach((segment) => {
    const option = options.find((candidate) => candidate.value === segment);
    if (!option) return;
    labels.push(
      option.textValue ||
        (typeof option.label === "string" || typeof option.label === "number"
          ? String(option.label)
          : String(option.value))
    );
    options = option.children || [];
  });
  return labels;
}

function CascadePickerPreview() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<ReadonlyArray<string | number | null>>([]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const labels = labelsForPath(value);

  return (
    <Field label="配送地区" description="父级变化后会自动切换到新分支的首个可用路径">
      <PickerTrigger
        ref={triggerRef}
        open={open}
        value={labels.length > 0 ? labels.join(" / ") : undefined}
        onClick={() => setOpen(true)}
      />
      <CascadePicker
        open={open}
        title="配送地区"
        columnLabels={["省份", "城市", "区县"]}
        options={regions}
        returnFocusRef={triggerRef}
        value={value}
        onConfirm={setValue}
        onOpenChange={setOpen}
      />
    </Field>
  );
}

const meta = {
  title: "Data Entry/CascadePicker",
  component: CascadePicker,
  args: {
    title: "配送地区",
    options: regions
  },
  render: () => <CascadePickerPreview />
} satisfies Meta<typeof CascadePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RegionPath: Story = {
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLButtonElement>(
      '[data-meu-component="picker-trigger"]'
    );
    if (!trigger) throw new window.Error("Expected the CascadePicker trigger");

    trigger.click();
    await waitForStory(
      () => document.querySelector('[role="dialog"][aria-modal="true"]') !== null,
      "Expected the CascadePicker dialog to open"
    );
    const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
    const jiangsu = dialog
      ? Array.from(dialog.querySelectorAll<HTMLElement>('[role="option"]')).find(
          (option) => option.textContent === "江苏省"
        )
      : undefined;
    if (!jiangsu) throw new window.Error("Expected the Jiangsu option");
    jiangsu.click();
    await Promise.resolve();
    if (jiangsu.getAttribute("aria-selected") !== "true") {
      throw new window.Error("Expected CascadePicker to select Jiangsu");
    }

    const confirm = dialog
      ? Array.from(dialog.querySelectorAll<HTMLButtonElement>("button")).find(
          (button) => button.textContent === "确定"
        )
      : undefined;
    if (!confirm) throw new window.Error("Expected the CascadePicker confirm action");
    confirm.click();
    await waitForStory(
      () => document.querySelector('[role="dialog"][aria-modal="true"]') === null,
      "Expected the CascadePicker dialog to close"
    );
    await waitForStory(
      () => trigger.textContent === "江苏省 / 南京市 / 玄武区",
      "Expected the confirmed CascadePicker path on the trigger"
    );
    await waitForStory(
      () => document.activeElement === trigger,
      "Expected CascadePicker to restore trigger focus"
    );
  }
};

export const ExplicitEmptyChild: Story = {
  args: {
    open: true,
    title: "配送地区",
    options: [{ label: "浙江省", value: "zhejiang", children: [] }]
  },
  render: (args) => <CascadePicker {...args} />
};

export const FiveLevelLocalizedPath: Story = {
  args: {
    cancelText: "Keep current path",
    columnLabels: ["Region", "Province", "City", "District", "Pickup location"],
    confirmText: "Confirm delivery path",
    open: true,
    options: fiveLevelPath,
    title: "Choose a five-level commercial delivery destination"
  },
  render: (args) => <CascadePicker {...args} style={{ maxWidth: 390 }} />,
  play: ({ canvasElement }) => {
    const picker = canvasElement.ownerDocument.body.querySelector<HTMLElement>(
      '[data-meu-component="cascade-picker"]'
    );
    if (!picker) throw new window.Error("Expected the five-level CascadePicker");
    const wheels = Array.from(picker.querySelectorAll<HTMLElement>('[role="listbox"]'));
    if (wheels.length !== 5) throw new window.Error("Expected five cascade columns");
    if (picker.scrollWidth > picker.clientWidth + 1) {
      throw new window.Error("Five-level CascadePicker overflowed horizontally");
    }
    for (const wheel of wheels) {
      const activeId = wheel.getAttribute("aria-activedescendant");
      if (!activeId || !picker.ownerDocument.getElementById(activeId)) {
        throw new window.Error("Expected each cascade column to own an active option");
      }
      if (wheel.getBoundingClientRect().height < 48) {
        throw new window.Error("Expected each cascade wheel to remain operable");
      }
    }
    const actions = Array.from(picker.querySelectorAll<HTMLButtonElement>("button"));
    if (
      actions.length !== 2 ||
      actions.some((action) => action.getBoundingClientRect().height < 44)
    ) {
      throw new window.Error("Expected both localized actions to remain at least 44px tall");
    }
  }
};
