import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { ThemeProvider } from "../ConfigProvider";
import { Tag } from "./Tag";

function FilterDemo() {
  const [selected, setSelected] = useState(false);
  return (
    <Tag selected={selected} onClick={() => setSelected((current) => !current)}>
      仅看有货
    </Tag>
  );
}

const meta = {
  title: "Information/Tag",
  component: Tag,
  args: { children: "新品", tone: "accent" }
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Soft: Story = {};
export const Solid: Story = { args: { variant: "solid" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Interactive: Story = { args: { children: "筛选：有货", onClick: () => undefined } };
export const Filter: Story = {
  render: () => <FilterDemo />,
  play: async ({ canvasElement }) => {
    const filter = canvasElement.querySelector<HTMLButtonElement>('button[aria-pressed="false"]');
    if (!filter) throw new window.Error("Expected an unselected filter Tag");
    filter.click();
    await Promise.resolve();
    if (filter.getAttribute("aria-pressed") !== "true") {
      throw new window.Error("Filter Tag did not expose its selected state");
    }
  }
};
export const Closable: Story = {
  args: { children: "可移除", closeAriaLabel: "移除可移除标签", onClose: () => undefined }
};
export const FilterClosable: Story = {
  args: {
    children: "仅看待处理",
    closeAriaLabel: "移除待处理筛选",
    onClick: () => undefined,
    onClose: () => undefined,
    selected: true
  },
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector<HTMLElement>("[data-meu-tag-group]");
    await Promise.resolve();
    if (!group || group.querySelectorAll(":scope > button").length !== 2) {
      throw new window.Error("Expected independent filter and close buttons");
    }
    if (group.querySelector("button button")) {
      throw new window.Error("Tag actions must not be nested");
    }
  }
};
export const LongText: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl" style={{ width: 160, maxWidth: "100%" }}>
        <Story />
      </div>
    )
  ],
  args: {
    children: "هذه تسمية طويلة جدًا للتحقق من العرض الضيق واتجاه النص",
    onClick: () => undefined
  }
};
export const LightAndDark: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      {(["light", "dark"] as const).map((theme) => (
        <ThemeProvider
          key={theme}
          theme={theme}
          style={{ background: "var(--meu-color-surface)", padding: 16 }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Tag tone="success">已完成</Tag>
            <Tag selected onClick={() => undefined}>
              已筛选
            </Tag>
            <Tag onClose={() => undefined}>可移除</Tag>
          </div>
        </ThemeProvider>
      ))}
    </div>
  )
};
