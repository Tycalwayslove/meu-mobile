import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../Button";
import { ConfigProvider } from "../ConfigProvider";
import { Space } from "../Space";
import { waitForStory } from "../storyTestUtils";
import { BottomSheet } from "./BottomSheet";
import type { BottomSheetProps, BottomSheetSnapPoint } from "./types";

function SheetPreview(props: BottomSheetProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开面板</Button>
      <BottomSheet {...props} open={open} onOpenChange={setOpen} />
    </>
  );
}

function ControlledSnapPreview() {
  const [open, setOpen] = useState(false);
  const [snapPoint, setSnapPoint] = useState<BottomSheetSnapPoint>(0.5);
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开筛选面板</Button>
      <BottomSheet
        open={open}
        title="筛选条件"
        snapPoint={snapPoint}
        snapPoints={[0.3, 0.5, 0.9]}
        onOpenChange={setOpen}
        onSnapPointChange={setSnapPoint}
      >
        <div style={{ display: "grid", gap: 16, padding: 20 }}>
          <span>拖动手柄或使用方向键调整高度。</span>
          <Space wrap gap={2}>
            <Button size="small" onClick={() => setSnapPoint(0.3)}>
              30%
            </Button>
            <Button size="small" onClick={() => setSnapPoint(0.5)}>
              50%
            </Button>
            <Button size="small" onClick={() => setSnapPoint(0.9)}>
              90%
            </Button>
          </Space>
        </div>
      </BottomSheet>
    </>
  );
}

const meta = {
  title: "Feedback/BottomSheet",
  component: BottomSheet,
  args: {
    children: (
      <div style={{ display: "grid", gap: 12, padding: 20 }}>
        <strong>选择配送时间</strong>
        <span style={{ color: "var(--meu-color-muted)" }}>今天 18:00–20:00</span>
        <Button>确认配送</Button>
      </div>
    ),
    showCloseButton: true,
    title: "配送时间"
  },
  render: (args) => <SheetPreview {...args} />
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLButtonElement>("button");
    if (!trigger) throw new window.Error("Expected the BottomSheet trigger");

    trigger.click();
    await waitForStory(
      () => document.querySelector('[role="dialog"][aria-modal="true"]') !== null,
      "Expected the BottomSheet dialog to open"
    );
    const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
    const handle = dialog
      ? dialog.querySelector<HTMLButtonElement>('button[aria-label="调整面板高度"]')
      : null;
    const close = dialog
      ? dialog.querySelector<HTMLButtonElement>('button[aria-label="关闭"]')
      : null;
    if (!handle || !close) throw new window.Error("Expected BottomSheet controls");
    await waitForStory(
      () => document.activeElement === handle,
      "Expected BottomSheet to focus the drag handle"
    );

    close.click();
    await waitForStory(
      () => document.querySelector('[role="dialog"][aria-modal="true"]') === null,
      "Expected the BottomSheet dialog to close"
    );
    await waitForStory(
      () => document.activeElement === trigger,
      "Expected BottomSheet to restore trigger focus"
    );
  }
};

export const MultipleSnapPoints: Story = {
  args: { snapPoints: [0.3, 0.5, 0.9] }
};

export const ControlledSnapPoint: Story = {
  render: () => <ControlledSnapPreview />
};

export const WithoutVisibleTitle: Story = {
  args: {
    "aria-label": "订单操作",
    dragHandle: false,
    title: undefined
  }
};

export const LongScrollableContent: Story = {
  args: {
    children: (
      <div style={{ display: "grid", gap: 12, padding: 20 }}>
        {Array.from({ length: 16 }, (_, index) => (
          <div key={index} style={{ minHeight: 44 }}>
            筛选项 {index + 1}：用于验证长内容、内部滚动和安全区边界
          </div>
        ))}
      </div>
    ),
    defaultOpen: true,
    snapPoints: [0.5, 0.9]
  },
  render: (args) => <BottomSheet {...args} />
};

export const RtlReducedMotion: Story = {
  args: {
    defaultOpen: true,
    snapPoints: [0.4, 0.8],
    title: "خيارات الطلب"
  },
  render: (args) => (
    <ConfigProvider dir="rtl" locale="en-US" motion="reduced">
      <BottomSheet {...args} />
    </ConfigProvider>
  )
};
