# BottomSheet

从屏幕底部进入的模态任务面板，适合筛选、补充输入和少量连续操作。它复用 Meu 的 Portal、Mask、引用计数滚动锁和焦点圈定，不用于短确认或只读提示。

```tsx
<BottomSheet
  open={open}
  title="筛选条件"
  snapPoint={snapPoint}
  snapPoints={[0.3, 0.5, 0.9]}
  onOpenChange={setOpen}
  onSnapPointChange={setSnapPoint}
>
  <Filters />
</BottomSheet>
```

- 数字 snap point 是 `(0, 1]` 的可视视口高度比例；`"content"` 使用内容高度。所有点受 90% 视口上限约束、按实际高度升序去重，默认打开到最高点。
- `snapPoint / defaultSnapPoint / onSnapPointChange` 支持受控与非受控高度；实际值与索引分别暴露为 `data-snap-point` 和 `data-snap-index`。
- 拖拽只从 44px 手柄开始，避免和内容滚动竞争。释放后吸附到相邻高度；低于最小点时可通过 `dragToDismiss` 关闭。
- 手柄是原生 `button`：点击循环高度，方向键上下移动，Home / End 跳到最低 / 最高点，因此不依赖手势也能完成操作。
- 面板使用模态 `role="dialog"`。可见 `title` 自动成为名称；没有标题时必须提供 `aria-label` 或 `aria-labelledby`。
- 默认不允许遮罩点击关闭，但支持 Escape、可选关闭按钮、滚动锁、焦点捕获与恢复、安全区、Portal 容器和 `forceMount`。
- 打开变更原因是 `mask / escape / close-button / drag`；组件不猜测业务保存或取消语义。
- 动画只改变 `transform`，拖拽期间直接更新位移；reduced motion 下缩短过渡。
