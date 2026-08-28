import type { Meta, StoryObj } from "@storybook/react-vite";

import { SafeArea } from "./SafeArea";

const meta = {
  title: "Layout/SafeArea",
  component: SafeArea,
  tags: ["autodocs"],
  parameters: { layout: "centered" }
} satisfies Meta<typeof SafeArea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Bottom: Story = {
  render: () => (
    <div style={{ background: "var(--meu-color-subtle)", width: 390 }}>
      <div style={{ padding: 16 }}>页面底部内容</div>
      <SafeArea fallback={24} />
    </div>
  ),
  play: ({ canvasElement }) => {
    const safeArea = canvasElement.querySelector<HTMLElement>('[data-meu-component="safe-area"]');
    if (!safeArea) throw new window.Error("Expected SafeArea spacer");
    if (
      safeArea.getAttribute("aria-hidden") !== "true" ||
      safeArea.getAttribute("data-position") !== "bottom" ||
      safeArea.style.getPropertyValue("--meu-safe-area-fallback") !== "24px"
    ) {
      throw new window.Error("SafeArea did not expose its hidden bottom inset contract");
    }
  }
};
export const Top: Story = {
  render: () => (
    <div style={{ background: "var(--meu-color-subtle)", width: 390 }}>
      <SafeArea fallback={24} position="top" />
      <div style={{ padding: 16 }}>页面顶部内容</div>
    </div>
  )
};

export const LandscapeEdges: Story = {
  render: () => (
    <div
      style={{
        background: "var(--meu-color-subtle)",
        display: "flex",
        height: 220,
        width: 480
      }}
    >
      <SafeArea fallback={24} position="left" />
      <div style={{ alignSelf: "center", flex: 1, textAlign: "center" }}>横屏内容安全区域</div>
      <SafeArea fallback={24} position="right" />
    </div>
  )
};
