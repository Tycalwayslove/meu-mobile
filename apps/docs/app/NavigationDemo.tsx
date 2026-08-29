"use client";

import { MeuIconCheck, MeuIconPlus, MeuIconSearch } from "@meu/icons-react";
import { Button, NavBar, PaginationDots, SegmentedControl, Steps, TabBar, Tabs } from "@meu/mobile";
import { useState } from "react";

const viewOptions = [
  { label: "列表", value: "list" },
  { label: "卡片", value: "card" }
] as const;

type NavigationDemoProps = {
  focus?: "nav-bar" | "pagination-dots" | "segmented-control" | "steps" | "tab-bar" | "tabs";
};

export function NavigationDemo({ focus }: NavigationDemoProps = {}) {
  const [message, setMessage] = useState("等待操作");
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [page, setPage] = useState(1);
  const [progressStep, setProgressStep] = useState(1);
  const [contentTab, setContentTab] = useState("overview");
  const [primarySection, setPrimarySection] = useState("home");

  const navBar = (
    <>
      <NavBar
        title="订单中心"
        onBack={() => setMessage("已触发返回")}
        right={<Button variant="text">帮助</Button>}
      />
      <output aria-live="polite">{message}</output>
    </>
  );
  const segmentedControl = (
    <>
      <SegmentedControl
        aria-label="内容布局"
        block
        options={viewOptions}
        value={viewMode}
        onChange={setViewMode}
      />
      <output aria-live="polite">当前为{viewMode === "list" ? "列表" : "卡片"}视图</output>
    </>
  );
  const tabs = (
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
  );
  const steps = (
    <div style={{ display: "grid", gap: 8 }}>
      <Steps
        aria-label="订单履约进度"
        current={progressStep}
        items={[
          { key: "submit", title: "提交订单", description: "08:30" },
          { key: "ship", title: "商家发货", description: "处理中" },
          { key: "receive", title: "确认收货" }
        ]}
        onChange={setProgressStep}
      />
      <output aria-live="polite">当前第 {progressStep + 1} 步</output>
    </div>
  );
  const pagination = (
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
  );
  const tabBar = (
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
  );

  const focused =
    focus === "nav-bar"
      ? navBar
      : focus === "segmented-control"
        ? segmentedControl
        : focus === "tabs"
          ? tabs
          : focus === "steps"
            ? steps
            : focus === "pagination-dots"
              ? pagination
              : focus === "tab-bar"
                ? tabBar
                : null;
  if (focused) return <div style={{ display: "grid", gap: 16 }}>{focused}</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {navBar}
      {segmentedControl}
      {tabs}
      {steps}
      {pagination}
      <output aria-live="polite">
        {message} / {viewMode === "list" ? "列表" : "卡片"}视图
      </output>
      {tabBar}
    </div>
  );
}
