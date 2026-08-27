"use client";

import { InfiniteList } from "@meu/mobile";
import { useState } from "react";

export function InfiniteListDemo() {
  const [page, setPage] = useState(1);
  const itemCount = page * 4;

  return (
    <div style={{ height: 320, overflowY: "auto", border: "1px solid var(--meu-color-border)" }}>
      <div style={{ display: "grid", gap: 1, background: "var(--meu-color-border)" }}>
        {Array.from({ length: itemCount }, (_, index) => (
          <div key={index} style={{ padding: 16, background: "var(--meu-color-surface)" }}>
            分页订单 MEU-{String(index + 1).padStart(3, "0")}
          </div>
        ))}
      </div>
      <InfiniteList
        hasMore={page < 4}
        loadMore={async () => {
          await new Promise<void>((resolve) => window.setTimeout(resolve, 500));
          setPage((current) => current + 1);
        }}
      />
    </div>
  );
}
