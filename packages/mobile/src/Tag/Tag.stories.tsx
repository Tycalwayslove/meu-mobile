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
export const LongText: Story = {
  args: { children: "这是一个用于验证窄屏和长翻译文本截断行为的标签", onClick: () => undefined }
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
