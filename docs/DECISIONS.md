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

## ADR-008：ActionMenu 使用模态 Dialog 语义和原生按钮

ActionMenu 是由明确用户意图触发的底部操作面板，组合 Popup 的 Portal、Mask、焦点圈定、滚动锁和安全区，
不复用 BottomSheet 的拖拽与 snap 引擎。容器使用 `role="dialog"`，各操作使用原生 button；不采用需要
方向键漫游焦点的桌面式 `menu/menuitem` 语义，也不承载选择、勾选和子菜单。危险操作始终移入独立分组并
通过 Dialog 二次确认，异步执行期间同时锁定动作与关闭入口。命令式 API 由 Provider 保留当前 React tree
的主题、语言和 Portal 上下文，未来 uni-app 复用动作顺序、分组、确认和关闭原因契约。

## ADR-009：Picker 使用原生滚动与 listbox 草稿模型

Picker 复用 Popup 的模态边界，每列使用单选 `listbox` 与 `aria-activedescendant`，并保留原生纵向滚动和
CSS scroll snap，不引入独立手势引擎。打开时从已提交值创建 draft；键盘、点按和滚动只更新 draft，确定
才提交，取消类关闭全部回滚。这样既保留移动 WebView 的原生滚动物理，也让键盘、读屏和表单 dirty 状态
拥有确定的等价路径。日期类组件后续只组合该选择模型与 `DateAdapter`，核心包不绑定具体日期库或时区。

## ADR-010：CascadePicker 是 Picker 的无视觉分叉数据适配层

CascadePicker 接收树形 options，并通过纯解析函数生成当前路径对应的 Picker columns、值和选项；Popup、
滚轮、listbox、键盘、焦点、滚动锁和 safe area 全部复用 Picker。父级变化时只保留变化列及其以前的值，
丢弃旧后缀后逐级选择新分支的首个可用项。`children: undefined` 表示叶子，显式 `children: []` 表示
存在但暂为空的下一级并阻止确认，使调用方可通过更新 options 完成异步加载而无需把 Promise 或请求状态
引入基础组件。动态数据归一化保持静默，不伪造用户选择事件；表单仍只在确认时写入完整路径。
