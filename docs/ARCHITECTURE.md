# Meu Mobile 架构

## 包边界

```text
tokens ──────────────────────────────┐
icons-core ─> icons-react            │
                  │                  │
                  └─> primitives-react ─> mobile ─> form-react
                                                │
                                  ┌─────────────┼─────────────┐
                                  ▼             ▼             ▼
                              Storybook        docs       playground
                                                                │
                                                        tests/next-h5
```

- `tokens`、`icons-core` 和 `date-adapter` 不依赖 React，可供未来 uni-app 实现复用。
- `primitives-react` 不对业务页面提供产品语义，只解决 Portal、焦点和隐藏文本等底层问题。
- `mobile` 提供公开 React 组件；仅在 React DOM 锚定浮层内部使用 Floating UI，不向公开 API 泄漏其类型。
- `form-react` 负责 React Hook Form 绑定，基础控件仍可脱离表单独立使用。
- `tests/next-h5` 是仓库内的独立 Next 消费者，不接触 MeuMall 业务仓库。
- 禁止组件跨目录导入另一个组件的私有文件。
- Portal 浮层若嵌套在 Dialog 或 Popup 中，必须声明为外层焦点域的合法分支，避免焦点被错误拉回。
- BottomSheet 的拖拽只绑定 44 px 手柄，snap 动画只更新 transform，不与可滚动内容争抢手势。
- ActionMenu 复用 Popup 的模态边界，操作项保持原生 button 语义；危险操作通过嵌套 Dialog 二次确认，
  两层浮层依赖焦点栈与引用计数滚动锁协同。
- Picker 复用 Popup 的模态边界，每列保持原生滚动与 CSS scroll snap，并以 listbox、
  `aria-activedescendant` 和确认式 draft 提供触摸、键盘、读屏与表单的一致选择路径。

## Next.js 边界

交互组件保留 `use client` 指令；tokens、类型和平台无关数据保持服务端安全。模块顶层不得访问
`window` 或 `document`。React、React DOM 和 React Hook Form必须作为 peer dependency。

## 旧 WebView

源码和构建产物按 Android Chrome/WebView 70+、iOS Safari 13+ 验证。客户端源码不使用可选链、
空值合并、逻辑赋值、class 私有字段等项目明确禁止的语法；构建后继续执行兼容性扫描。
