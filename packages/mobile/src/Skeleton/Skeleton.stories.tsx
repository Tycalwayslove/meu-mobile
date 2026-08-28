import type { Meta, StoryObj } from "@storybook/react-vite";

import { Skeleton } from "./Skeleton";

const meta = {
  title: "Feedback/Skeleton",
  component: Skeleton,
  args: { animated: false }
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Paragraph: Story = { args: { lines: 4, lineWidths: ["100%", "100%", "88%", "64%"] } };
export const AnimatedParagraph: Story = { args: { animated: true, lines: 3 } };
export const Rectangle: Story = { args: { height: 144, variant: "rectangle" } };
export const Circle: Story = { args: { height: 56, variant: "circle", width: 56 } };
export const StableMediaRatio: Story = {
  args: { animated: true, aspectRatio: "16 / 9", height: "auto", variant: "rectangle" }
};
export const ComposedCard: Story = {
  render: () => (
    <div
      aria-busy="true"
      aria-label="正在加载商品"
      style={{ display: "grid", gap: 12, width: 280 }}
    >
      <Skeleton animated aspectRatio="4 / 3" height="auto" variant="rectangle" />
      <div style={{ display: "flex", gap: 12 }}>
        <Skeleton animated height={44} variant="circle" width={44} />
        <Skeleton animated lines={2} lineWidths={["100%", "62%"]} />
      </div>
    </div>
  )
};
