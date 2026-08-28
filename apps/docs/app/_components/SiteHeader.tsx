"use client";

import { MeuIconSearch } from "@meu/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeSelect } from "./SiteProviders";

const navItems = [
  { href: "/components", label: "组件" },
  { href: "/getting-started", label: "开始使用" },
  { href: "/foundations", label: "设计基础" },
  { href: "/lab", label: "实验室" }
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href="/" aria-label="Meu Mobile 首页">
          <span className="brand__mark" aria-hidden="true">
            M
          </span>
          <span className="brand__name">Meu Mobile</span>
          <span className="brand__version">0.1</span>
        </Link>
        <nav className="top-nav" aria-label="主导航">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link href={item.href} aria-current={active ? "page" : undefined} key={item.href}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="site-tools">
          <Link className="search-link" href="/components#catalog" aria-label="搜索组件">
            <MeuIconSearch size={16} aria-hidden="true" />
            <span>搜索</span>
            <kbd>/</kbd>
          </Link>
          <ThemeSelect />
          <a
            className="github-link"
            href="https://github.com/Tycalwayslove/meu-mobile"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
