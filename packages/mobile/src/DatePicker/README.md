# DatePicker

基于 Picker 与 `DateAdapter<TDate>` 的确认式日期滚轮。默认使用 `nativeDateAdapter` 和宿主环境的本地
民用时间；传入自定义 adapter 后可以接入其他日期类型或时区语义。

```tsx
<DatePicker
  open={open}
  title="预约时间"
  precision="minute"
  min={min}
  max={max}
  minuteStep={15}
  value={value}
  onConfirm={setValue}
  onOpenChange={setOpen}
/>
```

- `precision` 支持 `year / month / day / hour / minute / second`，默认到日。
- 未显示的低位字段会归一化：年从 1 月 1 日开始，月从 1 日开始，日期从 00:00:00 开始。
- `min / max` 按当前精度比较；未传入时使用首次渲染时刻前后十个自然年。
- 年或月变化会把过期日夹紧到目标月份末日，例如 1 月 31 日切到 2 月会落到 28 或 29 日。
- `minuteStep / secondStep` 会夹紧到 1–59；不要求整除 60。
- `filter` 按精度禁用选项；`renderLabel` 只改变标签，不改变数值或日期计算。返回非文本节点时仍使用当前 locale 的默认标签作为读屏与 type-ahead 文本。
- `DateAdapter.fromParts` 返回 `null` 的民用时间会禁用，Native adapter 因此能够排除 DST 跳时中不存在的时间。
- 取消、遮罩和 Escape 丢弃 draft，只有确定才提交；Popup、滚动、键盘和焦点行为复用 Picker。
- 自定义日期类型必须同时传入匹配的 `DateAdapter<TDate>`。
- React Hook Form 场景使用 `@meu/form-react` 的 `MeuFormDatePicker`。
- initially-open 服务端标记可无错误 hydration 并迁移到 body Portal；跨午夜首屏需显式提供稳定的 `min / max / defaultValue` 或 `value`。
- 本地 Storybook 七环境矩阵覆盖 RTL、reduced-motion、forced-colors、200% 字号和超长本地化 header action；统一发布前再补真机滚轮/读屏与 Chromatic 门禁。
