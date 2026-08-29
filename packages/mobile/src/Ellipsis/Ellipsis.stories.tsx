import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { waitForStory } from "../storyTestUtils";
import { Ellipsis } from "./Ellipsis";

const content =
  "Meu Mobile 为 Next.js 移动网页提供稳定的设计令牌、原生交互语义与完整表单集成，并为后续跨端扩展保留清晰边界。";

const meta = {
  title: "Information/Ellipsis",
  component: Ellipsis,
  args: { content, rows: 2 }
} satisfies Meta<typeof Ellipsis>;

export default meta;
type Story = StoryObj<typeof meta>;

export const End: Story = {};
export const SingleLine: Story = { args: { rows: 1 } };
export const MultiLine: Story = { args: { rows: 3 } };
export const Middle: Story = { args: { direction: "middle", rows: 1 } };
export const Start: Story = { args: { direction: "start", rows: 2 } };
export const ControlledExpanded: Story = { args: { expanded: true, rows: 1 } };

function ControlledExample() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ width: 220, fontSize: 16, lineHeight: "24px" }}>
      <Ellipsis content={content} rows={1} expanded={expanded} onExpandedChange={setExpanded} />
      <output data-testid="controlled-value">{expanded ? "expanded" : "collapsed"}</output>
    </div>
  );
}

export const ControlledToggle: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    await waitForStory(
      () => canvasElement.querySelector<HTMLButtonElement>("button") !== null,
      "Expected a measured controlled Ellipsis action"
    );
    canvasElement.querySelector<HTMLButtonElement>("button")!.click();
    await waitForStory(() => {
      const output = canvasElement.querySelector("output");
      return output !== null && output.textContent === "expanded";
    }, "Controlled Ellipsis did not accept the requested state");
  }
};

export const InteractiveExpansion: Story = {
  render: () => (
    <div style={{ width: 220, fontSize: 16, lineHeight: "24px" }}>
      <Ellipsis content={content} rows={1} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitForStory(
      () => canvasElement.querySelector<HTMLButtonElement>("button") !== null,
      "Expected a measured Ellipsis action"
    );
    const action = canvasElement.querySelector<HTMLButtonElement>("button")!;
    action.click();
    await waitForStory(
      () => action.getAttribute("aria-expanded") === "true",
      "Ellipsis did not expose its expanded state"
    );
  }
};

export const IconAction: Story = {
  args: {
    rows: 1,
    expandText: <span aria-hidden="true">＋</span>,
    collapseText: <span aria-hidden="true">−</span>,
    expandAriaLabel: "显示完整说明",
    collapseAriaLabel: "收起完整说明"
  }
};

export const TruncationOnly: Story = {
  args: { rows: 2, expandText: null, collapseText: null }
};

export const NarrowRTL: Story = {
  render: (args) => (
    <div dir="rtl" style={{ width: 190, fontSize: 16, lineHeight: "24px" }}>
      <Ellipsis
        {...args}
        content="طلب MEU-2026 يحتوي على نص عربي طويل يختبر القياس والالتفاف وزر التوسيع في شاشة ضيقة"
        direction="middle"
        rows={1}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitForStory(
      () => canvasElement.querySelector('[data-state="collapsed"]') !== null,
      "Expected a truly truncated RTL Ellipsis"
    );
    const action = canvasElement.querySelector<HTMLButtonElement>("button");
    const visual = canvasElement.querySelector<HTMLElement>('span[aria-hidden="true"]');
    if (!action || !visual || !visual.textContent || !visual.textContent.includes("…")) {
      throw new window.Error("RTL Ellipsis did not expose a measured candidate and action");
    }
  }
};
