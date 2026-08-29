import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

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
export const SafeArea: Story = { args: { safeArea: true } };

export const StickyScrolled: Story = {
  args: { bordered: false, position: "sticky", scrolled: true }
};

export const LoadingBack: Story = {
  args: { backHref: "", backLabel: "订单", backLoading: true, onBack: () => undefined }
};

function BackActionDemo() {
  const [result, setResult] = useState("等待返回");
  return (
    <div>
      <NavBar title="订单" onBack={() => setResult("已请求返回")} />
      <output aria-live="polite">{result}</output>
    </div>
  );
}

export const BackAction: Story = {
  render: () => <BackActionDemo />,
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector<HTMLButtonElement>("button");
    if (!button) throw new window.Error("Expected a back button");
    button.click();
    await Promise.resolve();
    const output = canvasElement.querySelector("output");
    if (!output || output.textContent !== "已请求返回") {
      throw new window.Error("NavBar back action did not reach its caller");
    }
  }
};

function RouterAdapterDemo() {
  const [result, setResult] = useState("等待路由接管");
  return (
    <div>
      <NavBar
        title="订单"
        backHref="/orders"
        onBack={(event) => {
          event.preventDefault();
          setResult("已交给业务路由");
        }}
      />
      <output aria-live="polite">{result}</output>
    </div>
  );
}

export const RouterAdapter: Story = {
  render: () => <RouterAdapterDemo />,
  play: async ({ canvasElement }) => {
    const link = canvasElement.querySelector<HTMLAnchorElement>('a[href="/orders"]');
    if (!link) throw new window.Error("Expected a native back link");
    link.click();
    await Promise.resolve();
    const output = canvasElement.querySelector("output");
    if (!output || output.textContent !== "已交给业务路由") {
      throw new window.Error("NavBar did not allow the router adapter to cancel navigation");
    }
  }
};

function DisabledBackDemo() {
  const [result, setResult] = useState("未触发");
  return (
    <div>
      <NavBar title="订单" backHref="/orders" backDisabled onBack={() => setResult("不应触发")} />
      <output aria-live="polite">{result}</output>
    </div>
  );
}

export const DisabledBack: Story = {
  render: () => <DisabledBackDemo />,
  play: async ({ canvasElement }) => {
    const link = canvasElement.querySelector<HTMLAnchorElement>('a[aria-disabled="true"]');
    if (!link || link.hasAttribute("href") || link.tabIndex !== -1) {
      throw new window.Error("Expected a stable unavailable link without a live href");
    }
    link.click();
    await Promise.resolve();
    const output = canvasElement.querySelector("output");
    if (!output || output.textContent !== "未触发") {
      throw new window.Error("Disabled back control reached its caller");
    }
  }
};

export const LongTitleRTL: Story = {
  render: (args) => (
    <div dir="rtl" style={{ width: 320 }}>
      <NavBar
        {...args}
        title="عنوان صفحة طويل للغاية يجب أن يبقى في المنتصف"
        backLabel="الطلبات"
        right={<Button variant="text">مساعدة</Button>}
      />
    </div>
  )
};
