import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Field } from "../Field";
import { waitForStory } from "../storyTestUtils";
import { SearchField } from "./SearchField";

function ControlledSearch() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("尚未搜索");
  const [source, setSource] = useState("尚无事件");

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 390 }}>
      <SearchField
        aria-label="搜索商品"
        placeholder="搜索商品、品牌或订单"
        value={query}
        onChange={(nextValue, details) => {
          setQuery(nextValue);
          setSource(`value source: ${details.source}`);
        }}
        onClear={(details) => setSource(`clear source: ${details.source}`)}
        onSearch={(nextValue, details) => {
          setSubmitted(nextValue ? `搜索：${nextValue}` : "请输入搜索词");
          setSource(`search source: ${details.source}`);
        }}
      />
      <output aria-live="polite">{submitted}</output>
      <small>{source}</small>
    </div>
  );
}

function NativeFormSearch() {
  const [submitted, setSubmitted] = useState("尚未提交");

  return (
    <form
      style={{ display: "grid", gap: 12, maxWidth: 390 }}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const query = data.get("query");
        setSubmitted(`原生提交：${typeof query === "string" ? query : ""}`);
      }}
    >
      <SearchField
        aria-label="原生表单搜索"
        defaultValue="订单"
        name="query"
        placeholder="回车提交表单"
      />
      <output aria-live="polite">{submitted}</output>
    </form>
  );
}

function NativeResetSearch() {
  return (
    <form style={{ display: "grid", gap: 12, maxWidth: 390 }}>
      <SearchField
        aria-label="可重置搜索"
        defaultValue="订单"
        name="query"
        placeholder="修改后恢复初始搜索词"
      />
      <button type="reset">恢复搜索条件</button>
    </form>
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
export const ClearAndFocusContract: Story = {
  args: { defaultValue: "TextArea" },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="search"]');
    const clear = canvasElement.querySelector<HTMLButtonElement>('button[type="button"]');
    if (!input || !clear)
      throw new globalThis.Error("SearchField contract controls were not rendered");

    clear.click();
    await Promise.resolve();

    if (input.value !== "")
      throw new globalThis.Error("Clear did not reset the uncontrolled value");
    if (document.activeElement !== input)
      throw new globalThis.Error("Clear did not restore input focus");
  }
};
export const Error: Story = {
  render: () => (
    <Field label="搜索订单" error="关键词至少输入 2 个字符">
      <SearchField defaultValue="喵" />
    </Field>
  )
};
export const DescriptionComposition: Story = {
  render: () => (
    <div>
      <p id="search-policy">搜索结果只展示当前店铺商品</p>
      <Field label="搜索店铺" description="支持商品名或品牌" error="请输入至少两个字符">
        <SearchField aria-describedby="search-policy" defaultValue="喵" />
      </Field>
    </div>
  ),
  play: ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="search"]');
    if (!input) throw new globalThis.Error("Expected SearchField description control");
    const ids = (input.getAttribute("aria-describedby") || "").split(" ").filter(Boolean);
    if (!ids.includes("search-policy") || !ids.some((id) => id.includes("description"))) {
      throw new globalThis.Error("SearchField did not merge caller and Field descriptions");
    }
    if (!ids.some((id) => id.includes("error")) || new Set(ids).size !== ids.length) {
      throw new globalThis.Error("SearchField description IDs were incomplete or duplicated");
    }
  }
};
export const Disabled: Story = { args: { defaultValue: "不可搜索", disabled: true } };
export const ReadOnly: Story = { args: { defaultValue: "固定筛选条件", readOnly: true } };
export const Loading: Story = {
  args: { defaultValue: "正在查询订单", loading: true, loadingLabel: "订单搜索中" }
};
export const NativeFormSubmission: Story = { render: () => <NativeFormSearch /> };
export const NativeFormReset: Story = {
  render: () => <NativeResetSearch />,
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="search"]');
    const clear = canvasElement.querySelector<HTMLButtonElement>('button[type="button"]');
    const reset = canvasElement.querySelector<HTMLButtonElement>('button[type="reset"]');
    if (!input || !clear || !reset) {
      throw new globalThis.Error("SearchField reset controls were not rendered");
    }

    clear.click();
    await waitForStory(() => input.value === "", "SearchField did not clear before reset");
    reset.click();
    await waitForStory(
      () => input.value === "订单",
      "SearchField did not restore defaultValue on native reset"
    );
    const data = new FormData(reset.form!);
    if (data.get("query") !== "订单") {
      throw new globalThis.Error("SearchField reset value was missing from FormData");
    }
  }
};
export const RightToLeft: Story = {
  args: { defaultValue: "طلب", dir: "rtl", placeholder: "ابحث عن الطلبات" }
};
export const Large: Story = { args: { size: "large" } };
