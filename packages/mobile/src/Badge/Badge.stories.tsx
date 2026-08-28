import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemeProvider } from "../ConfigProvider";
import { Badge } from "./Badge";

const meta = {
  title: "Information/Badge",
  component: Badge,
  args: { content: 8 }
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Count: Story = {};
export const Overflow: Story = { args: { content: 128, max: 99 } };
export const Dot: Story = {
  args: {
    children: <span style={{ display: "block", width: 44, height: 44, background: "#eaece7" }} />,
    dot: true,
    label: "有新消息"
  }
};
export const StatusTones: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <Badge content="同步中" tone="neutral" />
      <Badge content="新功能" tone="accent" />
      <Badge content="成功" tone="success" />
      <Badge content="注意" tone="warning" />
      <Badge content="失败" tone="danger" />
    </div>
  )
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
          <Badge content={128} max={99} bordered>
            <span style={{ display: "grid", minWidth: 44, minHeight: 44, placeItems: "center" }}>
              消息
            </span>
          </Badge>
        </ThemeProvider>
      ))}
    </div>
  )
};
