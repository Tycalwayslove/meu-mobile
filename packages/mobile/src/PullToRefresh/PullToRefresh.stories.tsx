import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { PullToRefresh } from "./PullToRefresh";

function PullToRefreshPreview() {
  const [version, setVersion] = useState(1);
  return (
    <div
      aria-label="下拉刷新商品列表"
      role="region"
      tabIndex={0}
      style={{ height: 420, overflowY: "auto", border: "1px solid var(--meu-color-border)" }}
    >
      <PullToRefresh
        actionLabel="刷新订单列表"
        canPull={() => true}
        onRefresh={async () => {
          await new Promise<void>((resolve) => window.setTimeout(resolve, 700));
          setVersion((current) => current + 1);
        }}
      >
        <div style={{ display: "grid", gap: 12, padding: 16 }}>
          <strong>订单列表 · 第 {version} 版</strong>
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              style={{ padding: 16, background: "var(--meu-color-subtle)", borderRadius: 12 }}
            >
              MEU-2026-{String(index + 1).padStart(4, "0")}
            </div>
          ))}
        </div>
      </PullToRefresh>
    </div>
  );
}

const meta = {
  title: "Gesture/PullToRefresh",
  component: PullToRefresh,
  parameters: { layout: "padded" },
  args: { children: null, onRefresh: () => undefined }
} satisfies Meta<typeof PullToRefresh>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <PullToRefreshPreview />,
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>('[data-meu-component="pull-to-refresh"]');
    const button = canvasElement.querySelector<HTMLButtonElement>("button");
    if (!root || !button) throw new window.Error("Expected PullToRefresh controls");
    button.click();
    await Promise.resolve();
    if (!["refreshing", "complete"].includes(root.getAttribute("data-status") || "")) {
      throw new window.Error("PullToRefresh did not start from its native button");
    }
  }
};

export const Disabled: Story = {
  args: {
    children: <p style={{ padding: 16 }}>离线内容</p>,
    disabled: true,
    onRefresh: () => undefined
  }
};

export const CustomIndicator: Story = {
  args: {
    children: <p style={{ padding: 16 }}>库存列表</p>,
    onRefresh: () => undefined,
    renderIndicator: (status) => `库存状态：${status}`
  }
};
