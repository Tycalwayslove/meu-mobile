# NumberKeyboard

特殊数字输入场景的非模态底部键盘。它不持有金额、密码、身份证号或表单值，只发布输入、删除、确认和关闭
意图；能使用系统原生键盘时，应优先使用原生键盘。

```tsx
const [open, setOpen] = useState(false);
const [value, setValue] = useState("");

<NumberKeyboardTrigger open={open} value={value} onClick={() => setOpen(true)} />
<NumberKeyboard
  open={open}
  title="交易金额"
  mode="decimal"
  confirmLabel="确定"
  onInput={(input) => setValue((current) => current + input)}
  onDelete={() => setValue((current) => current.slice(0, -1))}
  onOpenChange={setOpen}
/>
```

## 契约

- `open / defaultOpen / onOpenChange` 只控制显示，并区分 close-button / confirm / escape。
- `mode="decimal"` 默认提供小数点；`extraKey` 可替换为 X、00 等自定义键，显式 `null` 留空。
- 非空 `confirmLabel` 增加全宽确认键；空值/空白不渲染，`closeOnConfirm` 默认关闭键盘。
- 删除键默认在按住 600ms 后每 120ms 连续触发；`deleteRepeat=false` 可关闭。
- `randomOrder` 每次打开时重排数字，只是视觉混淆，不是密码学安全能力。
- Web 实现无 Mask、滚动锁或焦点圈定。鼠标按键不夺走当前输入焦点，所有键仍是可 Tab、Enter、Space 操作的
  原生 button。键高至少 56px，收起按钮至少 44px，并默认适配底部 Safe Area。
- Portal 会复制 ConfigProvider 的 theme、locale、dir 与 motion；关闭开始后按键立即停止发布事件，连删在取消、禁用、关闭和卸载时清理。
- `NumberKeyboardTrigger` 是推荐的无原生软键盘触发器；完整 React Hook Form/Zod 绑定使用
  `@meu/form-react` 的 `MeuFormNumberKeyboard`。

未来 uni-app 适配复用显示状态、事件、布局和连删节奏，替换 Portal 与 DOM 事件层。
