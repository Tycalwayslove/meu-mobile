# Toast

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

Provider 按 FIFO 顺序一次显示一条消息。同一个 `id` 会更新已有消息，controller 也可以更新或
关闭消息。默认展示 3 秒，`duration={0}` 持续展示；带 action 时至少展示 5 秒。

```tsx
const pending = toast.show({ id: "sync", duration: 0, message: "正在同步…" });
pending.update({ message: "同步完成", duration: 3000, tone: "success" });
```

悬停、焦点停留和异步 action 期间计时暂停。action 返回 `false` 或失败时不关闭；失败通过
`onActionError` 交给调用方处理。Toast 不使用遮罩、焦点捕获或滚动锁。
