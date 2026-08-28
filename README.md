# Meu Mobile

Meu Mobile 是面向移动 Web、PWA 与 Hybrid WebView 的 React 组件库。设计契约来自相邻的
`meu-design`，目标消费者包含 MeuMall Next.js H5；当前开发只在仓库内的隔离消费者验证，不接入业务工程。

## 工程基线

- pnpm workspace + Turborepo
- React 19 + TypeScript 5.9
- Rollup + Vanilla Extract
- Vitest + Testing Library
- Storybook + Next.js 独立文档站
- Chrome/WebView 70+、iOS Safari 13+

## 常用命令

```bash
pnpm install
pnpm e2e:install
pnpm tokens:sync
pnpm check
pnpm test:e2e
pnpm storybook
pnpm docs
pnpm playground
pnpm integration
```

当前所有包都设置为 `private`，不会发布到 npm。跨仓库接入先使用 `pnpm pack` 产物验证，
避免把本地软链接环境误当成真实发布结果。

`tests/next-h5` 是隔离的 Next.js 消费者。它不依赖任何业务仓库，通过 Chromium 与 WebKit 验证
SSR/hydration、主题、表单绑定、移动布局和触控目标。

## 事实源

- 设计规则：`meu-design/DESIGN.md`
- 组件契约：`meu-design/COMPONENTS.md`
- Token：`meu-design/tokens.json`
- 代码实现：本仓库 `packages/`
- Figma：设计交付镜像，不作为独立 token 写入源

当前设计文件：[Meu Mobile Design System](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v)。同步与治理规则见
[`docs/FIGMA_SYNC.md`](docs/FIGMA_SYNC.md)。

组件按“通用与布局 → 信息录入 → 展示与导航 → 反馈与浮层 → 选择器 → 手势与高成本组件”分批交付，
详见 [`docs/COMPONENT_ROADMAP.md`](docs/COMPONENT_ROADMAP.md)。
