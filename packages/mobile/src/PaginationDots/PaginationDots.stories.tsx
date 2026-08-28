import type { Meta, StoryObj } from "@storybook/react-vite";

import { PaginationDots } from "./PaginationDots";

const meta = {
  title: "Navigation/PaginationDots",
  component: PaginationDots,
  args: { activeIndex: 1, count: 5 }
} satisfies Meta<typeof PaginationDots>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dots: Story = {};
export const Lines: Story = { args: { variant: "line" } };
export const Vertical: Story = { args: { direction: "vertical", variant: "line" } };
export const Compressed: Story = { args: { activeIndex: 24, count: 50 } };
export const Interactive: Story = {
  args: { activeIndex: 2, count: 12, interactive: true },
  play: ({ canvasElement }) => {
    const target = canvasElement.querySelector<HTMLButtonElement>('button[aria-label*="第 4 页"]');
    if (!target) throw new window.Error("Expected an interactive page button");
    target.click();
  }
};
export const RTL: Story = {
  render: () => (
    <div dir="rtl">
      <PaginationDots activeIndex={2} count={10} interactive />
    </div>
  )
};
