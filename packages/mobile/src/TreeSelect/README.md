# TreeSelect

面向移动 H5 的确认式树形选择面板。它适合“数据量大、需要搜索或需要跨层级查看”的场景；只需要按路径逐级选择时优先使用 `CascadePicker`。

```tsx
const triggerRef = useRef<HTMLButtonElement>(null);

<PickerTrigger ref={triggerRef} open={open} value="智能手机" onClick={() => setOpen(true)} />
<TreeSelect
  open={open}
  title="商品类目"
  options={categories}
  value={value}
  returnFocusRef={triggerRef}
  onConfirm={setValue}
  onOpenChange={setOpen}
/>
```

## 值与提交

- `value/defaultValue` 始终是数组；单选最多保留一个值，多选由 `multiple` 开启。
- 面板内部维护 draft。点击节点只触发 `onSelect`；只有“确定”触发 `onConfirm` 并提交非受控值。取消、遮罩和 Escape 丢弃 draft。
- 默认 `selectionMode="leaf"`，父节点只负责展开。`selectionMode="any"` 允许选择任意层级。
- 多选采用独立勾选，不隐式联动父子节点，避免表单值随着树数据变化而被静默改写；可用 `maxCount` 限制数量。
- 所有 `value` 在整棵树中必须唯一。重复值只采用第一次出现的节点，循环引用会被安全截断。

## 搜索、展开与异步数据

- `searchValue/defaultSearchValue/onSearchValueChange` 和 `expandedValues/defaultExpandedValues/onExpandedValuesChange` 都支持受控与非受控模式。
- 搜索会保留命中节点的祖先路径，但不会改写调用方的展开状态；非文本 `label` 应提供 `textValue`。
- `isLeaf={false}` 表示节点仍可加载。展开会调用 `loadChildren(option, { signal })`；收起、禁用、节点移除和卸载会 abort pending 请求，失败后可收起再展开重试。数据仍由调用方不可变写回 `options`。
- `virtual` 默认开启，基于扁平可见节点窗口化；每个虚拟节点显式提供 `aria-level/posinset/setsize`。

## 无障碍与表单

- 使用 WAI-ARIA Tree View 的 `tree/treeitem` 语义。方向键移动与展开，Home/End 跳转，Enter/Space 选择，并支持短时 type-ahead；RTL 时左右键镜像。
- 单选使用 `aria-selected`，多选使用 `aria-checked`；焦点与选中状态彼此独立。
- async loading/error 通过 `aria-busy`、`role=status`、旋转/感叹号形状与本地化文案共同表达。
- Popup 复用统一的遮罩、滚动锁、Escape、焦点恢复和安全区行为；触发器复用 `PickerTrigger`。
- React Hook Form 使用 `@meu/form-react` 的 `MeuFormTreeSelect`。确认会执行 change + blur，使 dirty、touched 与校验状态同步更新。

## uni-app 边界

树模型、值语义、搜索/展开状态和事件详情可以复用；Portal、DOM 焦点、ARIA、`@tanstack/react-virtual` 和 Web Popup 属于 React H5 适配层。后续 uni-app 版本应复用数据契约，重新实现渲染、虚拟列表与平台无障碍桥接。
