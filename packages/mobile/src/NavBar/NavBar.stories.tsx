import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../Button";
import { NavBar } from "./NavBar";

const meta = {
  title: "Navigation/NavBar",
  component: NavBar,
  args: { title: "订单详情", backHref: "#back" }
} satisfies Meta<typeof NavBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithActions: Story = {
  args: { backLabel: "订单", right: <Button variant="text">帮助</Button> }
};
export const Borderless: Story = { args: { bordered: false } };
