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
