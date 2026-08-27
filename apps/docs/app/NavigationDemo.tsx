"use client";

import { Button, NavBar, PaginationDots, SegmentedControl } from "@meu/mobile";
import { useState } from "react";

const viewOptions = [
  { label: "列表", value: "list" },
  { label: "卡片", value: "card" }
] as const;

export function NavigationDemo() {
  const [message, setMessage] = useState("等待操作");
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [page, setPage] = useState(1);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <NavBar
        title="订单中心"
        onBack={() => setMessage("已触发返回")}
        right={<Button variant="text">帮助</Button>}
      />
      <SegmentedControl
        aria-label="内容布局"
        block
        options={viewOptions}
        value={viewMode}
        onChange={setViewMode}
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Button
          variant="outline"
          tone="neutral"
          size="small"
          disabled={page === 0}
          onClick={() => setPage((current) => Math.max(0, current - 1))}
        >
          上一页
        </Button>
        <PaginationDots count={4} activeIndex={page} variant="line" />
        <Button
          variant="outline"
          tone="neutral"
          size="small"
          disabled={page === 3}
          onClick={() => setPage((current) => Math.min(3, current + 1))}
        >
          下一页
        </Button>
      </div>
      <output aria-live="polite">
        {message} / {viewMode === "list" ? "列表" : "卡片"}视图
      </output>
    </div>
  );
}
