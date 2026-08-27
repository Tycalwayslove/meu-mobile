# Popover

触发器锚定的非模态交互浮层。它使用 Floating UI 处理滚动跟随、视口碰撞、位置翻转、Portal Tab 顺序、外部点击和 Escape，不内置菜单、选择或业务动作模型。

```tsx
<Popover
  aria-label="订单快捷操作"
  placement="bottom-end"
  content={<Button size="small">复制订单号</Button>}
>
  <IconButton aria-label="更多操作">
    <MeuIconMore />
  </IconButton>
</Popover>
```

- `open / defaultOpen / onOpenChange` 支持受控与非受控使用；关闭原因是 `trigger / outside / escape / focus-out`。为避免 iOS WebKit 在 Portal 初始聚焦时误判，`closeOnFocusOut` 默认关闭，可按场景显式启用。
- `placement` 接受四个方向及 `-start / -end`，是首选位置而非最终位置；`data-placement` 提供碰撞处理后的实际位置。
- 默认点击触发、显示箭头、自动聚焦浮层并在关闭后恢复触发器。外部指针已经把焦点移到其他控件时不会抢回焦点。
- `trigger="manual"` 仅保留锚点与 ARIA 关联，适合业务状态或其他手势控制。
- 内容使用非模态 `role="dialog"`，必须通过 `aria-label` 或 `aria-labelledby` 命名；组件不使用 Mask、不锁滚动、不设置 `aria-modal`。
- 触发器必须是一个可聚焦且能接收 `ref` 和事件属性的 React 元素。Meu Button 与 IconButton 均满足此约束。
- `container={undefined}` 使用 ConfigProvider 的 Portal 容器或 `document.body`；`container={null}` 原地渲染。嵌入 Dialog / Popup 时，Portal 内容会作为其合法焦点分支。
- 动画只改变 transform 与 opacity，并在 `prefers-reduced-motion` 下退化。
