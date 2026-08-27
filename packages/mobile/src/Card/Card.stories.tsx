import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../Button";
import { Tag } from "../Tag";
import { Card } from "./Card";

const meta = {
  title: "Information/Card",
  component: Card,
  args: {
    children: "展示商品、订单或账户等一组相关信息。",
    description: "刚刚更新",
    extra: <Tag tone="success">营业中</Tag>,
    title: "Meu 示例店铺"
  }
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Outlined: Story = {};
export const Filled: Story = { args: { variant: "filled" } };
export const Elevated: Story = { args: { variant: "elevated" } };
export const WithFooter: Story = {
  args: { footer: <Button size="small">查看详情</Button> }
};
