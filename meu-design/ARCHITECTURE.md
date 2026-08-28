# Meu Mobile：可维护性与落地架构

## Monorepo 结构

```text
packages/
  tokens/          # tokens.json -> CSS variables / TypeScript types / Figma export
  icons/           # 经优化的 SVG React components；禁止 emoji 图标
  primitives/      # Portal, FocusScope, Pressable, Overlay, VisuallyHidden
  mobile/          # 对外 React 组件与样式
  date-adapter/    # 仅定义接口与可选 adapter
  test-utils/      # renderWithMeu、a11y 与手势辅助
apps/
  docs/            # Storybook / 文档站
  playground/      # iOS Safari / Android Chrome 回归页
```

每个组件目录固定包含：`Component.tsx`、`Component.module.css`、`Component.test.tsx`、`Component.stories.tsx`、`types.ts`、`README.md`。组件间只能依赖 `tokens`、`icons`、`primitives` 和已公开的低层组件；禁止跨目录导入私有实现。

## Token 管理

`tokens.json` 是唯一可编辑源。构建脚本生成：

- `@meu/tokens/css`：`:root` 和 `[data-meu-theme="dark"]` 中的语义 CSS Variables；
- `@meu/tokens/js`：只读 TypeScript 常量与 token key 联合类型；
- `@meu/tokens/figma`：可导入 Figma Variables 的 JSON。

组件不得直接写 `#176B5B`、`16px` 或 `180ms`，必须引用 `var(--meu-color-accent)`、`var(--meu-space-4)` 等语义变量。组件级 token（例如 `--meu-button-height`）只能引用全局 token，不能新造色值。

## CSS 与主题

用 CSS Modules 或 Vanilla Extract 隔离组件样式；不发布全局 reset。根节点通过 `data-meu-theme="light|dark"` 切换主题，`system` 在 provider 中监听 `prefers-color-scheme`。应用方覆盖主题时只能在 provider 根上覆盖 `--meu-*`，不建议覆盖内部选择器。

```css
[data-meu-theme="light"] {
  --meu-color-accent: #176b5b;
  --meu-color-accent-contrast: #ffffff;
  --meu-control-medium: 44px;
}
```

支持样式分层：`@layer meu-reset, meu-base, meu-components, meu-utilities;`。公开的 `data-*` 属性是稳定的定制钩子；DOM class 名不是 API。

## 无障碍与平台策略

- 首选原生 `<button>`、`<input>`、`<dialog>`（经兼容层）和语义 HTML；只有原生语义不足时才加 ARIA。
- Overlay 统一走 `Portal` + `FocusScope` + scroll lock，避免每个组件各自处理焦点和 iOS 弹跳。
- 对触摸手势提供键盘与可点击替代路径；动画遵守 reduced motion。
- 支持最新两个主版本的 iOS Safari、Android Chrome 与桌面 Chrome/Safari/Firefox；不承诺已淘汰浏览器。

## 质量门禁

每个 PR 必须通过：

1. TypeScript strict 与 API Extractor（防止公共类型意外变化）。
2. 单元测试、交互测试和 `axe-core` 自动 a11y 测试。
3. light / dark、中文 / 英文、正常 / 200% 字体缩放的视觉回归截图。
4. 真机或云真机验证：至少 iOS Safari 与 Android Chrome；含安全区、软键盘、滚动和手势场景。
5. bundle-size 预算：P0 单组件 gzip 增量需有记录；高成本能力必须 lazy import。

## 版本与弃用

遵循 SemVer。token 删除、默认行为变化、公开 DOM 语义变化和 TypeScript 类型收窄均视为 breaking change。弃用至少经历一个 minor：控制台开发警告 + 文档替代路径 + codemod（可自动迁移时）。变更记录按组件维度书写，而不是只写技术内部术语。

## 文档模板

每个组件页固定有：何时使用 / 何时不要使用、最小示例、受控示例、所有变体、键盘与读屏行为、移动手势说明、API、主题 token、常见错误、迁移说明。示例内容使用真实中文业务语句，不用占位姓名或假数据。
