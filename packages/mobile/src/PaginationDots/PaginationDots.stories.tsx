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
