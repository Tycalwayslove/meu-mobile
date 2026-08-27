"use client";

import { PullToRefresh } from "@meu/mobile";
import { useState } from "react";

export function PullToRefreshDemo() {
  const [version, setVersion] = useState(1);

  return (
    <div style={{ height: 320, overflowY: "auto", border: "1px solid var(--meu-color-border)" }}>
      <PullToRefresh
        actionLabel="刷新示例订单"
        canPull={() => true}
        onRefresh={async () => {
          await new Promise<void>((resolve) => window.setTimeout(resolve, 500));
          setVersion((current) => current + 1);
        }}
      >
        <div style={{ display: "grid", gap: 12, padding: 16 }}>
          <strong>最近订单 · 第 {version} 版</strong>
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              style={{ padding: 16, background: "var(--meu-color-subtle)", borderRadius: 12 }}
            >
              订单 MEU-{version}-{index + 1}
            </div>
          ))}
        </div>
      </PullToRefresh>
    </div>
  );
}
