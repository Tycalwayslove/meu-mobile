import type { Meta, StoryObj } from "@storybook/react-vite";

import { Progress } from "./Progress";

const meta = {
  title: "Feedback/Progress",
  component: Progress,
  args: { label: "资料上传", showValue: true, value: 64 }
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Determinate: Story = {};
export const Indeterminate: Story = { args: { indeterminate: true } };
export const Success: Story = { args: { tone: "success", value: 100 } };
export const LargeWarning: Story = { args: { size: "large", tone: "warning", value: 78 } };
export const ClampedAndFormatted: Story = {
  args: {
    formatValue: (value) => `${value.toFixed(1)} / 100`,
    value: 140,
    valueText: "已完成"
  }
};
export const AnnouncedDanger: Story = {
  args: { announce: true, tone: "danger", value: 24, valueText: "上传失败前已完成百分之二十四" }
};
