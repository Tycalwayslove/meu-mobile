# Picker

由 Popup 承载的底部滚轮选择器。适用于一至五列、顺序可预测的离散选项；短列表优先使用 RadioGroup 或 Selector，需要搜索的大列表使用搜索列表。

```tsx
const [open, setOpen] = useState(false);
const [value, setValue] = useState<ReadonlyArray<string | null>>([]);

<PickerTrigger open={open} value={value[0]} onClick={() => setOpen(true)} />
<Picker
  open={open}
  title="配送方式"
  columns={[
    [
      { label: "普通配送", value: "standard" },
      { label: "当日达", value: "same-day" }
    ]
  ]}
  value={value}
  onConfirm={setValue}
  onOpenChange={setOpen}
/>
```

- 每列是单选 `listbox`，焦点保留在列上，并通过 `aria-activedescendant` 暴露当前项。
- 支持方向键、Home / End、字符查找、点按，以及原生触摸/触控板滚动与 scroll snap；禁用项不可成为当前值。
- 复合 React 标签必须提供稳定的 `textValue`。多列通过 `columnLabels` 提供各列名称。
- 打开时创建 draft。`onSelect` 只报告 draft；确定才提交，取消、遮罩和 Escape 均丢弃 draft。
- 非法或禁用值回退到该列首个可用项；空列为 `null`，且禁用确认按钮。
- 默认显示五行，每行 48px，并复用 Popup 的 Portal、遮罩、滚动锁、焦点圈定/恢复和安全区。
- `PickerTrigger` 是读取 Field 上下文的原生按钮；React Hook Form 场景使用 `@meu/form-react` 的 `MeuFormPicker`，表单值只在确定时更新。
