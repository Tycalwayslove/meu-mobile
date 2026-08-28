# IndexList

完整 V2 契约、边界与验证证据见 [`IndexList.docs.mdx`](./IndexList.docs.mdx)。

用于按稳定索引分组展示长列表，并通过右侧索引快速定位内容。组件只管理自己的有界滚动视口，不监听或
接管页面滚动；调用方应通过 `style.height` 或外层布局提供明确高度。

## 契约

- `sections` 的 `key` 同时作为分组身份、索引按钮可访问名称和 `scrollTo` 目标，必须稳定且唯一。
- `title` 是主内容区标题，`brief` 是右侧短索引；未提供时分别回退为完整 key 与首字符。
- `sticky` 默认开启，只固定组件自身滚动视口中的分组标题。
- `onIndexChange` 区分 `index` 与 `scroll` 来源；重复激活同一分组不会重复通知。
- `ref.scrollTo(key, options)` 返回是否找到目标，可选择平滑滚动和把焦点移到索引按钮。
- 索引按钮使用 44×44px 原生 button、roving tab stop、上下方向键及 Home / End。

## 边界

Web 版本依赖 DOM `scrollTop`、`offsetTop` 与 sticky positioning。未来 uni-app 版本复用 sections、索引身份、
激活事件和 imperative scroll 契约，使用平台 scroll-view 与原生滚动定位重新实现。
