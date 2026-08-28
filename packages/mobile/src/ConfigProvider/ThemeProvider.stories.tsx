import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemeProvider } from "./index";

function ThemeCard({ label, theme }: { label: string; theme: "dark" | "light" }) {
  return (
    <ThemeProvider
      theme={theme}
      style={{
        background: "var(--meu-color-surface)",
        border: "1px solid var(--meu-color-border)",
        borderRadius: "var(--meu-radius-surface)",
        color: "var(--meu-color-ink)",
        padding: 20
      }}
    >
      <strong>{label}</strong>
      <p style={{ color: "var(--meu-color-muted)", margin: "8px 0 0" }}>
        文字、背景与边框均读取语义 Token。
      </p>
    </ThemeProvider>
  );
}

const meta = {
  title: "Foundation/ThemeProvider",
  component: ThemeProvider,
  args: { children: null }
} satisfies Meta<typeof ThemeProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LightAndDark: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      <ThemeCard label="Light theme" theme="light" />
      <ThemeCard label="Dark theme" theme="dark" />
    </div>
  )
};
