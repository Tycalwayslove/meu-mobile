# IndexList

完整 V2 契约、边界与验证证据见 [`IndexList.docs.mdx`](./IndexList.docs.mdx)。

用于按稳定索引分组展示长列表，并通过右侧索引快速定位内容。组件只管理自己的有界滚动视口，不监听或
接管页面滚动；调用方应通过 `style.height` 或外层布局提供明确高度。

## 契约

- `sections` 的 `key` 同时作为分组身份、稳定 DOM 关联和 `scrollTo` 目标；重复时只保留首项。
- `title` 是主内容区标题，`brief` 是右侧短索引；未提供时分别回退为完整 key 与首字符。
- `sticky` 默认开启，只固定组件自身滚动视口中的分组标题。
- `activeKey` / `defaultActiveKey` 提供受控与非受控 active；无效值回退到首个现存分组。
- `onIndexChange` 区分 `index`、`scroll` 与 `imperative` 来源；受控调用方可接受或拒绝请求。
- `ref.scrollTo(key, options)` 返回是否找到目标，可选择平滑滚动和把焦点移到索引按钮；低动态偏好会将平滑滚动降级为即时滚动。
- 索引按钮使用 44×44px 原生 button、roving tab stop、上下方向键及 Home / End。
- Pointer capture 不可用时临时监听 window；iOS 13.0–13.3 使用 Touch Events 滑动后备，cancel/unmount 均清理。

## 边界

Web 版本依赖 DOM `scrollTop`、`offsetTop` 与 sticky positioning。未来 uni-app 版本复用 sections、索引身份、
激活事件和 imperative scroll 契约，使用平台 scroll-view 与原生滚动定位重新实现。
