import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../Button";
import { Cell, List } from "../List";
import { FloatingPanel } from "./FloatingPanel";
import type { FloatingPanelPlacement } from "./types";

function PanelPreview({ placement = "bottom" }: { placement?: FloatingPanelPlacement }) {
  const anchors = [180, 360, 620] as const;
  const [height, setHeight] = useState<number>(anchors[0]);
  return (
    <div
      style={{
        position: "relative",
        minHeight: 680,
        overflow: "hidden",
        background: "var(--meu-color-subtle)"
      }}
    >
      <div
        style={{
          display: "grid",
          height: "100%",
          minHeight: 680,
          placeItems: "center",
          color: "var(--meu-color-muted)",
          backgroundImage:
            "linear-gradient(var(--meu-color-border) 1px, transparent 1px), linear-gradient(90deg, var(--meu-color-border) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      >
        地图上下文保持可见
      </div>
      <FloatingPanel
        anchors={anchors}
        height={height}
        placement={placement}
        onHeightChange={setHeight}
        style={{ position: "absolute" }}
      >
        <List header="附近行程">
          <Cell title="安静早晨路线" description="2.8 km · 预计 35 分钟" />
          <Cell title="城市散步路线" description="4.2 km · 预计 52 分钟" />
          <Cell title="完整路线详情" suffix={<Button size="small">查看</Button>} />
        </List>
        <p style={{ padding: 16, color: "var(--meu-color-muted)" }}>
          面板未到最高点时可从非交互内容继续拖动；最高点保留原生滚动。
        </p>
      </FloatingPanel>
    </div>
  );
}

const meta = {
  title: "Gesture/FloatingPanel",
  component: FloatingPanel,
  parameters: { layout: "fullscreen" },
  args: { anchors: [180, 360, 620], children: "行程详情" },
  argTypes: {
    anchors: { control: false },
    children: { control: false },
    onHeightChange: { control: false }
  }
} satisfies Meta<typeof FloatingPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bottom: Story = { render: () => <PanelPreview /> };

export const Top: Story = { render: () => <PanelPreview placement="top" /> };

export const Disabled: Story = {
  render: () => (
    <div style={{ minHeight: 680 }}>
      <FloatingPanel anchors={[180, 360, 620]} disabled>
        <Cell title="固定高度" description="拖拽与键盘调整均已关闭" />
      </FloatingPanel>
    </div>
  )
};
