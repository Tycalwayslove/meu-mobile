"use client";

import { Cell, IndexList, List, SideNav } from "@meu/mobile";
import { useState } from "react";

const indexedRoutes = [
  {
    key: "A",
    content: (
      <List divider="full">
        <Cell title="安静早晨路线" description="2.8 km" />
        <Cell title="奥体中心路线" description="4.1 km" />
      </List>
    )
  },
  {
    key: "B",
    content: (
      <List divider="full">
        <Cell title="滨江夜跑路线" description="5.0 km" />
        <Cell title="北山散步路线" description="3.4 km" />
      </List>
    )
  },
  {
    key: "C",
    content: (
      <List divider="full">
        <Cell title="城市绿道路线" description="6.2 km" />
        <Cell title="茶园轻徒步" description="7.5 km" />
      </List>
    )
  }
] as const;

const sideItems = [
  { key: "featured", label: "精选", content: "精选活动与限时推荐" },
  { key: "food", label: "食品", badge: 3, content: "食品与饮品分类" },
  { key: "home", label: "家居", content: "家居与生活分类" },
  { key: "service", label: "服务", content: "服务分类", disabled: true }
] as const;

export function IndexedNavigationDemo({ focus }: { focus?: "index-list" | "side-nav" } = {}) {
  const [sideKey, setSideKey] = useState("featured");
  const [indexKey, setIndexKey] = useState("A");

  const indexList = (
    <>
      <IndexList
        aria-label="路线索引列表"
        sections={indexedRoutes}
        style={{ height: 360 }}
        onIndexChange={setIndexKey}
      />
      <output aria-live="polite">当前索引：{indexKey}</output>
    </>
  );
  const sideNav = (
    <>
      <SideNav aria-label="商品侧边分类" items={sideItems} value={sideKey} onChange={setSideKey} />
      <output aria-live="polite">当前分类：{sideKey}</output>
    </>
  );

  if (focus === "index-list") return <div style={{ display: "grid", gap: 16 }}>{indexList}</div>;
  if (focus === "side-nav") return <div style={{ display: "grid", gap: 16 }}>{sideNav}</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {indexList}
      {sideNav}
    </div>
  );
}
