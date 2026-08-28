"use client";

import { Button, Cell, FloatingPanel, List } from "@meu/mobile";
import { useState } from "react";

const anchors = [180, 340, 520] as const;

export function FloatingPanelDemo() {
  const [height, setHeight] = useState<number>(anchors[0]);
  return (
    <div
      style={{
        position: "relative",
        minHeight: 580,
        overflow: "hidden",
        background: "var(--meu-color-subtle)",
        border: "1px solid var(--meu-color-border)",
        borderRadius: "var(--meu-radius-surface)"
      }}
    >
      <div
        aria-label="行程地图占位"
        style={{
          display: "grid",
          minHeight: 580,
          placeItems: "center",
          color: "var(--meu-color-muted)",
          backgroundImage:
            "linear-gradient(var(--meu-color-border) 1px, transparent 1px), linear-gradient(90deg, var(--meu-color-border) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      >
        背景地图保持可见且可交互
      </div>
      <FloatingPanel
        anchors={anchors}
        height={height}
        onHeightChange={setHeight}
        style={{ position: "absolute" }}
      >
        <List header="附近行程">
          <Cell title="安静早晨路线" description="2.8 km · 预计 35 分钟" />
          <Cell title="城市散步路线" description="4.2 km · 预计 52 分钟" />
          <Cell title="完整路线详情" suffix={<Button size="small">查看</Button>} />
        </List>
        <p style={{ padding: 16, color: "var(--meu-color-muted)" }}>
          当前面板高度：{height}px。最高点时内容区恢复原生滚动。
        </p>
      </FloatingPanel>
    </div>
  );
}
