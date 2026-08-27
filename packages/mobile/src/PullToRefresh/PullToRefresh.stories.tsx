import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { PullToRefresh } from "./PullToRefresh";

function PullToRefreshPreview() {
  const [version, setVersion] = useState(1);
  return (
    <div style={{ height: 420, overflowY: "auto", border: "1px solid var(--meu-color-border)" }}>
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
  render: () => <PullToRefreshPreview />
} satisfies Meta<typeof PullToRefresh>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: null, onRefresh: () => undefined } };
