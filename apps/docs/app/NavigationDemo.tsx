"use client";

import { MeuIconCheck, MeuIconPlus, MeuIconSearch } from "@meu/icons-react";
import { Button, NavBar, PaginationDots, SegmentedControl, Steps, TabBar, Tabs } from "@meu/mobile";
import { useState } from "react";

const viewOptions = [
  { label: "列表", value: "list" },
  { label: "卡片", value: "card" }
] as const;

export function NavigationDemo() {
  const [message, setMessage] = useState("等待操作");
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [page, setPage] = useState(1);
  const [contentTab, setContentTab] = useState("overview");
  const [primarySection, setPrimarySection] = useState("home");

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
      <Tabs
        aria-label="订单内容"
        items={[
          { key: "overview", label: "概览", content: "订单经营概览" },
          { key: "orders", label: "订单", badge: 3, content: "待处理订单列表" },
          { key: "settings", label: "设置", content: "订单设置" }
        ]}
        value={contentTab}
        onChange={setContentTab}
      />
      <Steps
        current={1}
        items={[
          { title: "提交订单", description: "08:30" },
          { title: "商家发货", description: "处理中" },
          { title: "确认收货" }
        ]}
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
      <TabBar
        aria-label="示例主导航"
        value={primarySection}
        onChange={setPrimarySection}
        items={[
          { key: "home", label: "首页", icon: <MeuIconCheck size={22} />, href: "#home" },
          { key: "search", label: "发现", icon: <MeuIconSearch size={22} /> },
          { key: "create", label: "发布", icon: <MeuIconPlus size={22} /> }
        ]}
      />
    </div>
  );
}
