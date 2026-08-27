# TimePicker

`TimePicker` 是确认式移动时间滚轮，公开值为平台无关的 `{ hour, minute, second }`。

```tsx
<TimePicker
  title="营业开始时间"
  defaultValue={{ hour: 9, minute: 30, second: 0 }}
  min={{ hour: 8, minute: 0, second: 0 }}
  max={{ hour: 18, minute: 0, second: 0 }}
  minuteStep={15}
  onConfirm={(value) => console.log(value)}
/>
```

- 默认 `precision="minute"`、`hourCycle="h23"`。
- `hourCycle="h12"` 增加 AM/PM 列，但回调值仍使用 0–23 小时。
- `hourStep`、`minuteStep`、`secondStep` 分别限制为 1–23、1–59、1–59。
- `min > max` 不解释为跨午夜区间；所有候选会不可用，确认按钮禁用。
- `filter` 可按已选上级值禁用时、分、秒；禁用项保留在滚轮中。
- 取消、遮罩和 Escape 丢弃 draft；确定后才提交非受控值。
- React Hook Form 场景使用 `@meu/form-react` 的 `MeuFormTimePicker`。
