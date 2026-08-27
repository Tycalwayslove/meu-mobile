import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../Button";
import { Space } from "../Space";
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

export const Default: Story = {};

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
