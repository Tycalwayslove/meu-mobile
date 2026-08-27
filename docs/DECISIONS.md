# 架构决策

## ADR-001：pnpm workspace 与 Turborepo

采用 pnpm 管理依赖和 workspace 协议，Turborepo只负责跨包任务拓扑与缓存。

## ADR-002：Rollup 构建组件库

组件包使用 Rollup 和 `@vanilla-extract/rollup-plugin`。Vite只用于 Storybook和 playground，
不承担 Vanilla Extract 库发布构建。

## ADR-003：新旧 token 并存迁移

新组件只使用 `--meu-*`。现有 H5 的 `--mm-*` 不全局映射到新品牌色，避免旧页面发生隐式换肤。

## ADR-004：跨框架只共享平台无关资产

未来 uni-app 实现共享 token、SVG、日期契约和组件语义，不共享 React DOM、Portal 和焦点实现。

## ADR-005：表单引擎与 UI 分层

基础控件保持无表单依赖；`form-react` 使用 React Hook Form 提供完整绑定，并通过 Standard Schema
兼容验证器，首发提供 Zod 适配。

## ADR-006：Web 锚定浮层使用 Floating UI

`mobile` 的 Popover 等 React DOM 锚定浮层使用 `@floating-ui/react` 处理定位、碰撞翻转、视口偏移、
Portal 与非模态焦点协作。Meu 保留公开 API、关闭原因、可访问性契约和视觉样式的所有权，不直接暴露
Floating UI 类型。未来 uni-app 只复用 placement、状态与语义契约，按目标平台重新实现定位和焦点能力。

## ADR-007：BottomSheet 自持轻量 snap 与拖拽引擎

BottomSheet 复用现有 Portal、Mask、滚动锁和焦点圈定，自持仅由拖拽手柄驱动的 transform snap 引擎。
不采用已停止维护且不支持 React 19 的 `react-spring-bottom-sheet`；不采用官方已声明不维护的 Vaul；
也不采用仍有 React StrictMode 动画问题、默认缺少可访问性且要求 Motion peer 的 `react-modal-sheet`。
Meu 公开数字比例与 `content` snap 语义、键盘等价路径和关闭原因，未来 uni-app 按平台重新实现手势层。

## ADR-008：ActionMenu 使用模态 Dialog 语义和原生按钮

ActionMenu 是由明确用户意图触发的底部操作面板，组合 Popup 的 Portal、Mask、焦点圈定、滚动锁和安全区，
不复用 BottomSheet 的拖拽与 snap 引擎。容器使用 `role="dialog"`，各操作使用原生 button；不采用需要
方向键漫游焦点的桌面式 `menu/menuitem` 语义，也不承载选择、勾选和子菜单。危险操作始终移入独立分组并
通过 Dialog 二次确认，异步执行期间同时锁定动作与关闭入口。命令式 API 由 Provider 保留当前 React tree
的主题、语言和 Portal 上下文，未来 uni-app 复用动作顺序、分组、确认和关闭原因契约。

## ADR-009：Picker 使用原生滚动与 listbox 草稿模型

Picker 复用 Popup 的模态边界，每列使用单选 `listbox` 与 `aria-activedescendant`，并保留原生纵向滚动和
CSS scroll snap，不引入独立手势引擎。打开时从已提交值创建 draft；键盘、点按和滚动只更新 draft，确定
才提交，取消类关闭全部回滚。这样既保留移动 WebView 的原生滚动物理，也让键盘、读屏和表单 dirty 状态
拥有确定的等价路径。日期类组件后续只组合该选择模型与 `DateAdapter`，核心包不绑定具体日期库或时区。

## ADR-010：CascadePicker 是 Picker 的无视觉分叉数据适配层

CascadePicker 接收树形 options，并通过纯解析函数生成当前路径对应的 Picker columns、值和选项；Popup、
滚轮、listbox、键盘、焦点、滚动锁和 safe area 全部复用 Picker。父级变化时只保留变化列及其以前的值，
丢弃旧后缀后逐级选择新分支的首个可用项。`children: undefined` 表示叶子，显式 `children: []` 表示
存在但暂为空的下一级并阻止确认，使调用方可通过更新 options 完成异步加载而无需把 Promise 或请求状态
引入基础组件。动态数据归一化保持静默，不伪造用户选择事件；表单仍只在确认时写入完整路径。

## ADR-011：DatePicker 使用 DateAdapter 与精度前缀约束

DatePicker 只把年、月、日、时、分、秒转换为 Picker columns，不在 React 组件里直接调用 `Date` 或绑定
Day.js、date-fns。`date-adapter` v2 提供 parts 往返、日期比较、月份天数、星期、加法、起点、解析和格式化；
默认 `nativeDateAdapter` 使用宿主环境的本地民用时间，自定义日期类型和时区实现显式注入同一契约。
`min / max` 按当前精度比较前缀，使月份、日期和时间列能够逐级禁用；无法从 parts 往返的 DST 跳时和
非法日期直接禁用。低于当前 precision 的字段归一化到单位起点，父级变化把过期日夹紧到目标月末。
组件继续沿用 Picker 的 draft、确认提交、取消回滚、listbox、Popup、焦点和原生滚动；
`MeuFormDatePicker` 只在确认时写入表单字段。

