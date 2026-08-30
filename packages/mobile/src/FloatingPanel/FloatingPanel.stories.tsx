import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../Button";
import { ConfigProvider } from "../ConfigProvider";
import { Cell, List } from "../List";
import { waitForStory } from "../storyTestUtils";
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

export const Bottom: Story = {
  render: () => <PanelPreview />,
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector<HTMLElement>('[data-meu-component="floating-panel"]');
    const handle = canvasElement.querySelector<HTMLButtonElement>("button[aria-controls]");
    if (!panel || !handle) throw new window.Error("Expected FloatingPanel handle");
    await waitForStory(
      () => panel.getAttribute("data-measured") === "true" && !handle.disabled,
      "FloatingPanel did not finish measuring its anchors"
    );
    handle.click();
    await waitForStory(
      () => panel.getAttribute("data-anchor-index") === "1",
      "FloatingPanel did not request the next controlled anchor"
    );
  }
};

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

function DynamicControlledPanelPreview() {
  const [compact, setCompact] = useState(false);
  const [height, setHeight] = useState(360);
  const anchors = compact ? [160, 320] : [180, 360, 620];
  return (
    <div
      style={{
        position: "relative",
        width: compact ? 240 : 360,
        maxWidth: "100%",
        minHeight: 680,
        overflow: "hidden",
        background: "var(--meu-color-subtle)"
      }}
    >
      <Button size="small" onClick={() => setCompact((current) => !current)}>
        {compact ? "使用宽容器锚点" : "使用紧凑容器锚点"}
      </Button>
      <FloatingPanel
        anchors={anchors}
        height={height}
        onHeightChange={setHeight}
        style={{ position: "absolute" }}
      >
        <Cell
          title="动态路线详情"
          description={compact ? "窄容器 · 最高 320px" : "宽容器 · 最高 620px"}
        />
      </FloatingPanel>
    </div>
  );
}

export const DynamicControlledAnchors: Story = {
  render: () => <DynamicControlledPanelPreview />,
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector<HTMLElement>('[data-meu-component="floating-panel"]');
    const resize = Array.from(canvasElement.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => button.textContent === "使用紧凑容器锚点"
    );
    if (!panel || !resize) throw new window.Error("Expected dynamic FloatingPanel controls");
    await waitForStory(
      () => panel.getAttribute("data-current-height") === "360",
      "FloatingPanel did not resolve the initial controlled anchor"
    );
    resize.click();
    await waitForStory(
      () => panel.getAttribute("data-current-height") === "320" && panel.style.height === "320px",
      "FloatingPanel did not renormalize the controlled height after anchors changed"
    );
    const handle = panel.querySelector<HTMLButtonElement>("button[aria-controls]");
    if (!handle) throw new window.Error("Expected dynamic FloatingPanel handle");
    handle.click();
    await waitForStory(
      () => panel.getAttribute("data-current-height") === "160",
      "FloatingPanel caller did not accept the controlled handle request"
    );
  }
};

export const LongLocalizedAdaptiveContent: Story = {
  render: () => (
    <ConfigProvider dir="rtl" locale="en-US" motion="reduced" theme="dark">
      <div style={{ position: "relative", minHeight: 680, overflow: "hidden" }}>
        <FloatingPanel
          anchors={[180, 360, 620]}
          defaultHeight={620}
          handleLabel="Adjust the height of international route details"
          style={{ position: "absolute" }}
        >
          <article style={{ padding: 16, overflowWrap: "anywhere" }}>
            <h2>International multimodal route details and accessibility guidance</h2>
            {Array.from({ length: 8 }, (_, index) => (
              <p key={index}>
                Segment {index + 1}: connection instructions, platform accessibility notes, transfer
                assistance, destination identifiers and localized operational guidance.
              </p>
            ))}
          </article>
        </FloatingPanel>
      </div>
    </ConfigProvider>
  ),
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector<HTMLElement>('[data-meu-component="floating-panel"]');
    if (!panel) throw new window.Error("Expected adaptive FloatingPanel");
    await waitForStory(
      () => panel.getAttribute("data-current-height") === "620",
      "FloatingPanel did not finish adaptive measurement"
    );
    const handle = panel.querySelector<HTMLButtonElement>("button[aria-controls]");
    const body = panel.querySelector<HTMLElement>('[role="region"]');
    if (!handle || !body) throw new window.Error("Expected FloatingPanel semantic controls");
    if (
      panel.getAttribute("dir") !== "rtl" ||
      panel.getAttribute("lang") !== "en-US" ||
      panel.getAttribute("data-meu-motion") !== "reduced"
    ) {
      throw new window.Error("FloatingPanel lost its localized configuration boundary");
    }
    if (handle.getBoundingClientRect().height < 44) {
      throw new window.Error("FloatingPanel handle lost its minimum touch height");
    }
    if (body.scrollWidth > body.clientWidth + 1) {
      throw new window.Error("FloatingPanel long content overflowed horizontally");
    }
    if (body.getAttribute("data-content-drag") !== null) {
      throw new window.Error("FloatingPanel did not return scrolling to content at the top anchor");
    }
    body.focus();
    if (canvasElement.ownerDocument.activeElement !== body) {
      throw new window.Error("FloatingPanel content region was not keyboard reachable");
    }
    body.scrollTop = 64;
    body.dispatchEvent(new window.Event("scroll", { bubbles: true }));
    if (body.scrollTop !== 64) {
      throw new window.Error("FloatingPanel did not preserve native content scrolling");
    }

    const panelStyle = window.getComputedStyle(panel);
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      panelStyle.transitionDuration
        .split(",")
        .some((duration) => Number.parseFloat(duration) > 0.001)
    ) {
      throw new window.Error("FloatingPanel retained visible motion in reduced-motion mode");
    }
    if (
      window.matchMedia("(forced-colors: active)").matches &&
      Number.parseFloat(window.getComputedStyle(handle).borderTopWidth) < 1
    ) {
      throw new window.Error("FloatingPanel handle lost its forced-colors boundary");
    }
  }
};
