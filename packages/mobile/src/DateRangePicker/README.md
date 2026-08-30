# DateRangePicker

基于 `Popup + Calendar(range)` 的确认式日期范围选择器。组件只处理平台无关的民用日期、草稿与确认语义；默认使用 `nativeDateAdapter`，也可通过 `DateAdapter<TDate>` 接入其他日期类型。

```tsx
<DateRangePicker
  open={open}
  title="配送日期范围"
  min={min}
  max={max}
  presets={presets}
  value={value}
  onConfirm={setValue}
  onOpenChange={setOpen}
/>
```

- 首次点击建立 `[start, start]` 草稿，但 `complete=false`，确定按钮保持禁用；第二次点击后自动排序并完成范围。
- 同日范围也需要再次点击同一天，避免把一次误触直接当成完整范围。
- 取消、遮罩与 Escape 丢弃草稿，只有确定才调用 `onConfirm`；`onSelect` 可用于观察草稿。
- `presets` 只更新草稿，不自动确定；越界、端点被禁用或显式 `disabled` 的快捷范围不可操作。
- `disabledDate` 决定日期端点能否选择；范围可以跨过中间的禁用日期。
- `min`、`max` 或 `disabledDate` 动态变化时会立即重新校验现有草稿并更新确定按钮；跨月选择会保留首个端点。
- `renderRangeLabel` 可替换摘要展示，不参与日期计算。
- Popup 统一提供焦点圈定、焦点恢复、滚动锁、安全区和遮罩行为。
- 需要稳定 SSR/hydration 首屏时应显式提供 `defaultMonth` 或 `month`，避免服务端与客户端跨午夜时从 `adapter.now()` 得到不同月份。
- React Hook Form 场景使用 `@meu/form-react` 的 `MeuFormDateRangePicker`，它将 `CalendarRange<TDate> | null` 精确绑定到字段。