## ADR-012：TimePicker 使用纯 TimeValue，不复用虚构日期

TimePicker 的公开值固定为 `{ hour, minute, second }`，不返回绑定今日日期的 `Date`，也不要求业务引入
Day.js 等日期库。`hourCycle="h12"` 只增加 AM/PM 表示列，回调仍输出规范化的 24 小时值。上下界按当前
精度前缀比较，`min > max` 视为矛盾约束；跨午夜营业区间由业务拆分或使用 filter 明确表达，不做隐式环绕。

组件复用 Picker 的 Popup、滚轮、键盘、焦点、滚动锁、确认式 draft 和取消回滚；`MeuFormTimePicker`
仅在确认时写入 `TimeValue | null`。

## ADR-013：Calendar 保持内联、平台中立并即时提交选择

Calendar 是内联月视图，不内置触发器、Popup、确认栏或业务快捷范围。它通过 `DateAdapter<TDate>` 生成
固定六周网格、比较边界和规范化日期，公开单选、多选与范围三种互斥值类型。范围第一次点按立即返回
`[date, date]` 并标记 `details.complete=false`，第二次点按自动排序端点并标记完成；同日范围保持合法。

日期按钮采用原生 button 和 roving tabindex，方向键、Home / End、PageUp / PageDown 与按年移动拥有触摸
等价路径。`MeuFormCalendar` 每次选择都立即写入表单，并把校验焦点落到真实日期按钮。需要确认/取消、
快捷范围和浮层触发器的流程由 DateRangePicker 组合 Calendar 与 Popup，避免污染基础月历契约。

## ADR-014：DateRangePicker 只提交完整、已确认的范围

DateRangePicker 组合 Calendar 的 range 模式与 Popup，不复制日期网格或浮层基础设施。打开时从已提交值建立
draft：首次点按产生同日草稿但保持 `complete=false`，第二次点按自动排序并完成；即使选择同日，也必须完成
第二次点按。确定按钮只在范围完整且端点满足边界与禁用约束时可用。

快捷范围只替换 draft，不自动确认；取消、遮罩和 Escape 丢弃 draft，确认才提交。核心组件接受
`DateAdapter<TDate>` 并保持日期库、业务时区、路由与接口中立。`MeuFormDateRangePicker` 组合 Field 与
PickerTrigger，只在确认时写入 `readonly [TDate, TDate] | null`，因此取消不触发 dirty，校验焦点回到原生触发按钮。

## ADR-015：PullToRefresh 增强现有滚动边界，不拥有滚动容器

PullToRefresh 包裹内容但不设置固定高度或 `overflow`，默认向上查找最近的可滚动祖先，并且只在其
`scrollTop <= 0` 时开始下拉。复杂宿主可以提供平台中立的 `canPull()`，无需把 HTMLElement 或 Window 泄漏到
公开契约。确认纵向手势后才用 non-passive touchmove 阻止原生滚动；横向手势、向上移动和未越过阈值的下拉
均不触发刷新。

公开状态为 idle / pulling / ready / refreshing / complete。越过 threshold 后松手只调用一次 `onRefresh`，
Promise 完成后短暂显示 complete，失败通过 `onRefreshError` 报告并复位。内容与 indicator 仅使用 transform，
reduced-motion 下缩短复位动画。组件同时提供获得焦点时显现的原生刷新按钮和 `aria-busy` / live status，确保
触摸手势不是唯一操作路径；请求缓存、错误 Toast 和业务空状态仍由调用方负责。

## ADR-016：InfiniteList 以 hasMore 为完成事实源，并保留原生手动入口

InfiniteList 是列表尾部状态与触发器，不拥有列表数据、游标或滚动容器。Web 端默认使用
IntersectionObserver，在 sentinel 进入最近滚动祖先底部 250px 预取区时调用 `loadMore()`；不使用较新的
`scrollMargin`，以保持 iOS 13 与 Chrome / WebView 70+ 兼容。Observer 不可用或 `autoLoad=false` 时，原生
44px“加载更多”按钮仍能完成同一操作。

同步 ref 在状态更新前锁定 Observer、手动按钮和重试入口，确保每轮最多一个 Promise。拒绝后进入 error 且
停止自动重试，由用户显式点击“重试”再次调用同一函数；`hasMore=false` 是唯一 complete 事实源，不根据返回
条数猜测。默认状态通过 live region 与 `aria-busy` 公布；分页数据、请求缓存、错误 Toast 与空状态归调用方。

## ADR-017：Carousel 使用 Embla 作为 Web 手势引擎，Meu 持有行为契约

