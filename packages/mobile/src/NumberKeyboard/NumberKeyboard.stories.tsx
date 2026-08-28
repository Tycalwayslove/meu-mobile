import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { NumberKeyboard } from "./NumberKeyboard";
import { NumberKeyboardTrigger } from "./NumberKeyboardTrigger";
import { waitForStory } from "../storyTestUtils";
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

export const Numeric: Story = {
  render: () => <KeyboardPreview />,
  play: async ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;
    const trigger = canvasElement.querySelector<HTMLButtonElement>(
      '[data-meu-component="number-keyboard-trigger"]'
    );
    const output = canvasElement.querySelector<HTMLOutputElement>("output");
    if (!trigger || !output) throw new window.Error("Expected NumberKeyboard preview");

    trigger.focus();
    trigger.click();
    await waitForStory(
      () => body.querySelector('[data-meu-component="number-keyboard"]') !== null,
      "NumberKeyboard did not open"
    );
    const keyboard = body.querySelector<HTMLElement>('[data-meu-component="number-keyboard"]');
    const one = keyboard
      ? keyboard.querySelector<HTMLButtonElement>('button[aria-label="1"]')
      : null;
    const two = keyboard
      ? keyboard.querySelector<HTMLButtonElement>('button[aria-label="2"]')
      : null;
    const backspace = keyboard
      ? keyboard.querySelector<HTMLButtonElement>('button[aria-label="删除上一位"]')
      : null;
    const close = keyboard
      ? Array.from(keyboard.querySelectorAll<HTMLButtonElement>("button")).find(
          (button) => button.textContent === "收起"
        )
      : undefined;
    if (!keyboard || !one || !two || !backspace || !close) {
      throw new window.Error("Expected NumberKeyboard controls");
    }
    const labelledBy = keyboard.getAttribute("aria-labelledby");
    const title = labelledBy ? canvasElement.ownerDocument.getElementById(labelledBy) : null;
    if (keyboard.getAttribute("role") !== "group" || !title || title.textContent !== "交易金额") {
      throw new window.Error("NumberKeyboard is missing its labelled group semantics");
    }

    one.click();
    two.click();
    await waitForStory(
      () => output.textContent === "表单外置值：12",
      "Number input was not emitted"
    );
    backspace.click();
    await waitForStory(() => output.textContent === "表单外置值：1", "Delete was not emitted");
    close.click();
    await waitForStory(
      () => body.querySelector('[data-meu-component="number-keyboard"]') === null,
      "NumberKeyboard did not close"
    );
    if (
      trigger.getAttribute("aria-expanded") !== "false" ||
      canvasElement.ownerDocument.activeElement !== trigger
    ) {
      throw new window.Error("NumberKeyboard did not close while preserving trigger focus");
    }
  }
};

export const Decimal: Story = {
  render: () => <KeyboardPreview mode="decimal" />
};

export const Confirm: Story = {
  render: () => <KeyboardPreview mode="decimal" confirmLabel="确定" />
};

export const IdentityCard: Story = {
  render: () => <KeyboardPreview extraKey={{ ariaLabel: "字母 X", label: "X", value: "X" }} />
};

export const RandomOrder: Story = {
  render: () => <KeyboardPreview randomOrder />
};
