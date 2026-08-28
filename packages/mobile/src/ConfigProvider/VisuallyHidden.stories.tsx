import { MeuIconSearch } from "@meu/icons-react";
import { VisuallyHidden } from "@meu/primitives-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Foundation/VisuallyHidden",
  component: VisuallyHidden,
  args: { children: "搜索订单" }
} satisfies Meta<typeof VisuallyHidden>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AccessibleIconButton: Story = {
  render: () => (
    <div>
      <p style={{ color: "var(--meu-color-muted)", margin: "0 0 12px" }}>
        按钮只显示图标，但读屏名称来自 VisuallyHidden 内容。
      </p>
      <button
        type="button"
        style={{
          alignItems: "center",
          background: "var(--meu-color-accent)",
          border: 0,
          borderRadius: "var(--meu-radius-control)",
          color: "var(--meu-color-accent-contrast)",
          display: "inline-flex",
          height: 48,
          justifyContent: "center",
          width: 48
        }}
      >
        <MeuIconSearch aria-hidden />
        <VisuallyHidden>搜索订单</VisuallyHidden>
      </button>
    </div>
  )
};