Carousel 的 React Web 适配层使用 Embla Carousel 8.6.0 处理横向拖拽、snap 和无克隆循环。Embla 采用
MIT 许可，由 David Jerleke 维护；它作为普通运行时依赖保持外置，不被 Rollup 复制进 Meu 产物。公开 API
只暴露 `items`、受控/非受控索引、变更原因、循环、拖拽、自动播放和本地化标签，不暴露 Embla 实例或类型。

Meu 自己实现原生 44px 前后按钮、只读 PaginationDots、轮播与幻灯片语义、失活内容焦点隔离以及自动播放
控制。自动播放默认关闭；启用后提供排在首个 Tab 位置的暂停/播放按钮，焦点进入或拖拽后保持停止，悬停与
页面隐藏只临时暂停。`prefers-reduced-motion` 下不自动启动，只有用户显式播放后才允许用即时切换继续。
自动播放时 live region 为 `off`，停止后为 `polite`。未来 uni-app 复用同一状态和回调契约，替换 Web 手势层。

## ADR-018：SwipeActions 以受控 side 为事实源，Web 手势保持轻量

SwipeActions 只负责把任意内容沿水平方向移动并显露左右动作轨道，不拥有 Cell、列表数据、路由、确认弹窗或
业务 Toast。公开状态固定为 `left | right | null`，同时提供受控与非受控模式；受控调用方没有提交新 side 时，
视觉位移在下一帧恢复到权威状态。关闭回调明确区分 swipe、keyboard、content、outside、escape 和 action。

React Web 适配层直接使用 Pointer Events、ResizeObserver 与 CSS transform，不增加通用手势依赖。移动超过
6px 后才锁定方向，纵向意图交还原生滚动；默认打开阈值为动作轨道宽度的 35%，快速横扫可越过距离阈值。
位移始终限制在已测量轨道内。未来 uni-app 复用 side、方向锁、阈值、动作结果和关闭原因，替换 DOM 测量与
Pointer Events。

动作保留原生 button、44px 最小目标和同步/异步结果。异步期间锁定全部动作；返回 `false` 或失败保持展开，
失败只通过 `onActionError` 上报。隐藏轨道不进入 Tab 顺序，每侧提供获得焦点时显现的原生打开按钮；列表调用方
仍需在 Cell 更多菜单中复制同一动作，确保触摸手势不是发现和执行操作的唯一方式。

## ADR-019：FloatingPanel 与模态 BottomSheet 分离

FloatingPanel 用于地图、行程和筛选等需要同时保留页面背景上下文的常驻面板。它不使用 Portal、Mask、页面
滚动锁或焦点圈定，也没有 open / dismiss 状态；需要这些能力时继续使用 BottomSheet。公开 anchors 统一为正
像素高度并归一化到 44px–可视视口高度，`height / defaultHeight / onHeightChange` 保持受控状态范式，Top 与
Bottom placement 只改变物理增高方向。

React Web 使用 Pointer Events、CSS transform 和有限的速度投影，不引入通用手势或弹簧依赖。44px 原生
handle 提供拖拽、点击、方向键、PageUp / PageDown、Home / End 路径；受控调用方未提交请求高度时视图保持
权威 height。内容区只在未达到最高 anchor 且起点不是交互元素时辅助拖动；最高点完全交回原生纵向滚动，
收起始终可通过 handle 完成，避免 iOS WebKit 的滚动争抢。

命令式 `setHeight()` 只请求最近 anchor，并通过 `imperative` 原因进入同一状态通道，不绕过受控事实源。
未来 uni-app 复用 anchors、height、placement、惯性与 drag / handle / keyboard / imperative 原因，替换
Pointer Events、visualViewport 与 transform。

## ADR-020：VirtualList 使用 TanStack Virtual，公开平台中立契约

VirtualList 首版只支持组件自身的纵向滚动容器，不同时承诺横向、网格、瀑布流或 window scroll。公开 API
固定为 items、稳定 `getItemKey`、像素 height、尺寸估算、overscan、范围回调和命令式定位；分页、选择、树结构、
请求与业务空状态都留给调用方。明确的 height、initialOffset 与 estimateSize 生成确定的 SSR 初始窗口。

React Web 适配层使用 MIT 许可的 `@tanstack/react-virtual` 3.14.10，其 core 依赖为 3.17.8。它负责滚动观察、
动态测量、滚动锚定和 iOS WebKit 的延迟尺寸修正，但任何 TanStack 实例或类型都不进入 Meu 公共 API。Next
消费者必须 transpile React Virtual 与 Virtual Core，保证其外置 ESM 依赖不会越过 Chrome/WebView 70+、
iOS 13 的语法基线。

外层固定为带可访问名称的 `role=list`；挂载行使用 `role=listitem`、1-based `aria-posinset` 与完整
`aria-setsize`。range callback 报告可见与常规 overscan 边界。焦点所在行会由自定义 range extractor 强制保留，
但不会被计入连续 overscan 范围；焦点离开列表后恢复常规卸载。未来 uni-app 复用数据、key、范围与定位契约，
替换 Web 引擎。
