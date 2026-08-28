import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { PasscodeInput } from "./PasscodeInput";

function ControlledPreview({ customKeyboard = false }: { customKeyboard?: boolean }) {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("等待输入");

  return (
    <div style={{ display: "grid", gap: 12, width: "min(100%, 420px)" }}>
      <PasscodeInput
        aria-label="短信验证码"
        value={value}
        length={6}
        separated
        {...(customKeyboard ? { keyboard: { closeOnComplete: true, title: "验证码键盘" } } : {})}
        onChange={setValue}
        onComplete={(completedValue) => setMessage(`输入完成：${completedValue}`)}
      />
      <output aria-live="polite">{message}</output>
    </div>
  );
}

const meta = {
  title: "Data Entry/PasscodeInput",
  component: PasscodeInput,
  parameters: { layout: "padded" }
} satisfies Meta<typeof PasscodeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NativeKeyboard: Story = { render: () => <ControlledPreview /> };

export const CustomKeyboard: Story = {
  render: () => <ControlledPreview customKeyboard />
};

export const PlainText: Story = {
  args: {
    "aria-label": "明文验证码",
    defaultValue: "482913",
    mask: false,
    separated: true
  }
};

export const Error: Story = {
  args: {
    "aria-label": "错误的验证码",
    defaultValue: "482913",
    separated: true,
    status: "error"
  }
};

export const Disabled: Story = {
  args: {
    "aria-label": "不可用验证码",
    defaultValue: "123",
    disabled: true,
    separated: true
  }
};

export const RightToLeft: Story = {
  args: {
    "aria-label": "RTL code",
    defaultValue: "אב",
    direction: "rtl",
    inputMode: "text",
    mask: false,
    separated: true
  }
};
