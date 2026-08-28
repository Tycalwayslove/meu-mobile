import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { waitForStory } from "../storyTestUtils";
import { TextInput } from "./TextInput";

function ClearablePreview() {
  const [clearCount, setClearCount] = useState(0);
  return (
    <div>
      <TextInput
        aria-label="可清除输入框"
        clearable
        defaultValue="可清除内容"
        onClear={() => setClearCount((current) => current + 1)}
      />
      <output hidden data-clear-count>
        已清除 {clearCount} 次
      </output>
    </div>
  );
}

const meta = {
  title: "Forms/TextInput",
  component: TextInput,
  args: {
    "aria-label": "示例输入框",
    placeholder: "请输入内容"
  },
  parameters: {
    layout: "padded"
  }
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const FocusReference: Story = { args: { autoFocus: true } };
export const Error: Story = { args: { status: "error", defaultValue: "错误内容" } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "不可编辑" } };
export const Clearable: Story = {
  args: { clearable: true, defaultValue: "可清除内容" },
  render: () => <ClearablePreview />,
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>('input[aria-label="可清除输入框"]');
    const clear = canvasElement.querySelector<HTMLButtonElement>('button[aria-label="清除输入"]');
    if (!input || !clear) throw new window.Error("Expected clearable TextInput controls");

    input.focus();
    if (canvasElement.ownerDocument.activeElement !== input) {
      throw new window.Error("TextInput did not accept focus");
    }
    clear.click();

    const count = canvasElement.querySelector<HTMLOutputElement>("[data-clear-count]");
    await waitForStory(
      () =>
        input.value === "" &&
        Boolean(count && count.textContent === "已清除 1 次") &&
        canvasElement.ownerDocument.activeElement === input,
      "TextInput clear action did not update value, callback state, and focus"
    );
  }
};
export const Small: Story = { args: { size: "small" } };
export const Large: Story = { args: { size: "large" } };
