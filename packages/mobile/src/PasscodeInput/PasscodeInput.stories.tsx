import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Field } from "../Field";
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

function ResetPreview() {
  return (
    <form aria-label="验证码重置示例" style={{ display: "grid", gap: 16 }}>
      <Field
        label="短信验证码"
        description="修改后可恢复到服务端下发的初值"
        required
        labelAssociation="native"
      >
        <PasscodeInput defaultValue="12" length={4} name="verificationCode" separated />
      </Field>
      <button type="reset" style={{ minHeight: 44 }}>
        重置验证码
      </button>
    </form>
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

export const CustomKeyboardWithNativeInput: Story = {
  args: {
    "aria-label": "允许系统自动填充的验证码",
    keyboard: {
      keyboardAriaLabel: "辅助数字键盘",
      suppressNativeKeyboard: false
    },
    length: 6,
    separated: true
  }
};

export const ConnectedComplete: Story = {
  args: {
    "aria-label": "完整支付密码",
    defaultValue: "482913"
  }
};

export const SeparatedPartial: Story = {
  args: {
    "aria-label": "部分短信验证码",
    defaultValue: "482",
    separated: true
  }
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
  render: () => (
    <Field
      label="短信验证码"
      description="请输入短信中的六位数字"
      error="验证码已失效，请重新获取"
      required
      labelAssociation="native"
    >
      <PasscodeInput defaultValue="482913" separated />
    </Field>
  )
};

export const NativeFormReset: Story = {
  render: () => <ResetPreview />,
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector("input");
    const resetButton = canvasElement.querySelector("button[type='reset']");
    if (!(input instanceof HTMLInputElement) || !(resetButton instanceof HTMLButtonElement)) {
      throw new window.Error("Expected PasscodeInput reset story controls");
    }
    const valueDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    if (valueDescriptor && valueDescriptor.set) valueDescriptor.set.call(input, "9876");
    else input.value = "9876";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    const deadline = window.performance.now() + 2_000;
    while (input.value !== "9876") {
      if (window.performance.now() >= deadline) {
        throw new window.Error("PasscodeInput did not process the native input event");
      }
      await new Promise<void>((resolve) => window.setTimeout(resolve, 16));
    }

    resetButton.click();
    while (String(input.value) !== "12") {
      if (window.performance.now() >= deadline) {
        throw new window.Error("Native reset did not restore the PasscodeInput default value");
      }
      await new Promise<void>((resolve) => window.setTimeout(resolve, 16));
    }
  }
};

export const ReadOnly: Story = {
  args: {
    "aria-label": "只读验证码",
    defaultValue: "123456",
    readOnly: true,
    separated: true
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
