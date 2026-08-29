# Meu Mobile V2 支持矩阵

## 首发决定

V2 Web 首发支持 React 19 与 Next.js 16 App Router。组件包不依赖 Next.js 运行时，但 Next H5 是首要消费形态；当前隔离消费者、官网与真实 MeuMall H5 开发版本均处于这一代际。

React 18、Next.js 14–15、Pages Router 和直接运行于 uni-app 的能力不在 V2 首发支持范围。它们可能在部分场景工作，但在建立独立消费者、类型、SSR、hydration、浏览器和表单矩阵前，不作兼容承诺，也不允许只放宽 peerDependencies 来宣称支持。

## 版本范围

| 层级            | 支持范围             | 当前验证版本                      | 说明                                                                     |
| --------------- | -------------------- | --------------------------------- | ------------------------------------------------------------------------ |
| React           | `>=19.0.0 <20.0.0`   | 19.2.8                            | 所有 React 包的公共 peer 边界                                            |
| React DOM       | `>=19.0.0 <20.0.0`   | 19.2.8                            | Portal、flushSync 与 DOM refs 的运行时 peer                              |
| Next.js         | 16.x App Router      | 16.3.3                            | 官网与隔离 Next H5 production build、SSR、hydration、Chromium/WebKit E2E |
| React Hook Form | `>=7.55.0 <8.0.0`    | 7.86.0                            | 仅 `@meu/form-react` 需要                                                |
| Zod             | `>=4.0.0 <5.0.0`     | 4.4.3                             | 可选 schema 入口；也支持 Standard Schema 兼容验证器                      |
| Node.js         | `>=20.19.0`          | 由本地/CI记录                     | 仅构建、测试和 Next 工具链；浏览器组件运行时不依赖 Node                  |
| pnpm            | 10.19.0              | 10.19.0                           | 私有 monorepo 与 workspace 消费                                          |
| iOS Web         | Safari/WKWebView 15+ | 自动化 WebKit已通过；真机待签字   | iOS 13–14 为观察档                                                       |
| Android Web     | Chrome/WebView 89+   | 自动化 Chromium已通过；真机待签字 | Chromium/WebView 79–88 为观察档                                          |

`pnpm support:check` 会校验运行时包 peer、私有发布边界、官网和隔离消费者的精确验证版本，以及已安装 Next、React Hook Form 与 Zod 的兼容声明。该检查进入 `pnpm check`，版本变化必须连同本文件、消费者证据和相关组件留存文档一起提交。

## Next.js 消费配置

应用应在 App Router 根布局一次性引入 Token、Primitive 与 Mobile CSS，并将 Meu 包及虚拟列表依赖加入 `transpilePackages`：

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@meu/form-react",
    "@meu/icons-react",
    "@meu/mobile",
    "@meu/primitives-react",
    "@tanstack/react-virtual",
    "@tanstack/virtual-core"
  ]
};

export default nextConfig;
```

交互组件保留 `"use client"` 边界，可以从 App Router 页面组合，但不得在 Server Component 中调用 Hook、命令式 Provider API 或访问组件 ref。服务端错误映射等纯客户端表单帮助从 `@meu/form-react/server` 的明确入口导入；该入口名称表示业务错误载荷边界，不代表它可以在 React Server Component 中持有 RHF 实例。

## 扩展支持的准入条件

新增 React 或 Next 大版本/旧版本支持时，必须同时完成：

1. 新增独立 lockfile 或隔离消费者，不能复用当前 React 19 node_modules 得出结论。
2. 通过构建、类型、SSR、hydration、表单 reset/refs、Portal/focus trap 和双引擎 E2E。
3. 验证所有运行时依赖的 peer 范围，不能通过忽略 peer warning 安装。
4. 更新所有受影响组件的兼容性与限制章节、官网版本要求和迁移说明。
5. 只有证据全绿后才放宽 package peerDependencies。

## uni-app 边界

当前包是 React DOM 实现，不能直接用于 uni-app 原生渲染。未来适配层只复用 Token、SVG、日期与平台无关状态契约，Portal、DOM refs、焦点、滚动锁、Pointer Events 和 Web 动效必须按 uni-app 目标端重新实现。此边界与 [`../DECISIONS.md`](../DECISIONS.md) 的 ADR-004 一致。
