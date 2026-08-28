import type { Meta, StoryObj } from "@storybook/react-vite";

import { Mask } from "./Mask";

const meta = {
  title: "Feedback/Mask",
  component: Mask,
  args: { lockScroll: false, open: true }
} satisfies Meta<typeof Mask>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Thin: Story = { args: { opacity: "thin" } };
export const Thick: Story = { args: { opacity: "thick" } };
export const WithDecorativeContent: Story = {
  args: {
    children: (
      <span
        style={{
          padding: "4px 8px",
          color: "var(--meu-color-overlay-contrast)",
          background: "var(--meu-color-overlay)",
          borderRadius: "var(--meu-radius-control)",
          fontSize: 14,
          fontWeight: 600
        }}
      >
        正在准备内容…
      </span>
    )
  }
};
