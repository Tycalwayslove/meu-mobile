import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../Button";
import { Space } from "./Space";

const itemStyle = {
  background: "var(--meu-color-surface)",
  border: "1px solid var(--meu-color-border)",
  borderRadius: "var(--meu-radius-control)",
  boxSizing: "border-box" as const,
  minWidth: 88,
  padding: "10px 12px",
  textAlign: "center" as const
};

const meta = {
  title: "Layout/Space",
  component: Space,
  parameters: {
    docs: {
      description: {
        component:
          "使用 Meu spacing token 排列同级内容。horizontal 顺序跟随 dir；wrap 只应在容器尺寸明确时使用。"
      }
    }
  }
} satisfies Meta<typeof Space>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <Space>
      <Button>保存</Button>
      <Button variant="outline">取消</Button>
    </Space>
  )
};
export const Vertical: Story = {
  render: () => (
    <Space direction="vertical" align="stretch">
      <Button>主要操作</Button>
      <Button variant="outline">次要操作</Button>
    </Space>
  )
};

export const Wrapped: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Space block gap={3} wrap>
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} style={itemStyle}>
            筛选项 {index + 1}
          </span>
        ))}
      </Space>
    </div>
  )
};

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <Space gap={3}>
        <span style={itemStyle}>第一项</span>
        <span style={itemStyle}>第二项</span>
        <span style={itemStyle}>第三项</span>
      </Space>
    </div>
  )
};

export const TokenScale: Story = {
  render: () => (
    <Space direction="vertical" align="stretch" gap={3} block>
      {([1, 2, 3, 4, 6, 8] as const).map((gap) => (
        <Space key={gap} gap={gap} aria-label={`gap token ${gap}`}>
          <span style={{ ...itemStyle, minWidth: 64 }}>A</span>
          <span style={{ color: "var(--meu-color-muted)", fontSize: 12 }}>space-{gap}</span>
          <span style={{ ...itemStyle, minWidth: 64 }}>B</span>
        </Space>
      ))}
    </Space>
  )
};
