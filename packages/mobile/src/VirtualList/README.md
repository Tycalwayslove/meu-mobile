# VirtualList

完整 V2 契约、边界与验证证据见 [`VirtualList.docs.mdx`](./VirtualList.docs.mdx)。

纵向长列表的窗口化基础组件。它只挂载可见区与 overscan 行，并在真实 DOM 挂载后校正动态高度；分页、选择、
请求、树结构与业务空状态继续由调用方持有。

```tsx
const listRef = useRef<VirtualListRef>(null);

<VirtualList
  ref={listRef}
  aria-label="订单"
  items={orders}
  height={480}
  estimateSize={(order) => (order.hasDescription ? 76 : 56)}
  getItemKey={(order) => order.id}
  renderItem={(order) => <OrderCell order={order} />}
/>;
```

## 契约

- 首版只支持组件自身的纵向滚动容器；不支持横向、网格、瀑布流或 window scroll。
- `height` 是确定的像素视口高度；`estimateSize`、`initialOffset` 与它共同生成稳定的 SSR 初始窗口。
- `getItemKey` 必须返回稳定身份。不要使用会随排序、插入而变化的数组下标。
- `overscan` 默认 3。`onRangeChange` 分别报告可见区与常规 overscan 边界，可用于预取，但不是分页事实源。
- 行挂载后自动测量真实高度；字体、主题密度或外部布局整体变化后可调用 `ref.measure()` 重新测量。
- 行内输入值、展开状态和异步结果必须保存在调用方状态中；虚拟窗口回收 DOM 后重新挂载仍以该状态恢复。
- 外层固定为带可访问名称的 `role="list"`；已挂载行通过 `aria-setsize` 与 `aria-posinset` 表达完整集合。
- 焦点位于某行后代时，该行会在滚出常规窗口后继续挂载，直至焦点离开列表。
- `scrollToIndex` 与 `scrollToOffset` 是平台中立的便捷入口。动态高度列表使用 smooth 时，最终位置可能在测量后校正。

React Web 内部使用 `@tanstack/react-virtual`，但其类型不进入 Meu 公共 API。Next.js 消费项目应将
`@tanstack/react-virtual` 与 `@tanstack/virtual-core` 加入 `transpilePackages`，确保 Chrome/WebView 70+
与 iOS 13 的语法基线。未来 uni-app 适配复用 items、key、估算、范围和定位契约，替换 Web 引擎。

本地验收覆盖 10,000 行有限 DOM、动态测量、远距跳转、焦点稳定 key、删除、可编辑行外置状态、SSR 与
直接 hydration；60 秒真机滚动、内存峰值和真实读屏留到统一发布候选阶段。
