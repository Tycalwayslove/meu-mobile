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
- 支持方向键、Home / End、PageUp / PageDown、字符查找、点按，以及原生触摸/触控板滚动与 scroll snap；禁用项不可成为当前值。
- 复合 React 标签必须提供稳定的 `textValue`。多列通过 `columnLabels` 提供各列名称。
- 打开时创建 draft。`onSelect` 只报告 draft；确定才提交，取消、遮罩和 Escape 均丢弃 draft。
- 非法或禁用值回退到该列首个可用项；空列为 `null`，且禁用确认按钮。
- 默认显示五行，每行 48px，并复用 Popup 的 Portal、遮罩、滚动锁、焦点圈定/恢复和安全区。
- 空列或全禁用列不进入 Tab 顺序，并会禁用确认；columns 应通过不可变数组更新。
- `PickerTrigger` 是读取 Field 上下文的原生按钮，会合并 label/description/error 的关联；button 不支持 `aria-required`，因此该属性从 Trigger 类型中排除，必填事实由 Field 的本地化隐藏说明和确认后的校验错误表达。
- React Hook Form 场景使用 `@meu/form-react` 的 `MeuFormPicker`，表单值只在确定时更新，并通过 hidden successful controls 进入 FormData。

## 本地验证边界

- initially-open 服务端标记会无错误 hydration，并在 Portal 迁移到 `body` 后保持 listbox 与 `aria-activedescendant` 的完整关系。
- mobile Chromium/WebKit 会真实等待 80ms 滚动 settle，验证禁用落点跳到最近可用项并以 `reason="scroll"` 发布 draft。
- Storybook 七环境矩阵包含 200% 字号、RTL、forced-colors、reduced-motion 与超长本地化 header action；操作目标不低于 44px，根节点无横向溢出。
- iOS/Android 真机惯性滚动与 VoiceOver/TalkBack 公告仍属于发布验收，不由本地自动化替代。
