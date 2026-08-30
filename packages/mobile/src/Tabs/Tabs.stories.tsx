import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { waitForStory } from "../storyTestUtils";
import { Tabs } from "./Tabs";

const items = [
  { key: "overview", label: "概览", content: "店铺经营概览" },
  { key: "orders", label: "订单", badge: 3, content: "订单列表" },
  { key: "products", label: "商品", content: "商品管理" },
  { key: "settings", label: "设置", content: "店铺设置" }
];

const meta = {
  title: "Navigation/Tabs",
  component: Tabs,
  args: { "aria-label": "店铺内容", items }
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Stretched: Story = {};
export const Scrollable: Story = { args: { stretch: false } };
export const OverflowAndDisabled: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Tabs
        aria-label="订单视图"
        stretch={false}
        items={[
          { key: "all", label: "全部订单", content: "全部订单" },
          { key: "pending", label: "待付款订单", badge: 8, content: "待付款订单" },
          { key: "shipping", label: "等待发货", content: "等待发货" },
          { key: "refund", label: "退款售后", content: "退款售后", disabled: true },
          { key: "complete", label: "已完成订单", content: "已完成订单" }
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tabList = canvasElement.querySelector<HTMLElement>('[role="tablist"]');
    const tabs = canvasElement.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    if (!tabList || tabs.length !== 5) {
      throw new window.Error("Expected the complete overflow tab list");
    }
    await waitForStory(
      () => tabList.getAttribute("data-overflow-right") === "true",
      "Tabs did not expose the initial physical overflow edge"
    );
    if (!tabs.item(3).disabled || tabs.item(3).tabIndex !== -1) {
      throw new window.Error("Disabled overflow tab remained keyboard reachable");
    }

    tabs.item(2).focus();
    tabs
      .item(2)
      .dispatchEvent(new window.KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" }));
    await waitForStory(
      () => document.activeElement === tabs.item(4) && tabs.item(4).ariaSelected === "true",
      "Overflow roving focus did not skip the disabled tab and activate the destination"
    );
    await waitForStory(
      () => tabList.getAttribute("data-overflow-left") === "true",
      "Tabs did not update the physical overflow edge after keyboard scrolling"
    );
  }
};
export const ManualActivation: Story = {
  args: { activationMode: "manual" },
  play: async ({ canvasElement }) => {
    const tabs = canvasElement.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    const first = tabs.item(0);
    const second = tabs.item(1);
    first.focus();
    first.dispatchEvent(new window.KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" }));
    if (document.activeElement !== second || second.ariaSelected !== "false") {
      throw new window.Error("Manual Tabs changed selection while only moving focus");
    }
    second.dispatchEvent(new window.KeyboardEvent("keydown", { bubbles: true, key: " " }));
    await waitForStory(
      () => second.ariaSelected === "true",
      "Manual Tabs did not activate the focused tab with Space"
    );
  }
};
export const LazyPanels: Story = { args: { lazy: true } };
export const KeyboardInteraction: Story = {
  args: { stretch: false },
  play: ({ canvasElement }) => {
    const tabs = canvasElement.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    const first = tabs.item(0);
    first.focus();
    first.dispatchEvent(new window.KeyboardEvent("keydown", { bubbles: true, key: "End" }));
    if (document.activeElement !== tabs.item(tabs.length - 1)) {
      throw new window.Error("End did not focus the last enabled tab");
    }
    if (tabs.item(tabs.length - 1).getAttribute("aria-selected") !== "true") {
      throw new window.Error("Automatic activation did not select the focused tab");
    }
    const visiblePanel = canvasElement.querySelector<HTMLElement>(
      '[role="tabpanel"]:not([hidden])'
    );
    if (!visiblePanel || visiblePanel.textContent !== "店铺设置") {
      throw new window.Error("The selected tab did not expose its associated panel");
    }
  }
};
export const RTL: Story = {
  render: () => (
    <div dir="rtl">
      <Tabs aria-label="أقسام المتجر" items={items} stretch={false} />
    </div>
  )
};

function ControlledActivationExample() {
  const [value, setValue] = useState("overview");
  return (
    <Tabs
      aria-label="受控内容路由"
      items={items}
      value={value}
      onChange={(nextValue) => setValue(nextValue)}
    />
  );
}

export const ControlledActivation: Story = {
  render: () => <ControlledActivationExample />,
  play: async ({ canvasElement }) => {
    const target = Array.from(
      canvasElement.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    ).find((candidate) => candidate.textContent === "设置");
    if (!target) throw new window.Error("Expected the controlled settings tab");
    target.click();
    await waitForStory(() => {
      const visiblePanel = canvasElement.querySelector<HTMLElement>(
        '[role="tabpanel"]:not([hidden])'
      );
      return (
        target.ariaSelected === "true" &&
        Boolean(visiblePanel && visiblePanel.textContent === "店铺设置")
      );
    }, "Controlled Tabs caller did not commit the requested active value");
  }
};

export const AdaptiveModes: Story = {
  args: { stretch: false },
  play: ({ canvasElement }) => {
    const tabList = canvasElement.querySelector<HTMLElement>('[role="tablist"]');
    const activeTab = canvasElement.querySelector<HTMLElement>(
      '[role="tab"][aria-selected="true"]'
    );
    if (!tabList || !activeTab || activeTab.getBoundingClientRect().height < 48) {
      throw new window.Error("Tabs lost its minimum interaction geometry");
    }
    const activeStyle = window.getComputedStyle(activeTab);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const durations = activeStyle.transitionDuration
        .split(",")
        .map((duration) => Number.parseFloat(duration));
      if (durations.some((duration) => duration > 0.001)) {
        throw new window.Error("Tabs retained a visible transition under reduced motion");
      }
    }
    if (window.matchMedia("(forced-colors: active)").matches) {
      const listStyle = window.getComputedStyle(tabList);
      if (
        listStyle.maskImage !== "none" ||
        listStyle.webkitMaskImage !== "none" ||
        Number.parseFloat(activeStyle.borderTopWidth) < 1
      ) {
        throw new window.Error("Tabs did not expose its forced-colors boundary");
      }
    }
  }
};

export const Zoom200PercentEquivalent: Story = {
  render: () => (
    <div style={{ width: 195 }}>
      <Tabs aria-label="200% 缩放标签" items={items} stretch={false} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tabList = canvasElement.querySelector<HTMLElement>('[role="tablist"]');
    const tabs = canvasElement.querySelectorAll<HTMLElement>('[role="tab"]');
    if (!tabList) throw new window.Error("Expected the zoom-equivalent tab list");
    await waitForStory(
      () => tabList.getAttribute("data-overflow-right") === "true",
      "Tabs did not remain horizontally operable at a 200% zoom-equivalent width"
    );
    for (const tab of tabs) {
      if (tab.getBoundingClientRect().height < 48) {
        throw new window.Error("Tabs lost its touch height at a 200% zoom-equivalent width");
      }
    }
  }
};
