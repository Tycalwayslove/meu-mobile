import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import { Button } from "../Button";
import { Dialog } from "./Dialog";
import type { DialogProps } from "./types";

function DialogPreview(props: DialogProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button ref={triggerRef} onClick={() => setOpen(true)}>
        打开 Dialog
      </Button>
      <Dialog
        {...props}
        open={open}
        returnFocusRef={triggerRef}
        onOpenChange={(nextOpen) => setOpen(nextOpen)}
      />
    </>
  );
}

const meta = {
  title: "Feedback/Dialog",
  component: Dialog,
  args: {
    actions: [
      { autoFocus: true, key: "cancel", label: "取消" },
      { key: "confirm", label: "确认", tone: "accent" }
    ],
    description: "提交后将进入审核流程，仍可在订单详情中查看进度。",
    title: "确认提交退款？"
  },
  render: (args) => <DialogPreview {...args} />
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Confirm: Story = {};
export const Danger: Story = {
  args: {
    actions: [
      { autoFocus: true, key: "cancel", label: "取消" },
      { key: "delete", label: "永久删除", tone: "danger" }
    ],
    description: "订单及关联记录将被永久删除，此操作无法撤销。",
    title: "删除订单？"
  }
};
export const VerticalActions: Story = {
  args: {
    actions: [
      { key: "later", label: "稍后处理" },
      { key: "draft", label: "保存草稿" },
      { key: "submit", label: "立即提交", tone: "accent" }
    ],
    description: "选择接下来要执行的操作。",
    title: "处理当前申请"
  }
};
