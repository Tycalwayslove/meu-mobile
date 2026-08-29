# Collapse

移动端 disclosure/accordion group，提供原生 button 语义、受控与非受控状态、稳定 ARIA 关系、键盘标题导航、动态条目焦点恢复、嵌套和未知高度动画。

```tsx
import { Collapse } from "@meu/mobile";

<Collapse
  aria-label="配送与售后"
  defaultValue={["delivery"]}
  items={[
    { value: "delivery", title: "配送范围", content: "支持中国大陆大部分城市配送。" },
    { value: "returns", title: "退换规则", content: "签收后 7 天内可申请退换。" }
  ]}
/>;
```

`value` 存在时为受控模式，`accordion` 限制最多一项展开。item `value` 必须唯一稳定；标题、extra 和 arrow 位于 trigger button 内，不得嵌套交互控件。

完整 Props、Events、键盘、SSR/RTL、动效、兼容边界和验证证据见 [`Collapse.docs.mdx`](./Collapse.docs.mdx)。
