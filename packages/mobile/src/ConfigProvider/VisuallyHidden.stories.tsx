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
  ),
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector<HTMLButtonElement>("button");
    const icon = button ? button.querySelector("svg") : null;
    const hiddenName = button ? button.querySelector("span") : null;
    await Promise.resolve();
    if (!button || !icon || !hiddenName) {
      throw new window.Error("Expected the accessible icon button structure");
    }
    if (
      icon.getAttribute("aria-hidden") !== "true" ||
      hiddenName.textContent !== "搜索订单" ||
      hiddenName.hasAttribute("aria-hidden") ||
      hiddenName.hasAttribute("hidden")
    ) {
      throw new window.Error("Expected VisuallyHidden to provide the button name");
    }
    button.focus();
    if (document.activeElement !== button) {
      throw new window.Error("Expected only the button to receive focus");
    }
  }
};
