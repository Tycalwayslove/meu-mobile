import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../Button";
import { Space } from "../Space";
import { waitForStory } from "../storyTestUtils";
import { Popover } from "./Popover";
import type { PopoverPlacement, PopoverProps } from "./types";

function PopoverPreview(props: PopoverProps) {
  const [open, setOpen] = useState(false);
  return <Popover {...props} open={open} onOpenChange={setOpen} />;
}

const content = (
  <div style={{ display: "grid", gap: 8 }}>
    <strong>订单快捷操作</strong>
    <span style={{ color: "var(--meu-color-muted)" }}>
      浮层会避开视口边缘并保持可访问焦点顺序。
    </span>
    <Button size="small">复制订单号</Button>
  </div>
);

const meta = {
  title: "Feedback/Popover",
  component: Popover,
  args: {
    "aria-label": "订单快捷操作",
    children: <Button>更多操作</Button>,
    content
  },
  render: (args) => <PopoverPreview {...args} />
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;
    const trigger = canvasElement.querySelector<HTMLButtonElement>("button");
    if (!trigger) throw new window.Error("Expected Popover trigger");
    if (
      trigger.getAttribute("aria-haspopup") !== "dialog" ||
      trigger.getAttribute("aria-expanded") !== "false"
    ) {
      throw new window.Error("Popover trigger is missing closed dialog semantics");
    }

    trigger.focus();
    trigger.click();
    await waitForStory(
      () => body.querySelector('[data-meu-component="popover"]') !== null,
      "Popover did not open"
    );
    const popover = body.querySelector<HTMLElement>('[data-meu-component="popover"]');
    if (
      !popover ||
      popover.getAttribute("role") !== "dialog" ||
      popover.getAttribute("aria-label") !== "订单快捷操作" ||
      trigger.getAttribute("aria-expanded") !== "true" ||
      trigger.getAttribute("aria-controls") !== popover.id
    ) {
      throw new window.Error("Popover did not expose its trigger-to-dialog relationship");
    }
    await waitForStory(
      () => canvasElement.ownerDocument.activeElement === popover,
      "Popover did not move focus into its content"
    );

    canvasElement.ownerDocument.dispatchEvent(
      new window.KeyboardEvent("keydown", { bubbles: true, key: "Escape" })
    );
    await waitForStory(
      () => body.querySelector('[data-meu-component="popover"]') === null,
      "Popover did not close on Escape"
    );
    await waitForStory(
      () => canvasElement.ownerDocument.activeElement === trigger,
      "Popover did not restore focus to its trigger"
    );
  }
};

export const WithoutArrow: Story = { args: { arrow: false, placement: "bottom-start" } };

const placements: PopoverPlacement[] = ["top", "right", "bottom", "left"];

export const PlacementOverview: Story = {
  render: () => (
    <Space wrap gap={4}>
      {placements.map((placement) => (
        <Popover
          key={placement}
          aria-label={`${placement} Popover`}
          placement={placement}
          content={<span>实际位置可能因视口碰撞而翻转。</span>}
        >
          <Button size="small" tone="neutral" variant="outline">
            {placement}
          </Button>
        </Popover>
      ))}
    </Space>
  )
};

export const Manual: Story = {
  render: () => {
    function ManualExample() {
      const [open, setOpen] = useState(false);
      return (
        <Space gap={2} align="center">
          <Popover
            aria-label="手动控制的帮助内容"
            content="trigger=manual 时，触发器只负责锚点与 ARIA 关联。"
            open={open}
            trigger="manual"
            onOpenChange={setOpen}
          >
            <Button tone="neutral" variant="outline">
              帮助锚点
            </Button>
          </Popover>
          <Button size="small" onClick={() => setOpen((current) => !current)}>
            {open ? "关闭" : "打开"}
          </Button>
        </Space>
      );
    }
    return <ManualExample />;
  }
};
