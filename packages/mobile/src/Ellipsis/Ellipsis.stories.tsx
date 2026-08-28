import type { Meta, StoryObj } from "@storybook/react-vite";

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
export const Middle: Story = { args: { direction: "middle", rows: 1 } };
export const Start: Story = { args: { direction: "start", rows: 2 } };
export const ControlledExpanded: Story = { args: { expanded: true, rows: 1 } };
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
export const NarrowRTL: Story = {
  render: (args) => (
    <div dir="rtl" style={{ width: 240, fontSize: 16, lineHeight: "24px" }}>
      <Ellipsis
        {...args}
        content="نص عربي طويل يختبر القياس والالتفاف وزر التوسيع في شاشة ضيقة"
        rows={2}
      />
    </div>
  )
};
