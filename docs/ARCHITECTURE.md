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
- FloatingPanel 是页面内常驻、非模态的可变高度容器，不复用 Portal、Mask、滚动锁或焦点圈定。Meu 持有
  pixel anchors、height、placement、惯性与变更原因；React Web 使用 Pointer Events 和 transform，最高
  anchor 时内容区交还原生滚动，未来 uni-app 只替换手势和布局适配层。
- VirtualList 固定为组件自身的纵向滚动容器，Meu 持有 items、稳定 key、估算、范围与命令式定位契约；
  React Web 使用 TanStack Virtual 处理窗口化、动态测量和 iOS WebKit 滚动修正。公开 API 不泄漏引擎类型，
  已聚焦行在离开常规窗口后继续挂载，未来 uni-app 替换平台引擎而复用同一数据与范围契约。
- NumberKeyboard 是非模态底部 Portal，只发布 input / delete / confirm 意图并以 open 控制显示；它不持有金额、
  密码或表单值，也不使用 Mask、滚动锁和焦点圈定。`NumberKeyboardTrigger` 保持原生 button 语义，
  `MeuFormNumberKeyboard` 在 `form-react` 中负责值变换、dirty / touched、校验和确认回调。未来 uni-app 复用
  事件、显示状态、连续删除节奏与布局契约，替换 Portal、Safe Area 和 DOM 事件实现。
- PasscodeInput 以一个真实原生 input 作为值、自动填充、粘贴和可访问性事实源，视觉格仅做隐藏镜像；默认优先
  系统键盘，可按需组合非模态 NumberKeyboard。`MeuFormPasscodeInput` 负责 RHF 值、dirty / touched、校验错误
  与失败聚焦。未来 uni-app 复用值、长度、完成、方向和状态契约，替换 DOM input 与键盘适配层。
- ImageViewer 是模态全屏媒体查看器，统一单图与画廊的 images、index、loop 和缩放契约；Web 端组合 Portal、
  thick Mask、滚动锁、焦点圈定、Carousel 与 Image，缩放后暂停画廊拖拽。它不绑定表单，未来 uni-app 复用
  媒体、索引、倍率与变更原因，替换 DOM、Portal 和手势适配层。
- ImageUploader 把可序列化成功项与 Web 上传任务分离：调用方注入 transport，组件只管理选择、校验、进度、
  abort、失败重试和 object URL 生命周期，并组合 Image 与 ImageViewer。`MeuFormImageUploader` 负责数组值、
  dirty / touched、错误关联与失败聚焦；未来 uni-app 复用成功项、任务状态和拒绝原因，替换文件与 DOM 适配层。

## Next.js 边界

交互组件保留 `use client` 指令；tokens、类型和平台无关数据保持服务端安全。模块顶层不得访问
`window` 或 `document`。React、React DOM 和 React Hook Form必须作为 peer dependency。
Next 消费者同时 transpile `@tanstack/react-virtual` 与 `@tanstack/virtual-core`，避免第三方 ESM 语法越过旧
WebView 构建基线。

## 旧 WebView

源码和构建产物按 Android Chrome/WebView 70+、iOS Safari 13+ 验证。客户端源码不使用可选链、
空值合并、逻辑赋值、class 私有字段等项目明确禁止的语法；构建后继续执行兼容性扫描。
