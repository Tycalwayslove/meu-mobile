# FloatingPanel

永久事实源见 [FloatingPanel.docs.mdx](./FloatingPanel.docs.mdx)。

页面内常驻的可变高度内容面板，适合地图、行程与筛选场景。它不是模态浮层，不使用 Portal、Mask、页面
滚动锁或焦点圈定；需要这些能力时使用 `BottomSheet`。

```tsx
const [height, setHeight] = useState(220);

<FloatingPanel anchors={[220, 420, 720]} height={height} onHeightChange={setHeight}>
  <TripDetails />
</FloatingPanel>;
```

## 契约

- `anchors` 是正像素高度，归一化到 44px–可视视口高度并升序去重；默认从最低点开始，不存在的请求高度映射到最近 anchor。
- `height / defaultHeight / onHeightChange` 支持受控与非受控状态，回调区分 `drag / handle / keyboard / imperative`。
- `placement="bottom" | "top"` 只改变物理增高方向，公开 height 始终表示面板可见高度。
- 44px 原生 handle 支持拖拽、点击循环、方向键、PageUp / PageDown、Home / End；`setHeight()` 提供非唯一的命令式便捷入口。
- `dragFromContent=true` 时，未达到最高 anchor 的非交互内容可辅助拖动。原生控件、可聚焦节点、常见 ARIA widget，以及带 `data-meu-floating-panel-drag-ignore` 的区域不会触发面板拖拽。到达最高点后内容区交还原生纵向滚动，收起继续使用 handle。
- anchors、placement、disabled 或内容拖拽策略在拖拽中变化时，当前手势会取消；pointer capture 不可用时临时使用 window 事件兜底，并在结束或卸载时清理。
- `pointercancel` / lost capture 会回滚到权威 anchor，后续手势可立即重新开始；次要鼠标键和非主指针不会创建拖拽会话。
- 低于最高 anchor 时内容手势只负责向展开方向移动面板；最高 anchor 的内容区不再绑定面板拖拽，方向键、PageUp/PageDown 与原生 `scrollTop` 继续由滚动容器处理。
- `inertiaFactor` 默认 50，只影响释放后的目标推算；`prefers-reduced-motion` 下吸附近乎即时。
- 组件不依赖 `ResizeObserver`：anchors 与 visual viewport 是高度事实源，宽度和 children 变化交由 CSS；宿主可用高度变化时请更新 anchors，软键盘/viewport 高度变化会自动重新夹紧。
- 组件不持有地图、列表、筛选状态或导航。未来 uni-app 复用 anchors、height、placement、惯性与原因契约，替换 Pointer Events 和 transform。
