import { MeuIconCheck, MeuIconPlus, MeuIconSearch } from "@meu/icons-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

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

function ControlledRouterExample() {
  const [route, setRoute] = useState<string | null>("home");
  return (
    <div>
      <output aria-live="polite">当前页面：{route || "无"}</output>
      <TabBar
        aria-label="受控店铺导航"
        items={items}
        value={route}
        onChange={(nextRoute, event) => {
          event.preventDefault();
          setRoute(nextRoute);
        }}
      />
    </div>
  );
}

export const ControlledRouter: Story = {
  render: () => <ControlledRouterExample />,
  play: async ({ canvasElement }) => {
    const target = canvasElement.querySelector<HTMLAnchorElement>('a[href="#search"]');
    if (!target) throw new window.Error("Expected the controlled search link");
    target.click();
    await waitForStory(() => {
      const output = canvasElement.querySelector("output");
      return (
        target.getAttribute("aria-current") === "page" &&
        Boolean(output && output.textContent === "当前页面：search")
      );
    }, "TabBar did not publish and render the controlled route");
  }
};

export const DisabledDestination: Story = {
  args: {
    items: [
      ...items.slice(0, 2),
      {
        key: "account",
        label: "账户",
        icon: <MeuIconCheck size={22} />,
        href: "#account",
        disabled: true
      }
    ]
  },
  play: async ({ canvasElement }) => {
    const disabledLink = canvasElement.querySelector<HTMLAnchorElement>(
      'a[data-tab-bar-key="account"][aria-disabled="true"]'
    );
    if (!disabledLink || disabledLink.tabIndex !== -1 || disabledLink.hasAttribute("href")) {
      throw new window.Error(
        "Expected a disabled link without live navigation or sequential focus"
      );
    }
    disabledLink.click();
    await Promise.resolve();
    if (disabledLink.hasAttribute("aria-current")) {
      throw new window.Error("Disabled destination became current");
    }
  }
};

export const NarrowLongLabels: Story = {
  render: () => (
    <div style={{ width: 320, maxWidth: "100%" }}>
      <TabBar
        aria-label="窄屏长文案导航"
        items={[
          { ...items[0]!, label: "商城首页与推荐" },
          { ...items[1]!, label: "搜索商品与店铺" },
          { ...items[2]!, label: "发布新的商品" },
          { ...items[3]!, label: "待处理订单", badge: 128, badgeLabel: "128 个待处理订单" }
        ]}
      />
    </div>
  )
};

export const RTL: Story = {
  render: () => (
    <div dir="rtl">
      <TabBar aria-label="التنقل الرئيسي" items={items} safeArea />
    </div>
  )
};

export const Landscape: Story = {
  render: () => (
    <div style={{ width: 720, maxWidth: "100%" }}>
      <TabBar items={items} safeArea />
    </div>
  ),
  globals: { viewport: { value: "meuMobile", isRotated: true } }
};
