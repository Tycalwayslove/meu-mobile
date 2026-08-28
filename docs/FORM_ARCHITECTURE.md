# 表单架构

`@meu/mobile` 提供不绑定状态引擎的 Field、TextInput、Picker 等视觉和交互组件。
`@meu/form-react` 提供 React Hook Form 的 Provider、hook、字段控制器、Zod resolver 和服务端错误映射。

首发覆盖：字段注册、受控组件、嵌套字段、数组字段、同步/异步校验、dirty/touched/submitting、
reset/watch/trigger、服务端字段错误及首次错误聚焦。

## 集成边界

- `useMeuForm` 返回完整 React Hook Form 实例；`useFieldArray`、`useWatch` 等能力从包入口继续导出。
- `MeuFormTextInput` 使用 `Controller` 连接基础 `Field` 与 `TextInput`，不在 UI 组件中保存表单状态。
- `MeuFormTextArea` 与 `MeuFormSearchField` 沿用同一 Controller 契约；多行输入、搜索提交等交互仍由基础组件负责。
- `MeuFormCheckbox` / `MeuFormSwitch` 映射 boolean，`MeuFormCheckboxGroup` 映射数组，`MeuFormRadioGroup` 映射单值或 `null`；组级错误聚焦到可读的 group 容器。
- `MeuFormStepper` 映射 number / `null`，`MeuFormSlider` 与 `MeuFormRate` 映射 number，`MeuFormSelector` 映射按选项排序的数组；所有适配器保持基础组件的原生键盘语义。
- `MeuFormPicker` 映射多列值数组；滚轮只修改 Picker draft，确定后才调用字段 `onChange`，取消不会产生 dirty，校验错误和首次错误焦点落在原生 button 触发器。
- `MeuFormCascadePicker` 映射从根到叶子的级联值数组；父级变化只更新弹层 draft，确定后一次性写入
  完整归一化路径，取消不产生 dirty，错误关联和首次错误焦点仍落在原生 button 触发器。
- `MeuFormDatePicker` 映射 `TDate | null`，通过同一 `DateAdapter<TDate>` 格式化触发器与生成日期列；
  只有确定才写入字段，取消不产生 dirty，错误聚焦到原生 button 触发器。
- `MeuFormDateRangePicker` 精确映射 `readonly [TDate, TDate] | null`；Calendar 只更新弹层 draft，第二次
  选择完成范围后确定按钮才可用，只有确定才写入字段。取消、遮罩与 Escape 不产生 dirty，错误聚焦触发器。
- `MeuFormTimePicker` 映射平台无关的 `TimeValue | null`；12/24 小时制只影响展示，只有确定才写入字段，
  取消不产生 dirty，错误聚焦到原生 button 触发器。
- `MeuFormCalendar` 按模式精确映射 `TDate | null`、`ReadonlyArray<TDate>` 或
  `readonly [TDate, TDate] | null`。内联选择立即写入字段；范围首个日期写入同日范围并携带
  `details.complete=false`，第二个日期完成范围。校验错误聚焦到当前可操作的真实日期按钮。
- `MeuFormTreeSelect` 映射层级节点值数组；展开、搜索和面板内选择只修改 draft，确认时执行字段 change + blur，
  取消不产生 dirty。错误关联、touched 与首次错误焦点落在复用的原生 `PickerTrigger`。
- Zod 通过 `schema` 便捷参数接入；也可传任意 React Hook Form `resolver`，二者同时存在时 `schema` 优先。
- `applyMeuFormErrors` 接收路径化字段错误，例如 `profile.name`、`items.0.title`，默认聚焦第一个有效错误字段。
- `MeuForm` 保留原生 `<form>` 语义并默认 `noValidate`，首次客户端校验失败沿用 React Hook Form 的聚焦策略。

```tsx
const form = useMeuForm<FormValues>({ schema, defaultValues });

applyMeuFormErrors(form, {
  "profile.name": "店铺名称已存在",
  "items.0.title": "第一项标题不可用"
});
```

不在组件库中实现 API 请求、业务 DTO 映射或 JSON 配置驱动的自动表单生成器。
