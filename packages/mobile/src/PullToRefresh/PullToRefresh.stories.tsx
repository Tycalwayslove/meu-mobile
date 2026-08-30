import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import { ConfigProvider } from "../ConfigProvider";
import { waitForStory } from "../storyTestUtils";
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

function ErrorRetryPreview() {
  const attemptRef = useRef(0);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(1);
  return (
    <div>
      <PullToRefresh
        actionLabel="刷新库存"
        completeDelay={10_000}
        onRefresh={() => {
          attemptRef.current += 1;
          if (attemptRef.current === 1) {
            return Promise.reject(new window.Error("Network unavailable"));
          }
          setError("");
          setVersion((current) => current + 1);
          return Promise.resolve();
        }}
        onRefreshError={() => setError("刷新失败，请重试")}
      >
        <p>库存版本 {version}</p>
      </PullToRefresh>
      {error ? <p role="alert">{error}</p> : null}
      <output hidden data-refresh-version>
        {version}
      </output>
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

export const ErrorAndRetry: Story = {
  render: () => <ErrorRetryPreview />,
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>('[data-meu-component="pull-to-refresh"]');
    const button = canvasElement.querySelector<HTMLButtonElement>("button");
    if (!root || !button) throw new window.Error("Expected retryable PullToRefresh controls");

    button.click();
    await waitForStory(() => {
      const alert = canvasElement.querySelector('[role="alert"]');
      return (
        root.getAttribute("data-status") === "idle" &&
        Boolean(alert && alert.textContent === "刷新失败，请重试")
      );
    }, "PullToRefresh did not expose a retryable failure");
    button.click();
    await waitForStory(() => {
      const output = canvasElement.querySelector("[data-refresh-version]");
      return (
        root.getAttribute("data-status") === "complete" &&
        Boolean(output && output.textContent === "2")
      );
    }, "PullToRefresh retry did not complete");
  }
};

export const LongLocalizedRtl: Story = {
  render: () => (
    <ConfigProvider dir="rtl" locale="en-US" motion="reduced">
      <PullToRefresh
        actionLabel="Refresh the complete international order history"
        renderIndicator={(status) => `International order history refresh status: ${status}`}
        onRefresh={() => new Promise<void>(() => undefined)}
      >
        <div style={{ minWidth: 0, padding: 16 }}>
          A long localized order row that must remain inside the mobile viewport.
        </div>
      </PullToRefresh>
    </ConfigProvider>
  ),
  play: ({ canvasElement }) => {
    const provider = canvasElement.querySelector<HTMLElement>(
      '[data-meu-component="config-provider"]'
    );
    const root = canvasElement.querySelector<HTMLElement>('[data-meu-component="pull-to-refresh"]');
    const button = canvasElement.querySelector<HTMLButtonElement>("button");
    if (!provider || !root || !button) {
      throw new window.Error("Expected localized PullToRefresh controls");
    }
    button.focus();
    if (provider.getAttribute("dir") !== "rtl" || provider.dataset.meuMotion !== "reduced") {
      throw new window.Error("PullToRefresh did not preserve RTL or reduced motion");
    }
    if (root.scrollWidth > root.clientWidth + 1) {
      throw new window.Error("Localized PullToRefresh overflowed horizontally");
    }
    if (button.getBoundingClientRect().height < 44) {
      throw new window.Error("PullToRefresh keyboard action is below 44px");
    }
  }
};
