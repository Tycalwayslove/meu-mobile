import {
  MeuIconCheck,
  MeuIconChevronLeft,
  MeuIconPlus,
  MeuIconSearch,
  MeuIconX
} from "@meu/icons-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

const icons = [
  ["ChevronLeft", MeuIconChevronLeft],
  ["Check", MeuIconCheck],
  ["Plus", MeuIconPlus],
  ["Search", MeuIconSearch],
  ["X", MeuIconX]
] as const;

const meta = {
  title: "Foundation/Icon",
  component: MeuIconCheck,
  args: { size: 24 }
} satisfies Meta<typeof MeuIconCheck>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Catalog: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
      {icons.map(([name, Icon]) => (
        <div
          key={name}
          style={{
            alignItems: "center",
            background: "var(--meu-color-surface)",
            border: "1px solid var(--meu-color-border)",
            borderRadius: "var(--meu-radius-surface)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: 16
          }}
        >
          <Icon aria-hidden size={28} />
          <span style={{ color: "var(--meu-color-muted)", fontSize: 12 }}>{name}</span>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const renderedIcons = canvasElement.querySelectorAll<SVGSVGElement>("svg");
    await Promise.resolve();
    if (renderedIcons.length !== icons.length) {
      throw new window.Error("Expected every catalog icon to render");
    }
    if (
      Array.from(renderedIcons).some(
        (icon) =>
          icon.getAttribute("aria-hidden") !== "true" || icon.getAttribute("focusable") !== "false"
      )
    ) {
      throw new window.Error("Expected catalog icons to remain decorative and unfocusable");
    }
  }
};

export const SemanticIcon: Story = {
  args: { size: 32, title: "操作成功" }
};
