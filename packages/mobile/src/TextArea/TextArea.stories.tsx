import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Field } from "../Field";
import { TextArea } from "./TextArea";

function ControlledLimitDemo() {
  const [value, setValue] = useState("包装完整，商品无划痕。");

  return (
    <Field label="验货备注" description="示例业务规则：最多接受 20 个 UTF-16 code units">
      <TextArea
        autoSize={{ minRows: 2, maxRows: 5 }}
        maxLength={60}
        showCount
        value={value}
        onChange={(event) => {
          if (event.currentTarget.value.length <= 20) setValue(event.currentTarget.value);
        }}
      />
    </Field>
  );
}

function ResetDemo() {
  return (
    <form aria-label="商品说明表单">
      <Field label="商品说明" description="修改后可使用原生 form.reset() 恢复">
        <TextArea
          autoSize={{ minRows: 2, maxRows: 5 }}
          defaultValue="初始说明"
          maxLength={100}
          showCount
        />
      </Field>
      <button type="reset" style={{ marginBlockStart: 16, minHeight: 44 }}>
        重置说明
      </button>
    </form>
  );
}

const meta = {
  title: "Forms/TextArea",
  component: TextArea,
  args: {
    "aria-label": "多行输入示例",
    placeholder: "请输入详细内容"
  },
  parameters: { layout: "padded" }
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Counted: Story = {
  args: { defaultValue: "🐱喵呜", maxLength: 100, showCount: true }
};

export const AutoSize: Story = {
  args: {
    autoSize: { minRows: 2, maxRows: 6 },
    defaultValue: "输入、粘贴或容器宽度变化后，高度会在两到六行之间更新。"
  }
};

export const ControlledRollback: Story = {
  render: () => <ControlledLimitDemo />
};

export const NativeFormReset: Story = {
  render: () => <ResetDemo />,
  play: async ({ canvasElement }) => {
    const textArea = canvasElement.querySelector("textarea");
    const form = canvasElement.querySelector("form");
    const resetButton = canvasElement.querySelector("button[type='reset']");
    if (!(textArea instanceof HTMLTextAreaElement) || !(form instanceof HTMLFormElement)) {
      throw new window.Error("Expected TextArea reset story controls");
    }
    if (!(resetButton instanceof HTMLButtonElement)) {
      throw new window.Error("Expected TextArea reset button");
    }

    const waitFor = async (predicate: () => boolean, message: string) => {
      const deadline = window.performance.now() + 2_000;
      while (!predicate()) {
        if (window.performance.now() >= deadline) throw new window.Error(message);
        await new Promise<void>((resolve) => window.setTimeout(resolve, 16));
      }
    };

    const valueDescriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
    if (valueDescriptor && valueDescriptor.set) {
      valueDescriptor.set.call(textArea, "修改后的商品说明");
    } else {
      textArea.value = "修改后的商品说明";
    }
    textArea.dispatchEvent(new Event("input", { bubbles: true }));
    await waitFor(
      () => canvasElement.querySelector("[data-meu-slot='count']")?.textContent === "8 / 100",
      "TextArea input event did not update the uncontrolled value and count"
    );

    resetButton.click();
    await waitFor(
      () =>
        textArea.value === "初始说明" &&
        canvasElement.querySelector("[data-meu-slot='count']")?.textContent === "4 / 100",
      "Native reset did not restore TextArea value and count"
    );

    if (form.elements.length !== 2) throw new window.Error("Unexpected reset story form controls");
  }
};

export const Small: Story = { args: { size: "small" } };
export const Large: Story = { args: { size: "large" } };

export const Error: Story = {
  render: () => (
    <div>
      <p id="publishing-help">发布后修改需重新审核</p>
      <Field
        label="商品介绍"
        description="说明将展示在商品详情页"
        error="商品介绍至少输入 10 个字符"
        required
      >
        <TextArea
          aria-describedby="publishing-help"
          defaultValue="太短"
          showCount
          maxLength={200}
        />
      </Field>
    </div>
  )
};

export const ReadOnly: Story = {
  args: { defaultValue: "该说明已随审核单锁定。", readOnly: true, showCount: true }
};

export const Disabled: Story = { args: { defaultValue: "不可编辑内容", disabled: true } };
