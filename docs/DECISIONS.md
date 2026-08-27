# 架构决策

## ADR-001：pnpm workspace 与 Turborepo

采用 pnpm 管理依赖和 workspace 协议，Turborepo只负责跨包任务拓扑与缓存。

## ADR-002：Rollup 构建组件库

组件包使用 Rollup 和 `@vanilla-extract/rollup-plugin`。Vite只用于 Storybook和 playground，
不承担 Vanilla Extract 库发布构建。

## ADR-003：新旧 token 并存迁移

新组件只使用 `--meu-*`。现有 H5 的 `--mm-*` 不全局映射到新品牌色，避免旧页面发生隐式换肤。

## ADR-004：跨框架只共享平台无关资产

未来 uni-app 实现共享 token、SVG、日期契约和组件语义，不共享 React DOM、Portal 和焦点实现。

## ADR-005：表单引擎与 UI 分层

基础控件保持无表单依赖；`form-react` 使用 React Hook Form 提供完整绑定，并通过 Standard Schema
兼容验证器，首发提供 Zod 适配。

## ADR-006：Web 锚定浮层使用 Floating UI

`mobile` 的 Popover 等 React DOM 锚定浮层使用 `@floating-ui/react` 处理定位、碰撞翻转、视口偏移、
Portal 与非模态焦点协作。Meu 保留公开 API、关闭原因、可访问性契约和视觉样式的所有权，不直接暴露
Floating UI 类型。未来 uni-app 只复用 placement、状态与语义契约，按目标平台重新实现定位和焦点能力。

## ADR-007：BottomSheet 自持轻量 snap 与拖拽引擎

BottomSheet 复用现有 Portal、Mask、滚动锁和焦点圈定，自持仅由拖拽手柄驱动的 transform snap 引擎。
不采用已停止维护且不支持 React 19 的 `react-spring-bottom-sheet`；不采用官方已声明不维护的 Vaul；
也不采用仍有 React StrictMode 动画问题、默认缺少可访问性且要求 Motion peer 的 `react-modal-sheet`。
Meu 公开数字比例与 `content` snap 语义、键盘等价路径和关闭原因，未来 uni-app 按平台重新实现手势层。
