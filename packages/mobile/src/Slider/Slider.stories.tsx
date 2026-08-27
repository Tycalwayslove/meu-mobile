import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Field } from "../Field";
import { Slider } from "./Slider";

const meta = {
  title: "Data Entry/Slider",
  component: Slider,
  args: { defaultValue: 35, showValue: true }
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMarks: Story = {
  args: {
    marks: [
      { value: 0, label: "0" },
      { value: 50, label: "50" },
      { value: 100, label: "100" }
    ]
  }
};

export const InField: Story = {
  render: () => (
    <Field label="配送距离" description="选择 0–20 公里">
      <Slider min={0} max={20} defaultValue={5} showValue formatValue={(value) => `${value} km`} />
    </Field>
  )
};

function ControlledSlider() {
  const [value, setValue] = useState(40);
  return <Slider value={value} onChange={setValue} showValue />;
}

export const Controlled: Story = {
  render: () => <ControlledSlider />
};
