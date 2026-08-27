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
