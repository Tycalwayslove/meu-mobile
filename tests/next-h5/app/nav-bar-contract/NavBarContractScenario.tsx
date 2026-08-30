"use client";

import { NavBar } from "@meu/mobile";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NavBarContractScenario() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  return (
    <main className="integration-shell nav-bar-contract-shell">
      <header className="integration-header">
        <p className="integration-eyebrow">Meu Mobile / Next Router Boundary</p>
        <h1>NavBar router contract</h1>
        <p>页面壳拥有滚动状态与路由，NavBar 保留原生链接、sticky 和安全区语义。</p>
      </header>

      <section aria-label="Next Router adapter" className="nav-bar-contract-card">
        <div
          aria-label="NavBar nested scroll container"
          className="nav-bar-contract-scroller"
          onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 0)}
          role="region"
        >
          <NavBar
            aria-label="订单详情页头"
            backHref="/nav-bar-contract/list"
            bordered={false}
            onBack={(event) => {
              event.preventDefault();
              router.push("/nav-bar-contract/list");
            }}
            position="sticky"
            safeArea
            scrolled={scrolled}
            title={<h2>订单详情</h2>}
          />
          <div className="nav-bar-contract-content">
            <p>订单号 MEU-20260830</p>
            {Array.from({ length: 12 }, (_, index) => (
              <p key={index}>订单内容段落 {index + 1}</p>
            ))}
          </div>
        </div>
        <output aria-live="polite">{scrolled ? "页面已滚动" : "页面位于顶部"}</output>
      </section>

      <section aria-label="Unavailable back states" className="nav-bar-contract-card">
        <NavBar
          aria-label="不可用返回页头"
          backDisabled
          backHref="/nav-bar-contract/list"
          title="不可用返回"
        />
        <NavBar
          aria-label="加载返回页头"
          backHref="/nav-bar-contract/list"
          backLoading
          title="正在返回"
        />
      </section>
    </main>
  );
}
