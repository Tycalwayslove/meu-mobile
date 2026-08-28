import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { ConfigProvider, useMeuConfig } from "./ConfigProvider";

function ConfigurationReadout() {
  const { dir, locale, motion, portalContainer, theme } = useMeuConfig();

  return (
    <dl
      style={{
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr)",
        gap: "8px 16px",
        margin: 0
      }}
    >
      <dt style={{ color: "var(--meu-color-muted)" }}>Locale</dt>
      <dd style={{ margin: 0 }}>{locale}</dd>
      <dt style={{ color: "var(--meu-color-muted)" }}>Direction</dt>
      <dd style={{ margin: 0 }}>{dir}</dd>
      <dt style={{ color: "var(--meu-color-muted)" }}>Theme</dt>
      <dd style={{ margin: 0 }}>{theme}</dd>
      <dt style={{ color: "var(--meu-color-muted)" }}>Motion</dt>
      <dd style={{ margin: 0 }}>{motion}</dd>
      <dt style={{ color: "var(--meu-color-muted)" }}>Portal</dt>
      <dd style={{ margin: 0 }}>
        {portalContainer === null
          ? "原地渲染"
          : portalContainer === undefined
            ? "document.body"
            : "自定义容器"}
      </dd>
    </dl>
  );
}

const panelStyle = {
  background: "var(--meu-color-surface)",
  border: "1px solid var(--meu-color-border)",
  borderRadius: "var(--meu-radius-surface)",
  color: "var(--meu-color-ink)",
  padding: 20
} as const;

function PortalConfigurationDemo() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <ConfigProvider portalContainer={container} style={panelStyle}>
      <ConfigurationReadout />
      <div
        ref={setContainer}
        aria-label="Overlay portal target"
        style={{
          border: "1px dashed var(--meu-color-border)",
          borderRadius: "var(--meu-radius-control)",
          marginBlockStart: 16,
          minHeight: 48,
          padding: 12
        }}
      >
        Portal target
      </div>
    </ConfigProvider>
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
    <ConfigProvider dir="rtl" locale="en-US" motion="reduced" theme="dark" style={panelStyle}>
      <p style={{ fontWeight: 700, margin: "0 0 16px" }}>Outer scope</p>
      <ConfigurationReadout />
      <ConfigProvider
        locale="zh-CN"
        style={{
          ...panelStyle,
          marginBlockStart: 16
        }}
      >
        <p style={{ fontWeight: 700, margin: "0 0 16px" }}>Nested locale override</p>
        <ConfigurationReadout />
      </ConfigProvider>
    </ConfigProvider>
  )
};

export const LtrSystemDefaults: Story = {
  render: () => (
    <ConfigProvider style={panelStyle}>
      <ConfigurationReadout />
    </ConfigProvider>
  )
};

export const InlinePortalPolicy: Story = {
  render: () => (
    <ConfigProvider portalContainer={null} style={panelStyle}>
      <ConfigurationReadout />
    </ConfigProvider>
  )
};

export const CustomPortalTarget: Story = {
  render: () => <PortalConfigurationDemo />
};
