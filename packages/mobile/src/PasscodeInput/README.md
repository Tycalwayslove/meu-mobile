# PasscodeInput

面向短信验证码、支付口令和短码输入的视觉分格控件。真实原生 `input` 是值、键盘、自动填充、粘贴与可访问性
的唯一事实源，视觉格只做 `aria-hidden` 镜像。

```tsx
const [value, setValue] = useState("");

<PasscodeInput
  aria-label="短信验证码"
  value={value}
  length={6}
  separated
  onChange={setValue}
  onComplete={(code) => verify(code)}
/>;
```

## 契约

- `value / defaultValue / onChange` 提供受控与非受控模式；`length` 默认 6，输入始终规范化到长度上限。
- 默认 `mask=true`，只影响视觉和原生 input 的 `password / text` 类型，不是加密或密码学保护。
- 默认使用系统键盘，保留 `inputMode`、`autocomplete="one-time-code"`、粘贴和短信验证码自动填充。
- `inputMode="numeric"` 只接受 ASCII 数字；`inputMode="text"` 可接受其他字符。
- `onComplete(value)` 在每个完整值首次出现时调用；值重新变为不完整后可再次完成。
- `separated` 控制独立格布局；`direction="rtl"` 调整顺序和连体圆角；`caret` 只控制视觉插入光标。
- `keyboard` 可组合 Meu `NumberKeyboard`。此时真实 input 保持焦点与字段语义，但不会唤起系统软键盘；键盘不
  持有业务值，也不创建 Mask、滚动锁或焦点圈定。
- 完整 React Hook Form / Zod 绑定使用 `@meu/form-react` 的 `MeuFormPasscodeInput`，包括 dirty、touched、
  校验错误关联与失败时聚焦真实 input。

未来 uni-app 适配复用值、长度、完成、方向与视觉状态契约，替换 DOM input、自动填充和 Portal 实现。
