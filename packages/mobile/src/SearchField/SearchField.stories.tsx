import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Field } from "../Field";
import { SearchField } from "./SearchField";

function ControlledSearch() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("尚未搜索");

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 390 }}>
      <SearchField
        aria-label="搜索商品"
        placeholder="搜索商品、品牌或订单"
        value={query}
        onChange={setQuery}
        onSearch={(value) => setSubmitted(value ? `搜索：${value}` : "请输入搜索词")}
      />
      <output aria-live="polite">{submitted}</output>
    </div>
  );
}

const meta = {
  title: "Forms/SearchField",
  component: SearchField,
  args: {
    "aria-label": "搜索示例",
    placeholder: "搜索内容"
  },
  parameters: { layout: "padded" }
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const ControlledAndSubmitted: Story = { render: () => <ControlledSearch /> };
export const Error: Story = {
  render: () => (
    <Field label="搜索订单" error="关键词至少输入 2 个字符">
      <SearchField defaultValue="喵" />
    </Field>
  )
};
export const Disabled: Story = { args: { defaultValue: "不可搜索", disabled: true } };
export const Loading: Story = { args: { defaultValue: "正在查询订单", loading: true } };
export const Large: Story = { args: { size: "large" } };
