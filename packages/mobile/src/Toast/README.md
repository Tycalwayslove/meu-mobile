# Toast

完整 V2 契约、队列语义与验证证据见 [`Toast.docs.mdx`](./Toast.docs.mdx)。

Toast 用于短暂反馈，不打断当前任务，也不会在出现时移动焦点。普通结果与成功消息使用 polite
`status`，警告和错误使用 assertive `alert`。需要用户明确确认、输入或理解长内容时使用 Dialog。

## 命令式队列

```tsx
function App() {
  return (
    <ToastProvider>
      <CheckoutPage />
    </ToastProvider>
  );
}

function CheckoutPage() {
  const toast = useToast();
  return <Button onClick={() => toast.success({ message: "订单已保存" })}>保存</Button>;
}
```

Provider 按 FIFO 顺序一次显示一条消息。同一个 `id` 会原位替换已有消息并重新开始完整
duration，controller 也可以更新或关闭 active/queued 消息。默认展示 3 秒，`duration={0}`
持续展示；带 action 时至少展示 5 秒。

```tsx
const pending = toast.show({ id: "sync", duration: 0, message: "正在同步…" });
pending.update({ action: undefined, message: "同步完成", duration: 3000, tone: "success" });
```

同 id `show` 会完整替换旧配置，省略旧 action/handler 即会清除；controller `update` 是局部更新，显式
传 `undefined` 可清除任一可选字段。

Provider 对同一条消息的视觉更新立即生效；读屏 live announcer 会把连续更新合并为每 500ms 最多一次的
最新消息。普通状态升级为 warning/danger 时会立即使用 assertive alert 公告。若 message 与 tone 都没有
变化，仅调整 duration、position 或 action 不会重复播报。独立声明式 `<Toast>` 不经过该 Provider 节流。

悬停、焦点停留、页面隐藏和异步 action 期间计时暂停。action 返回 `false` 或失败时不关闭；失败通过
`onActionError` 交给调用方处理，并在根输出 `data-action-error=true`。关闭、替换或卸载后的旧 Promise
结果会被忽略。Toast 不使用遮罩、焦点捕获或滚动锁。
动态移除聚焦 action 或迁移 Portal 时，失效的 focus/hover pause 会被清理，不会永久冻结倒计时。

Provider 默认最多保留 20 条 visible/queued/exiting 记录，可通过 `maxToasts` 在 1–100 内调整。容量满时
拒绝最新 unique record，并通过其 `onClose({ reason: "overflow" })` 报告；同 id 替换不受影响。Provider
运行时降低上限会保留 FIFO 头部，以 overflow 淘汰最新 queued record，并在退场期后收敛。Provider
卸载会清理计时器、以 programmatic 结束剩余记录，并使保留的 API/controller 失效。
