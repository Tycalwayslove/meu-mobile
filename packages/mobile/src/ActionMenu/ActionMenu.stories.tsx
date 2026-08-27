import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import { Button } from "../Button";
import { ActionMenu } from "./ActionMenu";
import { ActionMenuProvider, useActionMenu } from "./ActionMenuProvider";
import type { ActionMenuProps } from "./types";

function ActionMenuPreview(props: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button ref={triggerRef} onClick={() => setOpen(true)}>
        打开操作菜单
      </Button>
      <ActionMenu {...props} open={open} returnFocusRef={triggerRef} onOpenChange={setOpen} />
    </>
  );
}

function ProviderConsumer() {
  const actionMenu = useActionMenu();
  return (
    <Button
      onClick={() =>
        actionMenu.show({
          title: "分享商品",
          description: "选择一个分享方式",
          actions: [
            { key: "copy", label: "复制链接" },
            { key: "system", label: "系统分享" }
          ]
        })
      }
    >
      命令式打开
    </Button>
  );
}

const meta = {
  title: "Feedback/ActionMenu",
  component: ActionMenu,
  args: {
    title: "订单操作",
    description: "选择一个操作继续",
    actions: [
      { key: "copy", label: "复制订单号" },
      { key: "share", label: "分享订单" }
    ]
  },
  render: (args) => <ActionMenuPreview {...args} />
} satisfies Meta<typeof ActionMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDescriptionAndDanger: Story = {
  args: {
    actions: [
      { key: "copy", label: "复制订单号", description: "MEU-2026-0828" },
      { key: "share", label: "分享订单" },
      {
        key: "delete",
        label: "永久删除",
        tone: "danger",
        confirmation: {
          title: "删除订单？",
          description: "订单及关联记录将被永久删除，此操作无法撤销。",
          confirmText: "永久删除"
        }
      }
    ]
  }
};

export const AsyncAction: Story = {
  args: {
    actions: [
      {
        key: "sync",
        label: "同步订单",
        onPress: () => new Promise<void>((resolve) => window.setTimeout(resolve, 800))
      },
      { key: "cancel-sync", label: "停止同步", tone: "danger" }
    ]
  }
};

export const WithoutVisibleTitle: Story = {
  args: {
    "aria-label": "分享操作",
    title: undefined,
    description: undefined
  }
};

export const ProviderScoped: Story = {
  render: () => (
    <ActionMenuProvider>
      <ProviderConsumer />
    </ActionMenuProvider>
  )
};
