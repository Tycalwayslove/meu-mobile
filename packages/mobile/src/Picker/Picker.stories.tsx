import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import { Field } from "../Field";
import { ConfigProvider } from "../ConfigProvider";
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

export const SingleColumn: Story = {};

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
