import type { Meta, StoryObj } from "@storybook/react-vite";

import { Avatar } from "./Avatar";

const meta = {
  title: "Information/Avatar",
  component: Avatar,
  args: {
    alt: "林夏",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300"
  }
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ImageAvatar: Story = {};
export const Initial: Story = { args: { src: "", alt: "林夏" } };
export const Rounded: Story = { args: { shape: "rounded", size: "large" } };
