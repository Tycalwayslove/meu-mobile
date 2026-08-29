import { MeuIconCheck, MeuIconSearch } from "@meu/icons-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { ConfigProvider } from "../ConfigProvider";
import { Cell } from "./Cell";
import { List } from "./List";

function ActionList() {
  const [selection, setSelection] = useState("尚未选择");
  return (
    <div style={{ display: "grid", gap: 16, width: "min(100%, 420px)" }}>
      <List header="店铺管理" footer="设置会同步到当前账号" mode="card">
        <Cell
          title="搜索商品"
          description="按名称或货号查找"
          prefix={<MeuIconSearch size={22} />}
          onClick={() => setSelection("搜索商品")}
        />
        <Cell title="订单中心" extra="3 个待处理" href="#orders" />
        <Cell title="实名认证" prefix={<MeuIconCheck size={22} />} extra="已完成" arrow={false} />
        <Cell title="停用店铺" disabled onClick={() => setSelection("停用店铺")} />
      </List>
      <output aria-live="polite">{selection}</output>
    </div>
  );
}

const meta = {
  title: "Information/Cell & List",
  component: List,
  parameters: { layout: "padded" }
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Card: Story = {
  render: () => <ActionList />,
  play: async ({ canvasElement }) => {
    const action = canvasElement.querySelector<HTMLButtonElement>("button");
    if (!action) throw new window.Error("Expected an action Cell");
    action.click();
    await Promise.resolve();
    const output = canvasElement.querySelector("output");
    if (!output || output.textContent !== "搜索商品") {
      throw new window.Error("Cell action did not update the business-owned result");
    }
  }
};
export const Plain: Story = {
  render: () => (
    <List header="配送信息" divider="full">
      <Cell title="配送方式" extra="标准配送" />
      <Cell title="收货地址" description="上海市浦东新区" href="#address" />
    </List>
  )
};
export const NoDividers: Story = {
  render: () => (
    <List aria-label="无分隔线列表" mode="card" divider="none">
      <Cell title="第一项" />
      <Cell title="第二项" />
    </List>
  )
};
export const Loading: Story = {
  render: () => (
    <List header="同步状态" footer="加载期间会阻止重复操作" mode="card">
      <Cell
        title="提交订单"
        description="正在校验库存"
        loading
        loadingLabel="正在提交订单"
        onClick={() => undefined}
      />
      <Cell title="打开物流详情" href="#delivery" loading loadingLabel="正在打开物流详情" />
      <Cell title="账户余额" extra="读取中" loading loadingLabel="正在读取账户余额" />
    </List>
  ),
  play: ({ canvasElement }) => {
    const loadingButton = canvasElement.querySelector<HTMLButtonElement>(
      "button[aria-busy='true']"
    );
    if (!loadingButton || !loadingButton.disabled) {
      throw new window.Error("Expected the loading action Cell to be a disabled busy button");
    }
    const loadingLink = canvasElement.querySelector<HTMLAnchorElement>("a[aria-busy='true']");
    if (!loadingLink || loadingLink.hasAttribute("href") || loadingLink.tabIndex !== -1) {
      throw new window.Error(
        "Expected the loading navigation Cell to remain an unavailable anchor"
      );
    }
    if (canvasElement.querySelectorAll("[role='status']").length !== 3) {
      throw new window.Error("Expected every loading Cell to expose a status");
    }
  }
};
export const LongContentAndRTL: Story = {
  render: () => (
    <ConfigProvider dir="rtl">
      <div style={{ width: 320 }}>
        <List header="إعدادات الحساب ذات العنوان الطويل" mode="card">
          <Cell
            title="عنوان طويل يلتف دون إخفاء الإجراء الأصلي"
            description="وصف طويل لا يعتمد على اتجاه يسار أو يمين ثابت"
            extra="قيمة طويلة قابلة للالتفاف"
            href="#details"
          />
        </List>
      </div>
    </ConfigProvider>
  )
};
