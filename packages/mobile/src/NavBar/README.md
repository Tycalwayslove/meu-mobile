# NavBar

移动页面页头，提供视觉居中标题、原生返回 link/button、disabled/loading、左右槽、Safe Area 与受控 sticky/scroll 表现。组件不读取 history、window 或滚动位置。

```tsx
<NavBar
  title={<h1>订单详情</h1>}
  backHref="/orders"
  onBack={(event) => {
    event.preventDefault();
    router.push("/orders");
  }}
  position="sticky"
  scrolled={hasScrolled}
  safeArea
/>
```

完整 Props、事件/ref、无障碍、SSR/hydration、兼容边界、验证证据和变更历史见 [`NavBar.docs.mdx`](./NavBar.docs.mdx)。
