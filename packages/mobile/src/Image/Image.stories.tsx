import type { Meta, StoryObj } from "@storybook/react-vite";

import { Image } from "./Image";

const meta = {
  title: "Information/Image",
  component: Image,
  args: {
    alt: "山谷中的绿色植物",
    width: 280,
    height: 160,
    radius: "surface",
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800"
  }
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {};
export const Fallback: Story = { args: { src: "", alt: "图片加载失败" } };
export const Lazy: Story = { args: { loading: "lazy" } };
