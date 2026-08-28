import { MeuIconSearch, MeuIconX } from "@meu/icons-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { IconButton } from "./IconButton";

const meta = {
  title: "Actions/IconButton",
  component: IconButton,
  args: { "aria-label": "搜索", children: <MeuIconSearch /> }
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Solid: Story = { args: { variant: "solid", tone: "accent" } };
export const OutlineDanger: Story = {
  args: { "aria-label": "关闭", children: <MeuIconX />, variant: "outline", tone: "danger" }
};
export const Loading: Story = { args: { loading: true } };
export const Pressed: Story = {
  args: { "aria-label": "取消收藏", "aria-pressed": true, variant: "outline", tone: "accent" }
};
export const Sizes: Story = {
  render: () => (
    <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
      <IconButton aria-label="小尺寸搜索" size="small">
        <MeuIconSearch />
      </IconButton>
      <IconButton aria-label="中尺寸搜索" size="medium">
        <MeuIconSearch />
      </IconButton>
      <IconButton aria-label="大尺寸搜索" size="large">
        <MeuIconSearch />
      </IconButton>
    </div>
  )
};
