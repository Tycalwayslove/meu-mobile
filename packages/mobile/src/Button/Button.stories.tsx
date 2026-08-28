import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "./Button";

function ButtonInteractionPreview() {
  const [saveCount, setSaveCount] = useState(0);
  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <Button onClick={() => setSaveCount((count) => count + 1)}>保存更改</Button>
      <output aria-live="polite">保存次数：{saveCount}</output>
    </div>
  );
}

const meta = {
  title: "Actions/Button",
  component: Button,
  args: { children: "保存更改" }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Solid: Story = {
  render: () => <ButtonInteractionPreview />,
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector<HTMLButtonElement>("button");
    const output = canvasElement.querySelector("output");
    if (!button || !output) throw new window.Error("Expected Button interaction controls");

    button.focus();
    button.click();
    await Promise.resolve();
    if (document.activeElement !== button || output.textContent !== "保存次数：1") {
      throw new window.Error("Expected Button activation to retain focus and update state");
    }
  }
};
export const Outline: Story = { args: { variant: "outline" } };
export const Loading: Story = { args: { loading: true } };
export const Danger: Story = { args: { tone: "danger", children: "删除这条记录" } };
