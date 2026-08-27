# Meu Mobile 架构

## 包边界

```text
tokens ──────────────────────────────┐
date-adapter ────────────────────────┤
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
- CascadePicker 只负责把树形路径解析为 Picker columns；父级变化、动态 options 与空子级由纯数据解析层
  归一化，不复制 Popup、滚轮、焦点或表单提交实现。
- DatePicker 通过平台无关的 `DateAdapter<TDate>` 生成日期列、比较边界和验证民用时间；默认 Native adapter
  使用宿主本地时间，自定义日期类型或时区必须提供自己的 adapter。视觉、Popup 和交互继续复用 Picker。
- TimePicker 使用可序列化的 `{ hour, minute, second }` 表达一天内时间；12 小时制只改变列表示，
  表单值始终保持 0–23 小时，不附带虚构日期、日期库或时区。
- Calendar 通过同一 `DateAdapter<TDate>` 生成稳定的月视图，并把单选、多选和范围选择保留为纯数据契约；
  它不依赖 Popup、日期库或业务时区。
- DateRangePicker 组合 Calendar 的范围算法与 Popup 的模态边界，仅新增 draft、快捷范围和确认/回滚；
  表单触发器留在 `form-react`，核心组件不读取业务表单、路由或接口状态。
- PullToRefresh 不制造滚动容器，只在最近滚动边界到顶后接管纵向下拉；异步刷新、状态播报和键盘按钮
  属于 React 适配层，`canPull()`、阈值与状态契约可被未来平台实现复用。
- InfiniteList 只渲染列表尾部状态并锁定异步加载，不持有分页数据或滚动容器；Web 端的
  IntersectionObserver、最近滚动祖先发现和原生按钮降级留在 React 适配层。
- Carousel 由 Meu 持有受控索引、自动播放、暂停规则、无障碍与视觉契约；React Web 适配层使用 Embla
  处理拖拽、snap 与无克隆循环，不向公开 API 泄漏引擎类型。未来 uni-app 复用 items、索引、变更原因、
  循环和暂停契约，并按目标平台替换手势实现。
- SwipeActions 不拥有 Cell、列表数据或业务确认；Meu 持有左右展开状态、方向锁、阈值、动作结果和关闭原因。
  React Web 适配层使用原生 Pointer Events、ResizeObserver 与 transform，未来 uni-app 替换手势驱动但复用
  同一状态机。获得焦点时显现的打开按钮与 Cell 更多菜单确保滑动不是唯一入口。

## Next.js 边界

交互组件保留 `use client` 指令；tokens、类型和平台无关数据保持服务端安全。模块顶层不得访问
`window` 或 `document`。React、React DOM 和 React Hook Form必须作为 peer dependency。

## 旧 WebView

源码和构建产物按 Android Chrome/WebView 70+、iOS Safari 13+ 验证。客户端源码不使用可选链、
空值合并、逻辑赋值、class 私有字段等项目明确禁止的语法；构建后继续执行兼容性扫描。
