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
- 初始 `open` 的 SSR/hydration 是确定的；Portal 在 hydration 后按设计迁移到 `body`，请保持服务端和首次客户端的 locale、hourCycle、precision、bounds 与 value 一致。
- RTL 只改变布局方向，不反转 hour→minute→second→period 的语义顺序；长本地化标题和 action 会换行，操作目标保持至少 44px。
- React Hook Form 场景使用 `@meu/form-react` 的 `MeuFormTimePicker`。
