# CascadePicker

将树形数据适配到 Picker 的级联选择器。弹层、滚轮、键盘、焦点、滚动锁和安全区全部复用 Picker。

```tsx
<CascadePicker
  open={open}
  title="配送地区"
  options={regions}
  value={value}
  columnLabels={["省份", "城市", "区县"]}
  onConfirm={setValue}
  onOpenChange={setOpen}
/>
```

- 值是从根到当前叶子的完整路径；同级 `value` 必须唯一。
- 父级变化会丢弃旧后缀，并从新分支逐级选择首个非禁用项。
- `children: undefined` 表示叶子；`children: []` 表示显式存在但暂为空的下一级，并禁用确认。
- `options` 动态更新时会静默归一化当前 draft，不伪造 `onSelect`。
- 异步请求竞态由调用方取消或丢弃 stale response；组件始终按最后一次传入的不可变 `options` 渲染。
- 循环对象引用会在重复节点进入下一列前截断，避免生成重复层级。
- 取消、遮罩和 Escape 都丢弃 draft，只有确定才提交。
- 视觉上建议不超过五级；需要搜索或展示大量节点时使用搜索列表或 TreeSelect。
- React Hook Form 场景使用 `@meu/form-react` 的 `MeuFormCascadePicker`。
