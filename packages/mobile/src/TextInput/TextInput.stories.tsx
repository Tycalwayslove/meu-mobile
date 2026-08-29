import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { ConfigProvider } from "../ConfigProvider";
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

function NativeResetPreview() {
  return (
    <form style={{ display: "grid", gap: 12, maxWidth: 390 }}>
      <TextInput aria-label="可重置店铺名称" clearable defaultValue="Meu Mall" name="storeName" />
      <button type="reset">恢复店铺名称</button>
    </form>
  );
}

function LoadingFocusPreview() {
  const [loading, setLoading] = useState(false);
  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 390 }}>
      <TextInput
        aria-label="异步校验店铺名称"
        clearable
        defaultValue="Meu Mall"
        loading={loading}
        loadingLabel="正在校验店铺名称"
      />
      <button type="button" onClick={() => setLoading(true)}>
        开始校验
      </button>
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
export const ReadOnly: Story = { args: { defaultValue: "审核后锁定", readOnly: true } };
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
export const PasswordAndAutofill: Story = {
  args: {
    "aria-label": "账户密码",
    autoComplete: "current-password",
    clearLabel: "清除密码",
    clearable: true,
    defaultValue: "secret",
    type: "password"
  }
};
export const NativeFormReset: Story = {
  render: () => <NativeResetPreview />,
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>('input[name="storeName"]');
    const clear = canvasElement.querySelector<HTMLButtonElement>('button[type="button"]');
    const reset = canvasElement.querySelector<HTMLButtonElement>('button[type="reset"]');
    if (!input || !clear || !reset) {
      throw new window.Error("Expected TextInput reset controls");
    }

    clear.click();
    await waitForStory(() => input.value === "", "TextInput did not clear before reset");
    reset.click();
    await waitForStory(
      () => input.value === "Meu Mall",
      "TextInput did not restore its native default"
    );
    const form = reset.form;
    if (!form || new FormData(form).get("storeName") !== "Meu Mall") {
      throw new window.Error("TextInput reset value was missing from FormData");
    }
  }
};
export const LoadingFocusTransfer: Story = {
  render: () => <LoadingFocusPreview />,
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      'input[aria-label="异步校验店铺名称"]'
    );
    const clear = canvasElement.querySelector<HTMLButtonElement>('button[aria-label="清除输入"]');
    const start = Array.from(canvasElement.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => button.textContent === "开始校验"
    );
    if (!input || !clear || !start) {
      throw new window.Error("Expected TextInput loading controls");
    }

    clear.focus();
    start.click();
    await waitForStory(
      () =>
        input.getAttribute("aria-busy") === "true" &&
        canvasElement.ownerDocument.activeElement === input,
      "TextInput loading state did not preserve field focus"
    );
  }
};
export const RightToLeft: Story = {
  args: { clearable: true, defaultValue: "متجر ميو", dir: "rtl" }
};
export const ReducedMotionLoading: Story = {
  render: () => (
    <ConfigProvider motion="reduced">
      <TextInput
        aria-label="低动效异步校验"
        defaultValue="Meu"
        loading
        loadingLabel="低动效校验中"
        status="error"
      />
    </ConfigProvider>
  ),
  play: ({ canvasElement }) => {
    const provider = canvasElement.querySelector<HTMLElement>(
      '[data-meu-component="config-provider"]'
    );
    const input = canvasElement.querySelector<HTMLInputElement>(
      'input[aria-label="低动效异步校验"]'
    );
    const status = canvasElement.querySelector<HTMLElement>('[role="status"]');
    if (
      !provider ||
      provider.getAttribute("data-meu-motion") !== "reduced" ||
      !input ||
      input.getAttribute("aria-invalid") !== "true" ||
      !status
    ) {
      throw new window.Error("TextInput did not preserve reduced-motion loading/error semantics");
    }
  }
};
