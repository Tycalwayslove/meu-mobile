# SwipeActions

面向移动列表的横向滑动操作容器。组件只负责动作轨道、手势与打开状态，不绑定 `Cell`、列表数据、路由或
业务确认流程。

## 基础用法

```tsx
<SwipeActions
  rightActions={[
    { key: "archive", label: "归档", onPress: archiveOrder },
    { key: "delete", label: "删除", tone: "danger", onPress: deleteOrder }
  ]}
>
  <Cell title="订单 MEU-0828" />
</SwipeActions>
```

## 契约

- `openSide / defaultOpenSide / onOpenSideChange` 支持受控和非受控的 `left | right | null` 状态。
- `openThreshold` 是动作轨道宽度的比例，限定在 `0.1–0.9`，默认 `0.35`；快速横扫也能越过阈值。
- 手势在 6px 后锁定方向。纵向移动交还原生滚动，横向位移被限制在对应动作轨道内。
- 内容点按、组件外指针或焦点、Escape、动作完成和反向滑动都提供结构化关闭原因。
- 动作支持同步或异步 `onPress`。Promise 未完成时锁定全部动作；返回 `false` 或抛错时保持展开，错误交给
  `onActionError`，组件不显示业务 Toast。
- 隐藏动作不进入 Tab 顺序。左右两侧各有一个获得焦点时显现的原生打开按钮，打开后焦点进入第一个可用动作。
- 滑动不得成为唯一入口。列表场景还应在 `Cell` 的“更多操作”菜单中提供同一组动作，尤其是破坏性操作。
- 每个动作目标高度不小于 44px；`tone` 只表达 Meu 的语义颜色，不接受任意品牌色。

未来 uni-app 适配复用 `side`、阈值、方向锁、动作结果和关闭原因契约；Pointer Events、ResizeObserver 与
CSS transform 留在 React Web 适配层。
