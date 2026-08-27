import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Field } from "../Field";
import { Stepper } from "./Stepper";

const meta = {
  title: "Data Entry/Stepper",
  component: Stepper,
  args: { defaultValue: 2, min: 0, max: 8 }
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Decimal: Story = {
  args: { defaultValue: 1.5, step: 0.25, precision: 2 }
};

export const InField: Story = {
  render: () => (
    <Field label="购买数量" description="每人限购 8 件">
      <Stepper defaultValue={2} min={1} max={8} />
    </Field>
  )
};

function ControlledStepper() {
  const [value, setValue] = useState<number | null>(1);
  return <Stepper value={value} onChange={setValue} allowEmpty />;
}

export const Controlled: Story = {
  render: () => <ControlledStepper />
};
