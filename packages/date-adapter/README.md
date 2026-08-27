# @meu/date-adapter

Meu 日期组件的平台无关契约。该包不依赖 React，也不绑定 Day.js、date-fns 或业务时区，可由 Web 和未来
uni-app 实现共同使用。

```ts
import { nativeDateAdapter } from "@meu/date-adapter";

const value = nativeDateAdapter.parse("2026-08-28 09:30", "YYYY-MM-DD HH:mm");
```

- `DateParts.month` 使用 1–12，`getDayOfWeek` 使用 0（周日）到 6（周六）。
- `fromParts` 对非法日期、月底溢出和本地 DST 不存在时间返回 `null`。
- Native adapter 使用宿主环境本地民用时间，不声明固定时区。
- `add` 的月、季度和年运算会夹紧到目标月份末日；日和周运算保留本地时钟。
- `format / parse` 支持 `YYYY / YY / M / MM / D / DD / H / HH / m / mm / s / ss / SSS`；
  方括号中的内容按字面量处理。
- 自定义 adapter 必须实现 v2 的 parts、比较、日历、解析和格式化能力，并明确自己的时区语义。
