# Meu Mobile

面向移动 Web / PWA 的 React 组件库蓝图。它借鉴 Ant Design Mobile 的**组件覆盖范围与移动端交互边界**，但采用独立的品牌、token、组件命名和视觉语言；不是 Ant Design Mobile 的复刻或源码替代品。

## 交付内容

- `DESIGN.md`：可交给 Stitch 生成一致界面的设计规则。
- `tokens.json`：平台无关的设计 token 单一事实源，可转换为 CSS Variables、TypeScript 与 Figma Variables。
- `COMPONENTS.md`：组件目录、优先级和核心组件契约。
- `ARCHITECTURE.md`：包结构、主题、无障碍、质量门禁与发布规则。

## 推荐技术基线

`React 19` + `TypeScript` + CSS Variables + CSS Modules（或 Vanilla Extract）+ `@floating-ui/react` + `react-aria`。手势仅在确有收益时引入 `@use-gesture/react`；日期能力使用轻量、可替换的 adapter，不把某个日期库写死在公共 API 中。

## 实施顺序

1. 先把 `tokens.json` 转为 `@meu/tokens` 的 CSS Variables 与 TS 类型。
2. 交付 Foundation、Button、Icon、Space、SafeArea、Mask、Toast、Dialog、Popup。
3. 交付 Form、Input、List、Cell、Picker、Tabs、TabBar，再完成可访问性与手势测试。
4. 最后增加 Calendar、Uploader、VirtualList 等高复杂度组件；每个新组件都要先通过本仓库的 API 与 a11y 评审。

## 命名约定

- npm 包：`@meu/mobile`
- React 导出：`Button`、`BottomSheet`、`Field`；不使用 `Adm` 前缀。
- CSS Variables：`--meu-*`
- 组件样式 Hook：`data-meu-component`、`data-size`、`data-tone`、`data-state`。

## 设计目标

日常任务型产品，密度 7/10、视觉变化 2/10、动效 4/10：界面安静、信息清楚、触控可靠。所有交互最小命中区为 44 × 44 px，默认支持深色模式、简体中文和键盘/读屏。
