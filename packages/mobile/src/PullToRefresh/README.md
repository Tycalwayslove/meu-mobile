# PullToRefresh

为现有页面或滚动容器增加下拉刷新状态，不创建新的滚动容器，也不绑定请求库。

```tsx
<PullToRefresh onRefresh={reloadOrders}>
  <OrderList />
</PullToRefresh>
```

- 默认检测最近可滚动祖先是否位于顶部；复杂宿主可通过平台中立的 `canPull()` 覆盖边界判断。
- 状态依次为 `idle / pulling / ready / refreshing / complete`。只有越过 `threshold` 后松手才调用一次 `onRefresh`。
- `onRefresh` 可以同步返回或返回 Promise；Promise 完成后展示 complete，拒绝时调用 `onRefreshError` 并复位。
- `resistance` 控制手指距离到视觉距离的比例，`maxPullDistance` 限制最大位移，非法数值会被安全归一化。
- 触摸移动使用非 passive listener，仅在确认纵向下拉且位于滚动顶部后阻止原生滚动。
- 组件提供可聚焦的原生刷新按钮，获得焦点时进入视口，确保触摸手势不是唯一操作路径。
- 状态通过 `role=status` 播报，刷新期间公开 `aria-busy`；reduced-motion 下将复位动画缩短到 1ms。
- `renderIndicator` 只替换状态展示；接口请求、缓存更新、错误提示和业务空状态由调用方处理。
