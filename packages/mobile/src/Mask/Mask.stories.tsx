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
  },
  play: ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;
    const mask = body.querySelector<HTMLElement>('[data-meu-component="mask"]');
    const backdrop = mask ? mask.querySelector<HTMLButtonElement>("button") : null;
    if (!mask || !backdrop || !mask.textContent || !mask.textContent.includes("正在准备内容…")) {
      throw new window.Error("Expected Mask decorative content");
    }
    if (
      mask.getAttribute("aria-hidden") !== "true" ||
      backdrop.getAttribute("aria-hidden") !== "true" ||
      backdrop.tabIndex !== -1
    ) {
      throw new window.Error("Mask decorative layer leaked into the accessibility tree");
    }
  }
};
