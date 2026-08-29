# InfiniteList

完整 V2 契约、边界与验证证据见 [`InfiniteList.docs.mdx`](./InfiniteList.docs.mdx)。

在列表尾部提供自动预加载、手动加载、失败重试与完成状态，不持有列表数据、滚动容器或请求缓存。

```tsx
<List>{items.map(renderItem)}</List>
<InfiniteList hasMore={hasMore} loadMore={loadNextPage} />
```

- `loadMore({ signal, trigger })` 必须返回 Promise；组件以同步 ref 锁防止 Observer、按钮和重试入口并发调用。调用方应把 signal 传给底层可取消 I/O。
- 默认在尾部进入最近滚动祖先底部 250px 范围时触发；`threshold` 只接受非负有限数。
- `autoLoad={false}` 可切换为纯手动加载；无 IntersectionObserver 时自动保留原生“加载更多”按钮作为降级。
- 加载失败进入 `error`，不会被 Observer 自动重试；用户点击原生“重试”按钮后再次调用同一个 `loadMore`。
- `hasMore=false` 是唯一完成事实源；组件不根据返回条数猜测结束，也不修改调用方数据。
- `hasMore=false` 或组件卸载会 abort 在途 signal，并忽略无法取消的陈旧结果；disabled 只阻止新请求。
- 默认状态为 `idle / loading / error / complete`，通过 live status 与 `aria-busy` 对读屏器公开；成功追加可用 `loadedAnnouncement` 公布新增数量。
- 手动加载或重试完成后焦点恢复到新的操作按钮；Observer 自动加载不会移动焦点。
- `renderContent` 只替换状态视觉；原生“加载更多”与“重试”按钮始终由组件保留，避免自定义内容误删手动路径。
- 未来 uni-app 实现复用状态、阈值、并发锁和手动降级契约，Web Observer 与滚动祖先发现留在 React 适配层。
