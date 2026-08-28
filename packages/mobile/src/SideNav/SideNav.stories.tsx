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
export const KeyboardInteraction: Story = {
  args: { activationMode: "manual" },
  play: async ({ canvasElement }) => {
    const tabs = canvasElement.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    const first = tabs.item(0);
    const second = tabs.item(1);
    first.focus();
    first.dispatchEvent(new window.KeyboardEvent("keydown", { bubbles: true, key: "ArrowDown" }));
    await Promise.resolve();
    if (
      canvasElement.ownerDocument.activeElement !== second ||
      second.getAttribute("aria-selected") !== "false"
    ) {
      throw new window.Error("Manual SideNav did not move focus without activating");
    }
    second.dispatchEvent(new window.KeyboardEvent("keydown", { bubbles: true, key: "Enter" }));
    await Promise.resolve();
    if (second.getAttribute("aria-selected") !== "true") {
      throw new window.Error("Manual SideNav did not activate on Enter");
    }
  }
};
export const DestroyInactive: Story = { args: { destroyInactive: true } };
export const LongScrollableRTL: Story = {
  render: (args) => (
    <div dir="rtl" style={{ width: 390, height: 280 }}>
      <SideNav
        {...args}
        items={Array.from({ length: 14 }, (_, index) => ({
          key: `category-${index}`,
          label: `فئة طويلة رقم ${index + 1}`,
          ...(index === 5 ? { badge: 12, badgeLabel: "12 عنصرًا" } : {}),
          content: `محتوى الفئة ${index + 1}`
        }))}
        defaultValue="category-10"
        style={{ height: "100%" }}
      />
    </div>
  )
};
