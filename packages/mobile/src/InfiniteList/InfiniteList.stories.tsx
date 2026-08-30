import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { ConfigProvider } from "../ConfigProvider";
import { InfiniteList } from "./InfiniteList";
import { waitForStory } from "../storyTestUtils";

const longUnbrokenError =
  "加载失败：ORDER-CURSOR-2026-08-30-VERY-LONG-UNBROKEN-DIAGNOSTIC-REFERENCE-9F4C2A7B1E";
const longRetryLabel = "重试加载这一批暂时为空且标识特别长的订单结果";

function InfiniteListPreview() {
  const [page, setPage] = useState(1);
  const itemCount = page * 5;
  return (
    <div
      aria-label="分页商品列表"
      role="region"
      tabIndex={0}
      style={{ height: 420, overflowY: "auto", border: "1px solid var(--meu-color-border)" }}
    >
      <div style={{ display: "grid", gap: 1, background: "var(--meu-color-border)" }}>
        {Array.from({ length: itemCount }, (_, index) => (
          <div
            key={index}
            style={{ padding: 16, background: "var(--meu-color-surface)", minHeight: 52 }}
          >
            订单 MEU-2026-{String(index + 1).padStart(4, "0")}
          </div>
        ))}
      </div>
      <InfiniteList
        hasMore={page < 4}
        loadMore={async () => {
          await new Promise<void>((resolve) => window.setTimeout(resolve, 600));
          setPage((current) => current + 1);
        }}
      />
    </div>
  );
}

function ErrorRetryPreview() {
  const [attempt, setAttempt] = useState(0);
  return (
    <InfiniteList
      autoLoad={false}
      hasMore
      loadMore={() => {
        setAttempt((current) => current + 1);
        return attempt === 0
          ? Promise.reject(new Error("Story offline simulation"))
          : Promise.resolve();
      }}
      onLoadError={() => undefined}
    />
  );
}

function EmptyLongContentPreview() {
  return (
    <section
      aria-label="空订单分页示例"
      style={{ width: 260, border: "1px solid var(--meu-color-border)" }}
    >
      <p style={{ margin: 0, padding: 16, color: "var(--meu-color-muted)" }}>
        当前筛选条件下暂时没有订单，但服务端仍可能返回下一页。
      </p>
      <InfiniteList
        autoLoad={false}
        errorContent={longUnbrokenError}
        hasMore
        loadMore={() => Promise.reject(new Error("Empty page simulation"))}
        onLoadError={() => undefined}
        retryLabel={longRetryLabel}
      />
    </section>
  );
}

function RtlDarkReducedMotionPreview() {
  return (
    <ConfigProvider dir="rtl" locale="en-US" motion="reduced" theme="dark">
      <div
        style={{
          width: 320,
          minHeight: 180,
          padding: 16,
          color: "var(--meu-color-ink)",
          background: "var(--meu-color-surface)"
        }}
      >
        <InfiniteList
          autoLoad={false}
          hasMore
          loadMore={() => new Promise<void>(() => undefined)}
          loadingContent="Loading the next RTL page with reduced motion enabled…"
        />
      </div>
    </ConfigProvider>
  );
}

const meta = {
  title: "Collections/InfiniteList",
  component: InfiniteList,
  parameters: { layout: "padded" }
} satisfies Meta<typeof InfiniteList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { hasMore: true, loadMore: () => Promise.resolve() },
  render: () => <InfiniteListPreview />
};

export const Manual: Story = {
  args: { autoLoad: false, hasMore: true, loadMore: () => Promise.resolve() }
};

export const Complete: Story = {
  args: { hasMore: false, loadMore: () => Promise.resolve() }
};

export const ErrorAndRetry: Story = {
  args: { hasMore: true, loadMore: () => Promise.resolve() },
  render: () => <ErrorRetryPreview />,
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>('[data-meu-component="infinite-list"]');
    const loadMore = canvasElement.querySelector<HTMLButtonElement>("button");
    if (!root || !loadMore || loadMore.textContent !== "加载更多") {
      throw new window.Error("Expected InfiniteList manual load action");
    }

    loadMore.focus();
    loadMore.click();
    await waitForStory(
      () => root.getAttribute("data-status") === "error",
      "InfiniteList did not expose its load error"
    );
    const retry = canvasElement.querySelector<HTMLButtonElement>("button");
    if (!retry || retry.textContent !== "重试") {
      throw new window.Error("InfiniteList did not expose its retry action");
    }
    await waitForStory(
      () => document.activeElement === retry,
      "InfiniteList did not restore focus to retry"
    );

    retry.click();
    await waitForStory(
      () => root.getAttribute("data-status") === "idle",
      "InfiniteList retry did not recover"
    );
    const recoveredAction = canvasElement.querySelector<HTMLButtonElement>("button");
    if (!recoveredAction || recoveredAction.textContent !== "加载更多") {
      throw new window.Error("InfiniteList did not return to its loadable state");
    }
    await waitForStory(
      () => document.activeElement === recoveredAction,
      "InfiniteList did not restore focus after retry"
    );
    const liveStatus = canvasElement.querySelector<HTMLElement>('[role="status"]');
    if (!liveStatus || liveStatus.textContent !== "已加载更多内容") {
      throw new window.Error("InfiniteList did not announce the successful append");
    }
  }
};

export const EmptyListAndLongContent: Story = {
  args: { hasMore: true, loadMore: () => Promise.resolve() },
  render: () => <EmptyLongContentPreview />,
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>('[data-meu-component="infinite-list"]');
    const loadMore = canvasElement.querySelector<HTMLButtonElement>("button");
    if (!root || !loadMore) throw new window.Error("Expected the empty-list pagination action");
    loadMore.click();
    await waitForStory(
      () => root.getAttribute("data-status") === "error",
      "InfiniteList did not render the long empty-list error"
    );
    if (!root.textContent || !root.textContent.includes(longUnbrokenError)) {
      throw new window.Error("InfiniteList clipped or omitted the long error content");
    }
    const retry = canvasElement.querySelector<HTMLButtonElement>("button");
    if (!retry || retry.textContent !== longRetryLabel) {
      throw new window.Error("InfiniteList omitted the long retry action label");
    }
  }
};

export const RtlDarkReducedMotion: Story = {
  args: { hasMore: true, loadMore: () => Promise.resolve() },
  render: () => <RtlDarkReducedMotionPreview />,
  play: async ({ canvasElement }) => {
    const boundary = canvasElement.querySelector<HTMLElement>(
      '[data-meu-component="config-provider"]'
    );
    const root = canvasElement.querySelector<HTMLElement>('[data-meu-component="infinite-list"]');
    const loadMore = canvasElement.querySelector<HTMLButtonElement>("button");
    if (!boundary || !root || !loadMore) {
      throw new window.Error("Expected the configured InfiniteList preview");
    }
    loadMore.click();
    await waitForStory(
      () => root.getAttribute("data-status") === "loading",
      "InfiniteList did not enter the reduced-motion loading state"
    );
    if (
      boundary.getAttribute("dir") !== "rtl" ||
      boundary.getAttribute("data-meu-theme") !== "dark" ||
      boundary.getAttribute("data-meu-motion") !== "reduced"
    ) {
      throw new window.Error("InfiniteList did not inherit RTL, dark, and reduced-motion context");
    }
  }
};
