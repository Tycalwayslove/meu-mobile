import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { NumberKeyboard } from "./NumberKeyboard";
import { NumberKeyboardTrigger } from "./NumberKeyboardTrigger";
import type { NumberKeyboardExtraKey, NumberKeyboardMode } from "./types";

function KeyboardPreview({
  confirmLabel,
  extraKey,
  mode = "number",
  randomOrder = false
}: {
  confirmLabel?: string;
  extraKey?: NumberKeyboardExtraKey;
  mode?: NumberKeyboardMode;
  randomOrder?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const append = (input: string) => {
    setValue((current) => {
      if (input === "." && current.indexOf(".") >= 0) return current;
      return `${current}${input}`.slice(0, 12);
    });
  };

  return (
    <div style={{ display: "grid", gap: 12, width: "min(100%, 420px)" }}>
      <NumberKeyboardTrigger
        open={open}
        value={value ? `¥ ${value}` : undefined}
        placeholder="输入金额"
        onClick={() => setOpen(true)}
      />
      <output aria-live="polite">表单外置值：{value || "空"}</output>
      <NumberKeyboard
        open={open}
        title="交易金额"
        {...(confirmLabel === undefined ? {} : { confirmLabel })}
        {...(extraKey === undefined ? {} : { extraKey })}
        mode={mode}
        randomOrder={randomOrder}
        onInput={append}
        onDelete={() => setValue((current) => current.slice(0, -1))}
        onOpenChange={setOpen}
      />
    </div>
  );
}

const meta = {
  title: "Data Entry/NumberKeyboard",
  component: NumberKeyboard,
  parameters: { layout: "padded" }
} satisfies Meta<typeof NumberKeyboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Numeric: Story = { render: () => <KeyboardPreview /> };

export const Decimal: Story = {
  render: () => <KeyboardPreview mode="decimal" />
};

export const Confirm: Story = {
  render: () => <KeyboardPreview mode="decimal" confirmLabel="确定" />
};

export const IdentityCard: Story = {
  render: () => (
    <KeyboardPreview extraKey={{ ariaLabel: "字母 X", label: "X", value: "X" }} />
  )
};

export const RandomOrder: Story = {
  render: () => <KeyboardPreview randomOrder />
};
