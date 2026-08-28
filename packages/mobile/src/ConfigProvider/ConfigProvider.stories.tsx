import type { Meta, StoryObj } from "@storybook/react-vite";

import { ConfigProvider, useMeuConfig } from "./ConfigProvider";

function ConfigurationReadout() {
  const { locale, portalContainer, theme } = useMeuConfig();

  return (
    <dl
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: "8px 16px",
        margin: 0
      }}
    >
      <dt style={{ color: "var(--meu-color-muted)" }}>Locale</dt>
      <dd style={{ margin: 0 }}>{locale}</dd>
      <dt style={{ color: "var(--meu-color-muted)" }}>Theme</dt>
      <dd style={{ margin: 0 }}>{theme}</dd>
      <dt style={{ color: "var(--meu-color-muted)" }}>Portal</dt>
      <dd style={{ margin: 0 }}>{portalContainer ? "自定义容器" : "document.body"}</dd>
    </dl>
  );
}

const meta = {
  title: "Foundation/ConfigProvider",
  component: ConfigProvider,
  args: { children: null }
} satisfies Meta<typeof ConfigProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NestedConfiguration: Story = {
  render: () => (
    <ConfigProvider
      locale="en-US"
      theme="dark"
      style={{
        background: "var(--meu-color-surface)",
        border: "1px solid var(--meu-color-border)",
        borderRadius: "var(--meu-radius-surface)",
        color: "var(--meu-color-ink)",
        padding: 20
      }}
    >
      <p style={{ fontWeight: 700, margin: "0 0 16px" }}>嵌套配置作用域</p>
      <ConfigurationReadout />
    </ConfigProvider>
  )
};
