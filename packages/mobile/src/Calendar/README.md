# Calendar

平台中立的月历视图，支持单选、多选和范围选择。组件只通过 `DateAdapter<TDate>` 读取和生成民用日期，
不依赖 Day.js、date-fns 或业务时区。

```tsx
<Calendar
  selectionMode="range"
  value={range}
  onChange={(nextRange, details) => {
    setRange(nextRange);
    if (details.complete) submitRange(nextRange);
  }}
/>
```

- `selectionMode="single" | "multiple" | "range"` 使用对应的值类型；范围第一次点按返回同日范围且
  `details.complete=false`，第二次点按完成范围。
- `month / defaultMonth / onMonthChange` 独立控制当前月份；相邻月份日期可以直接选择并切换月份。
- `min / max / disabledDate` 共同决定不可选日期，导航按钮也遵守月份边界。
- `weekStartsOn` 使用 JavaScript 星期编号（周日 0、周一 1），默认周日。
- 默认固定六周、42 格和 48px 日期触控高度，减少月份切换时的布局跳动。
- 键盘支持方向键、Home / End、PageUp / PageDown；Shift + PageUp / PageDown 按年移动。
- React Hook Form 场景使用 `@meu/form-react` 的 `MeuFormCalendar`。
