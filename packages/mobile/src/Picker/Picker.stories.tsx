import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import { Field } from "../Field";
import { ConfigProvider } from "../ConfigProvider";
import { waitForStory } from "../storyTestUtils";
import { Picker } from "./Picker";
import { PickerTrigger } from "./PickerTrigger";
import type { PickerOption, PickerProps, PickerValue } from "./types";

const deliveryColumn = [
  { label: "普通配送", value: "standard" },
  { disabled: true, label: "次日达（暂不可用）", value: "next-day" },
  { label: "当日达", value: "same-day" },
  { label: "到店自提", value: "pickup" },
  { label: "快递柜", value: "locker" }
];

function optionForValue(
  column: ReadonlyArray<PickerOption>,
  value: PickerValue | null | undefined
) {
  return column.find((option) => !option.disabled && option.value === value) || null;
}

function PickerPreview(props: PickerProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<ReadonlyArray<PickerValue | null>>([]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const labels = props.columns
    .map((column, index) => optionForValue(column, value[index]))
    .filter((option): option is PickerOption => option !== null)
    .map((option) => option.label);

  return (
    <Field label="配送方案" description="选择后点击确定才会提交">
      <PickerTrigger
        ref={triggerRef}
        open={open}
        value={
          labels.length > 0
            ? labels.map((label, index) => (
                <span key={index}>
                  {index === 0 ? null : " / "}
                  {label}
                </span>
              ))
            : undefined
        }
        onClick={() => setOpen(true)}
      />
      <Picker
        {...props}
        open={open}
        returnFocusRef={triggerRef}
        value={value}
        onConfirm={setValue}
        onOpenChange={setOpen}
      />
    </Field>
  );
}

const meta = {
  title: "Data Entry/Picker",
  component: Picker,
  args: {
    title: "配送方案",
    columns: [deliveryColumn]
  },
  render: (args) => <PickerPreview {...args} />
} satisfies Meta<typeof Picker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleColumn: Story = {
  play: async ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;
    const trigger = canvasElement.querySelector<HTMLButtonElement>(
      '[data-meu-component="picker-trigger"]'
    );
    if (!trigger) throw new window.Error("Expected Picker trigger");

    trigger.focus();
    trigger.click();
    await waitForStory(
      () => body.querySelector('[data-meu-component="picker"]') !== null,
      "Picker did not open"
    );
    const picker = body.querySelector<HTMLElement>('[data-meu-component="picker"]');
    const wheel = picker ? picker.querySelector<HTMLElement>('[role="listbox"]') : null;
    const option = picker
      ? Array.from(picker.querySelectorAll<HTMLElement>('[role="option"]')).find(
          (candidate) => candidate.textContent === "当日达"
        )
      : undefined;
    const confirm = picker
      ? Array.from(picker.querySelectorAll<HTMLButtonElement>("button")).find(
          (button) => button.textContent === "确定"
        )
      : undefined;
    if (!picker || !wheel || !option || !confirm) {
      throw new window.Error("Expected Picker wheel controls");
    }
    if (wheel.getAttribute("aria-orientation") !== "vertical") {
      throw new window.Error("Picker wheel is missing vertical listbox semantics");
    }

    option.click();
    await waitForStory(
      () => option.getAttribute("aria-selected") === "true",
      "Picker did not select the requested option"
    );
    confirm.click();
    await waitForStory(
      () => body.querySelector('[data-meu-component="picker"]') === null,
      "Picker did not close after confirmation"
    );
    if (!trigger.textContent || !trigger.textContent.includes("当日达")) {
      throw new window.Error("Picker confirmation did not update the field value");
    }
    await waitForStory(
      () => canvasElement.ownerDocument.activeElement === trigger,
      "Picker did not restore focus to its trigger"
    );
  }
};

export const MultipleColumns: Story = {
  args: {
    title: "预约时间",
    columnLabels: ["日期", "时段", "分钟"],
    columns: [
      [
        { label: "今天", value: "today" },
        { label: "明天", value: "tomorrow" },
        { label: "后天", value: "after-tomorrow" },
        { label: "周六", value: "saturday" },
        { label: "周日", value: "sunday" }
      ],
      [
        { label: "09 时", value: 9 },
        { label: "10 时", value: 10 },
        { label: "11 时", value: 11 },
        { label: "12 时", value: 12 },
        { label: "13 时", value: 13 }
      ],
      [
        { label: "00 分", value: 0 },
        { label: "10 分", value: 10 },
        { label: "20 分", value: 20 },
        { label: "30 分", value: 30 },
        { label: "40 分", value: 40 }
      ]
    ]
  }
};

export const WithoutVisibleTitle: Story = {
  args: {
    title: undefined,
    "aria-label": "配送方案",
    columns: [deliveryColumn]
  }
};

export const LongLabelsRTL: Story = {
  args: {
    title: "Choose the delivery arrangement for this order",
    columns: [
      [
        {
          label: "Collect from the nearest participating service counter",
          value: "counter"
        },
        { label: "Deliver to the recipient's registered address", value: "address" }
      ]
    ]
  },
  render: (args) => (
    <ConfigProvider dir="rtl" locale="en-US">
      <PickerPreview {...args} />
    </ConfigProvider>
  )
};

export const LongLocalizedActions: Story = {
  args: {
    title: "Choose the preferred delivery window for this order",
    cancelText: "Keep current choice",
    confirmText: "Confirm selection",
    columns: [deliveryColumn]
  },
  render: (args) => (
    <ConfigProvider locale="en-US">
      <Picker {...args} lockScroll={false} open restoreFocus={false} />
    </ConfigProvider>
  ),
  play: ({ canvasElement }) => {
    const picker = canvasElement.ownerDocument.body.querySelector<HTMLElement>(
      '[data-meu-component="picker"]'
    );
    if (!picker) throw new window.Error("Expected open Picker");
    const buttons = Array.from(picker.querySelectorAll<HTMLButtonElement>("button"));
    if (buttons.length !== 2) throw new window.Error("Expected Picker header actions");
    if (picker.scrollWidth > picker.clientWidth + 1) {
      throw new window.Error("Picker overflowed horizontally with localized actions");
    }
    for (const button of buttons) {
      if (button.getBoundingClientRect().height < 44) {
        throw new window.Error("Picker header action is below the 44px touch target");
      }
    }
  }
};
