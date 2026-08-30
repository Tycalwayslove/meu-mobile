import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import { waitForStory } from "../storyTestUtils";
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

function ButtonLifecyclePreview() {
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("idle");
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <Button
        ref={buttonRef}
        leadingIcon={<span>前</span>}
        loading={loading}
        onClick={() => {
          setAttempts((count) => count + 1);
          setLoading(true);
          setResult("saving");
        }}
        trailingIcon={<span>后</span>}
      >
        保存设置
      </Button>
      <button
        type="button"
        data-action="fail"
        style={{ minHeight: 44 }}
        onClick={() => {
          setLoading(false);
          setResult("failed");
          if (buttonRef.current) buttonRef.current.focus();
        }}
      >
        模拟失败
      </button>
      <output>
        {result}; attempts={attempts}
      </output>
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
export const AsyncFailureLifecycle: Story = {
  render: () => <ButtonLifecyclePreview />,
  play: async ({ canvasElement }) => {
    const action = canvasElement.querySelector<HTMLButtonElement>("[data-meu-component='button']");
    const fail = canvasElement.querySelector<HTMLButtonElement>("[data-action='fail']");
    const output = canvasElement.querySelector("output");
    if (!action || !fail || !output) {
      throw new window.Error("Expected Button lifecycle controls");
    }
    const idleWidth = action.getBoundingClientRect().width;

    action.click();
    await waitForStory(() => action.disabled, "Button did not enter loading state");
    action.click();
    if (output.textContent !== "saving; attempts=1") {
      throw new window.Error("Button loading state did not suppress repeated activation");
    }
    const loadingWidth = action.getBoundingClientRect().width;
    if (Math.abs(loadingWidth - idleWidth) > 0.5) {
      throw new window.Error("Button width changed while loading");
    }

    fail.click();
    await waitForStory(() => !action.disabled, "Button did not recover after failure");
    action.click();
    await waitForStory(
      () => output.textContent === "saving; attempts=2",
      "Button could not be activated again after failure"
    );
  }
};
export const Danger: Story = { args: { tone: "danger", children: "删除这条记录" } };
export const MobileStateMatrix: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, width: "min(100%, 390px)" }}>
      <Button block>主要操作</Button>
      <Button block variant="outline" tone="neutral">
        次要操作
      </Button>
      <Button block variant="ghost" tone="danger">
        危险操作
      </Button>
      <Button block loading>
        正在保存这项设置
      </Button>
      <Button block disabled>
        暂不可用
      </Button>
      <Button block>允许换行的较长移动端操作文案</Button>
    </div>
  )
};
