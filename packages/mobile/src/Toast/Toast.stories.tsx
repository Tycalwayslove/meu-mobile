import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../Button";
import { Space } from "../Space";
import { Toast } from "./Toast";
import { ToastProvider, useToast } from "./ToastProvider";
import type { ToastProps } from "./types";

function ToastPreview(props: ToastProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>显示 Toast</Button>
      <Toast {...props} open={open} onOpenChange={(nextOpen) => setOpen(nextOpen)} />
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
    message: "库存不足，已调整购买数量",
    position: "bottom",
    tone: "warning"
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
