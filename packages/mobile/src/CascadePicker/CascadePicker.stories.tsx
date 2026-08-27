import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import { Field } from "../Field";
import { PickerTrigger } from "../Picker";
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

export const RegionPath: Story = {};

export const ExplicitEmptyChild: Story = {
  args: {
    open: true,
    title: "配送地区",
    options: [{ label: "浙江省", value: "zhejiang", children: [] }]
  },
  render: (args) => <CascadePicker {...args} />
};
