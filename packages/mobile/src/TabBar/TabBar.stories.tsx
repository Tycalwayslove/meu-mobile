import { MeuIconCheck, MeuIconPlus, MeuIconSearch } from "@meu/icons-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { waitForStory } from "../storyTestUtils";
import { TabBar } from "./TabBar";

const items = [
  { key: "home", label: "首页", icon: <MeuIconCheck size={22} />, href: "#home" },
  { key: "search", label: "发现", icon: <MeuIconSearch size={22} />, href: "#search" },
  { key: "create", label: "发布", icon: <MeuIconPlus size={22} /> },
  {
    key: "orders",
    label: "订单",
    icon: <MeuIconCheck size={22} />,
    badge: 3,
    badgeLabel: "3 个待处理订单"
  }
];

const meta = {
  title: "Navigation/TabBar",
  component: TabBar,
  args: { items, "aria-label": "店铺主导航" }
} satisfies Meta<typeof TabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithSafeArea: Story = { args: { safeArea: true } };
export const RouteInteraction: Story = {
  play: async ({ canvasElement }) => {
    const target = canvasElement.querySelector<HTMLButtonElement>("button");
    if (!target) throw new window.Error("Expected a button-backed tab bar item");
    target.click();
    await waitForStory(
      () => target.getAttribute("aria-current") === "page",
      "TabBar did not mark the requested route current"
    );
  }
};
export const Landscape: Story = {
  render: () => (
    <div style={{ width: 720, maxWidth: "100%" }}>
      <TabBar items={items} safeArea />
    </div>
  )
};
