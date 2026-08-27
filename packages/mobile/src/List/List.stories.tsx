import { MeuIconCheck, MeuIconSearch } from "@meu/icons-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

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

export const Card: Story = { render: () => <ActionList /> };
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
