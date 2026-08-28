import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { InfiniteList } from "./InfiniteList";

function InfiniteListPreview() {
  const [page, setPage] = useState(1);
  const itemCount = page * 5;
  return (
    <div style={{ height: 420, overflowY: "auto", border: "1px solid var(--meu-color-border)" }}>
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

const meta = {
  title: "Collections/InfiniteList",
  component: InfiniteList,
  parameters: { layout: "padded" },
  render: () => <InfiniteListPreview />
} satisfies Meta<typeof InfiniteList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { hasMore: true, loadMore: () => Promise.resolve() } };

export const Manual: Story = {
  args: { autoLoad: false, hasMore: true, loadMore: () => Promise.resolve() }
};

export const Complete: Story = {
  args: { hasMore: false, loadMore: () => Promise.resolve() }
};

export const ErrorAndRetry: Story = {
  args: { hasMore: true, loadMore: () => Promise.resolve() },
  render: () => <ErrorRetryPreview />
};
