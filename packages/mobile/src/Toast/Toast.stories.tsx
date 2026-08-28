import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../Button";
import { Space } from "../Space";
import { waitForStory } from "../storyTestUtils";
import { Toast } from "./Toast";
import { ToastProvider, useToast } from "./ToastProvider";
import type { ToastProps } from "./types";

function ToastPreview(props: ToastProps) {
  const [open, setOpen] = useState(false);
  const [lastChange, setLastChange] = useState("尚未关闭");
  return (
    <>
      <Button onClick={() => setOpen(true)}>显示 Toast</Button>
      <output hidden data-toast-change>
        {lastChange}
      </output>
      <Toast
        {...props}
        open={open}
        onOpenChange={(nextOpen, details) => {
          setOpen(nextOpen);
          setLastChange(`${nextOpen ? "打开" : "关闭"}:${details.reason}`);
          if (props.onOpenChange) props.onOpenChange(nextOpen, details);
        }}
      />
    </>
  );
}

function ProviderPreview() {
  const toast = useToast();
  return (
    <Space wrap gap={2}>
      <Button onClick={() => toast.success({ message: "订单已保存", position: "top" })}>
        成功消息
      </Button>
      <Button
        tone="neutral"
        variant="outline"
        onClick={() =>
          toast.warning({
            action: { label: "撤销" },
            message: "库存不足，已调整购买数量",
            position: "bottom"
          })
        }
      >
        带操作消息
      </Button>
    </Space>
  );
}

const meta = {
  title: "Feedback/Toast",
  component: Toast,
  args: {
    message: "订单信息已更新",
    tone: "neutral"
  },
  render: (args) => <ToastPreview {...args} />
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};
export const Success: Story = { args: { message: "订单已保存", tone: "success" } };
export const WarningWithAction: Story = {
  args: {
    action: { label: "撤销" },
    duration: 0,
    message: "库存不足，已调整购买数量",
    position: "bottom",
    tone: "warning"
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLButtonElement>("button");
    if (!trigger) throw new window.Error("Expected Toast trigger");
    trigger.click();

    const body = canvasElement.ownerDocument.body;
    await waitForStory(
      () => body.querySelector('[data-meu-overlay-layer="toast"]') !== null,
      "Toast did not open in its portal"
    );
    const layer = body.querySelector<HTMLElement>('[data-meu-overlay-layer="toast"]');
    if (!layer) throw new window.Error("Toast did not open in its portal");
    const toast = layer.querySelector<HTMLElement>('[data-meu-component="toast"]');
    const announcement = layer.querySelector<HTMLElement>('[role="alert"]');
    const action = layer.querySelector<HTMLButtonElement>("button");
    if (!toast || !announcement || !action) throw new window.Error("Toast content was incomplete");
    if (
      layer.getAttribute("data-position") !== "bottom" ||
      toast.getAttribute("data-tone") !== "warning" ||
      announcement.getAttribute("aria-live") !== "assertive" ||
      announcement.textContent !== "库存不足，已调整购买数量"
    ) {
      throw new window.Error("Toast did not expose its warning announcement contract");
    }

    action.focus();
    if (canvasElement.ownerDocument.activeElement !== action) {
      throw new window.Error("Toast action did not accept focus");
    }
    action.click();

    const change = canvasElement.querySelector<HTMLOutputElement>("[data-toast-change]");
    await waitForStory(
      () =>
        Boolean(change && change.textContent === "关闭:action") &&
        layer.getAttribute("aria-hidden") === "true",
      "Toast action did not publish its close callback and hide the announcement"
    );
  }
};
export const Danger: Story = { args: { message: "支付失败，请稍后重试", tone: "danger" } };
export const ProviderQueue: Story = {
  render: () => (
    <ToastProvider>
      <ProviderPreview />
    </ToastProvider>
  )
};
