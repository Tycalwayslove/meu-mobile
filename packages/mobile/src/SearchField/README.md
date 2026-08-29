# SearchField

SearchField 的 V2 行为、事件、兼容性、证据与变更记录以
[`SearchField.docs.mdx`](./SearchField.docs.mdx) 为唯一事实源。

- 使用真实 `input[type="search"]`，支持受控/非受控值、原生 FormData、外部 `form=` 关联及可取消的 `form.reset()`。
- `onSearch` 与外围 form submit 是互斥的 Enter 所有者；IME 组合输入、重复 Enter 和 loading 不会重复提交。
- 内置 clear 请求空值并恢复输入焦点；loading 替换已聚焦的 clear 时也会把焦点交回输入。
- 组件不拥有请求、debounce 或取消。调用方应管理 AbortController，并通过 `loading` 反馈请求状态。
