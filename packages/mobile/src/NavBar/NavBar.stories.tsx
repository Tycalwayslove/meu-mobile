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
