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
  },
  play: ({ canvasElement }) => {
    const progress = canvasElement.querySelector<HTMLElement>('[role="progressbar"]');
    if (!progress) throw new window.Error("Expected a progressbar");
    if (
      progress.getAttribute("aria-label") !== "资料上传" ||
      progress.getAttribute("aria-valuemin") !== "0" ||
      progress.getAttribute("aria-valuemax") !== "100" ||
      progress.getAttribute("aria-valuenow") !== "100" ||
      progress.getAttribute("aria-valuetext") !== "已完成"
    ) {
      throw new window.Error("Progress did not expose its clamped accessible value");
    }
    if (!(canvasElement.textContent || "").includes("100.0 / 100")) {
      throw new window.Error("Progress did not render its formatted visible value");
    }
  }
};
export const AnnouncedDanger: Story = {
  args: { announce: true, tone: "danger", value: 24, valueText: "上传失败前已完成百分之二十四" }
};
