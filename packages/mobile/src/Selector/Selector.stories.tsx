import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Field } from "../Field";
import { Selector } from "./Selector";

const options = [
  { value: "standard", label: "标准配送", description: "预计 2–3 天送达" },
  { value: "express", label: "急速配送", description: "预计当日送达" },
  { value: "pickup", label: "到店自提" },
  { value: "locker", label: "快递柜", disabled: true }
];

const meta = {
  title: "Data Entry/Selector",
  component: Selector,
  args: { options }
} satisfies Meta<typeof Selector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = { args: { defaultValue: ["standard"] } };

export const Multiple: Story = { args: { defaultValue: ["standard", "pickup"], multiple: true } };

export const InField: Story = {
  render: () => (
    <Field label="配送方案" description="选择一种可用方案">
      <Selector options={options} defaultValue={["standard"]} />
    </Field>
  )
};

function ControlledSelector() {
  const [value, setValue] = useState<Array<string | number>>(["standard"]);
  return <Selector options={options} value={value} onChange={setValue} />;
}

export const Controlled: Story = {
  render: () => <ControlledSelector />
};
