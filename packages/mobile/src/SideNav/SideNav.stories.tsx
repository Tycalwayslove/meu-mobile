import type { Meta, StoryObj } from "@storybook/react-vite";

import { Cell, List } from "../List";
import { SideNav } from "./SideNav";

const items = [
  {
    key: "featured",
    label: "精选",
    content: (
      <List header="精选商品">
        <Cell title="旅行收纳包" description="轻量防泼水" />
        <Cell title="城市随行杯" description="保温 8 小时" />
      </List>
    )
  },
  {
    key: "food",
    label: "食品",
    badge: 3,
    content: (
      <List header="食品">
        <Cell title="每日坚果" description="独立小包装" />
        <Cell title="冷萃咖啡" description="无糖配方" />
      </List>
    )
  },
  {
    key: "home",
    label: "家居",
    content: (
      <List header="家居">
        <Cell title="香氛蜡烛" />
      </List>
    )
  },
  { key: "service", label: "服务", content: "服务分类暂不可用", disabled: true }
] as const;

const meta = {
  title: "Navigation/SideNav",
  component: SideNav,
  parameters: { layout: "centered" },
  args: { "aria-label": "商品分类", items },
  render: (args) => <SideNav {...args} style={{ width: 390, minHeight: 320 }} />
} satisfies Meta<typeof SideNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const ManualActivation: Story = { args: { activationMode: "manual" } };
export const DestroyInactive: Story = { args: { destroyInactive: true } };
