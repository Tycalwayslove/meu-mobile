import type { Meta, StoryObj } from "@storybook/react-vite";

import { Cell, List } from "../List";
import { IndexList } from "./IndexList";

const routeGroups = [
  {
    key: "A",
    title: "A",
    content: (
      <List divider="full">
        <Cell title="安静早晨路线" description="2.8 km · 35 分钟" />
        <Cell title="奥体中心路线" description="4.1 km · 50 分钟" />
      </List>
    )
  },
  {
    key: "B",
    title: "B",
    content: (
      <List divider="full">
        <Cell title="滨江夜跑路线" description="5.0 km · 62 分钟" />
        <Cell title="北山散步路线" description="3.4 km · 43 分钟" />
      </List>
    )
  },
  {
    key: "C",
    title: "C",
    content: (
      <List divider="full">
        <Cell title="城市绿道路线" description="6.2 km · 78 分钟" />
        <Cell title="茶园轻徒步" description="7.5 km · 96 分钟" />
      </List>
    )
  }
] as const;

const meta = {
  title: "Navigation/IndexList",
  component: IndexList,
  parameters: { layout: "centered" },
  args: { "aria-label": "路线索引列表", sections: routeGroups, sticky: true },
  render: (args) => <IndexList {...args} style={{ width: 390, height: 420 }} />
} satisfies Meta<typeof IndexList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomBrief: Story = {
  args: {
    sections: routeGroups.map((group, index) => ({
      ...group,
      brief: `${index + 1}`,
      title: `分组 ${group.key}`
    }))
  }
};

export const NonSticky: Story = { args: { sticky: false } };
