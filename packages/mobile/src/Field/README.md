# Field

Field 的长期行为、无障碍契约、验证证据与变更记录统一维护在
[`Field.docs.mdx`](./Field.docs.mdx)。Props 类型事实源位于 [`Field.tsx`](./Field.tsx)。

- 无语义的原生布局 wrapper 不会被克隆成控件；内部 Field-aware 控件继承 label、required、description 与 error，且不会产生重复 id。
- 空字符串、空数组与空 Fragment 不创建空 label/alert，也不会触发伪 invalid 状态。
