# Meu Mobile V2 组件优化台账

本台账覆盖官网现有 68 个组件族。102 个公开组件/子组件导出必须映射到其中一个组件族；Provider、Trigger、Group、Form adapter 等不能因不单独占页面而漏掉 API 和测试。

初始状态统一为 `audit`。具体实现前还需把每个公开组件扩展为与源码共置的 `Component.docs.mdx`，并记录真实完成证据。

## Batch 1：基础与高频输入

| 组件族         | 包含导出                        | 独立优化重点                                                                         |
| -------------- | ------------------------------- | ------------------------------------------------------------------------------------ |
| ConfigProvider | ConfigProvider                  | 增加 `dir`、motion、locale 与 portal 全局契约；验证 SSR、嵌套覆盖和 hydration 稳定性 |
| ThemeProvider  | ThemeProvider                   | 明确与 ConfigProvider 的别名边界；解决 system 首屏闪烁、主题持久化和高对比模式       |
| Portal         | Portal                          | 统一 container 优先级、SSR 原地降级、销毁清理和跨文档边界                            |
| SafeArea       | SafeArea                        | `env()` fallback、横竖屏、底部键盘与嵌套安全区验证，不承担 fixed 定位                |
| Icon           | MeuIcon 与 Meu 命名图标         | 完成来源/许可清单、装饰/语义模式、RTL 图标规则、尺寸与描边 Token                     |
| Space          | Space                           | 使用逻辑方向、Token gap、wrap/对齐边界；验证旧 WebView flex gap 策略                 |
| Divider        | Divider                         | separator 语义、垂直方向、带文案布局、长文本与高对比可见性                           |
| VisuallyHidden | VisuallyHidden                  | 读屏隐藏、可聚焦内容与 forced-colors 验证，避免被全局样式破坏                        |
| Button         | Button                          | 默认 `type=button`、加载保宽、防重复提交、按压/焦点状态、图标间距与表单行为          |
| IconButton     | IconButton                      | 强制可访问名称、44×44 触控、loading/disabled、pressed 反馈与图标装饰语义             |
| Field          | Field                           | 自动 ID、label/description/error/required 关联、错误聚焦、嵌套字段和布局模式         |
| Form           | MeuForm 与全部 MeuForm adapters | 建立 adapter 矩阵、原生 FormData、RHF/Zod、服务端错误、dirty/touched 与首次错误聚焦  |
| TextInput      | TextInput                       | IME、autofill、password、inputMode、清除、selection、只读/禁用与错误状态             |
| TextArea       | TextArea                        | autosize 上下限、IME、字符计数、粘贴、滚动保持和字号放大                             |
| SearchField    | SearchField                     | 原生 search 语义、Enter/clear/loading、组合输入、请求所有权与取消边界                |
| Checkbox       | Checkbox、CheckboxGroup         | indeterminate、组值、原生 name/FormData、最大点击区、键盘和错误语义                  |
| RadioGroup     | Radio、RadioGroup               | 同名 radio、方向键/roving、受控空值、RTL、禁用项与 FormData                          |
| Switch         | Switch                          | 即时生效语义、loading/readOnly、异步回滚、键盘、表单 adapter 与状态文案              |
| Stepper        | Stepper                         | 空值、中间输入态、浮点精度、边界、长按重复、键盘与移动数字键盘                       |
| Slider         | Slider                          | pointer/keyboard、marks、`aria-valuetext`、完成事件、RTL 与拖动替代                  |
| Rate           | Rate                            | 单选语义、半星/清空策略、只读和禁用差异、键盘路径与可访问值文本                      |
| Selector       | Selector                        | 单/多选、最大选择数、只读、禁用项、清空策略、长文案与表单数组                        |

## Batch 2：浮层与反馈

| 组件族      | 包含导出                       | 独立优化重点                                                                  |
| ----------- | ------------------------------ | ----------------------------------------------------------------------------- |
| Mask        | Mask                           | z-index 层级、透明度 Token、pointer cancel、点击穿透、滚动和 reduced-motion   |
| Popup       | Popup                          | 统一 Portal/Mask/焦点/滚动锁、四方向动画、安全区、退出后卸载与关闭原因        |
| Toast       | Toast、ToastProvider           | 队列、去重、live region、最短停留、hover/focus 暂停、关键消息与作用域         |
| Dialog      | Dialog、DialogProvider         | inert、焦点进入/圈定/恢复、Esc、异步动作、危险确认、关闭原因和嵌套策略        |
| BottomSheet | BottomSheet                    | modal/modeless 边界、snap、拖拽阈值、橡皮筋、键盘、安全区与可中断动画         |
| ActionMenu  | ActionMenu、ActionMenuProvider | 采用 action sheet 对话框语义、异步动作、危险二次确认、分组与返回焦点          |
| Popover     | Popover                        | 信息/交互模式、flip/shift/arrow、锚点消失、滚动 resize、外部点击与焦点恢复    |
| Progress    | Progress                       | determinate/indeterminate、数值格式、读屏公告节流、尺寸/颜色和 reduced-motion |
| Skeleton    | Skeleton                       | 与内容结构一致、组合形状、aria-busy、主题和 reduced-motion，无布局跳动        |
| Empty       | Empty                          | 场景化插图与文案、主次操作语义、窄屏/长文案、无数据与错误边界                 |
| Result      | Result                         | success/warning/error/pending 语义、操作区层级、读屏标题与业务恢复路径        |

## Batch 3：导航与信息展示

| 组件族           | 包含导出         | 独立优化重点                                                              |
| ---------------- | ---------------- | ------------------------------------------------------------------------- |
| NavBar           | NavBar           | 返回按钮与链接语义、Safe Area、长标题、左右插槽平衡、滚动状态和路由解耦   |
| Tabs             | Tabs             | APG tablist、自动/手动激活、Home/End、滚动入视、懒加载、指示器动效与 RTL  |
| SegmentedControl | SegmentedControl | 明确 tabs/radiogroup 模式、滑动指示器、键盘、禁用项、长文案和 RTL         |
| TabBar           | TabBar           | nav/link 与 `aria-current`、Badge、Safe Area、键盘、路由状态和横屏布局    |
| IndexList        | IndexList        | sticky 标题、字母拖动/点击/键盘替代、滚动定位、动态数据、RTL 和性能       |
| SideNav          | SideNav          | 长列表滚动、激活项入视、键盘、嵌套项、sticky 边界、RTL 与内容关联         |
| Cell             | Cell             | 默认非交互；link/button 根语义、禁止嵌套交互、插槽对齐、长文本和加载态    |
| List             | List             | list/group 语义、header/footer、分隔规则、可选择/可点击边界和虚拟化接口   |
| Card             | Card             | 非交互/链接/按钮语义边界、媒体比例、操作区、嵌套点击和主题层级            |
| Tag              | Tag              | 状态/筛选/可关闭模式分离、键盘删除、颜色语义、长文本和组合使用            |
| Badge            | Badge            | dot/count/status、max、零值、定位、读屏文案、颜色之外的状态表达           |
| Avatar           | Avatar           | 图片错误、initials fallback、alt 策略、shape/size、加载与组合头像边界     |
| Image            | Image            | 固定尺寸占位、lazy/decoding、alt、错误/重试、object-fit、响应式与 CLS     |
| Collapse         | Collapse         | disclosure/accordion、受控状态、键盘、动态高度动画、嵌套和 reduced-motion |
| Ellipsis         | Ellipsis         | 多行/头尾省略、展开收起按钮、测量与 ResizeObserver fallback、复制可达性   |
| Steps            | Steps            | 有序列表、`aria-current=step`、状态、横/竖布局、长标题和响应式            |
| PaginationDots   | PaginationDots   | 展示/可操作模式、页码名称、超多页压缩、方向、RTL 与 Carousel 联动         |

## Batch 4：集合与手势

| 组件族        | 包含导出      | 独立优化重点                                                               |
| ------------- | ------------- | -------------------------------------------------------------------------- |
| PullToRefresh | PullToRefresh | overscroll 冲突、pointer cancel、阈值、明确刷新按钮、状态公告和失败恢复    |
| InfiniteList  | InfiniteList  | loading/error/retry/end、IntersectionObserver fallback、焦点保持和追加性能 |
| Carousel      | Carousel      | 默认不自动播放；暂停机制、键盘/按钮、触摸仲裁、RTL、可见页公告与性能       |
| SwipeActions  | SwipeActions  | 滑动阈值、滚动仲裁、动作按钮替代、危险确认、异步锁、RTL 和列表协作         |
| FloatingPanel | FloatingPanel | snap 状态机、drag handle、按钮/键盘替代、滚动移交、modeless 默认与性能     |

## Batch 5：Picker 与日期时间

| 组件族          | 包含导出              | 独立优化重点                                                               |
| --------------- | --------------------- | -------------------------------------------------------------------------- |
| Picker          | Picker、PickerTrigger | 草稿/确认/取消、滚轮与键盘、disabled/empty/loading、安全区和关闭原因       |
| CascadePicker   | CascadePicker         | 异步级联、加载/错误、路径失效清理、稳定 key、列变化与确认值                |
| DatePicker      | DatePicker            | date-only 数据模型、时区边界、precision/filter、locale、min/max 与文本替代 |
| Calendar        | Calendar              | APG grid、周起始日、跨月、禁用日、今天、单选/范围、键盘和移动滚动          |
| DateRangePicker | DateRangePicker       | 起止状态、同日范围、反向选择、hover/触摸预览、清空、限制与格式化           |
| TimePicker      | TimePicker            | 12/24h、步长、禁用时段、跨日语义、键盘/文本替代与 locale                   |

## Batch 6：高级组件

| 组件族         | 包含导出                              | 独立优化重点                                                                        |
| -------------- | ------------------------------------- | ----------------------------------------------------------------------------------- |
| ImageViewer    | ImageViewer                           | pinch/双击/拖移/翻页仲裁、焦点/关闭、caption/alt、背景锁和资源清理                  |
| ImageUploader  | ImageUploader                         | 原生 file input、类型/大小/数量、压缩边界、进度、取消/重试、删除确认与 URL 回收     |
| NumberKeyboard | NumberKeyboard、NumberKeyboardTrigger | 输入焦点、非模态、decimal/extra、长按删除、关闭原因、随机顺序安全声明               |
| PasscodeInput  | PasscodeInput                         | 单一真实 input、OTP/SMS autofill、paste、mask、IME、完成事件、RTL 与键盘组合        |
| TreeSelect     | TreeSelect                            | 单/多选路径、展开、异步加载、筛选、虚拟化、键盘树语义、移动两栏与 RTL               |
| VirtualList    | VirtualList                           | 稳定 key、overscan、动态高度、滚动恢复、SSR 首屏、焦点项回收与读屏位置              |
| Watermark      | Watermark                             | text/image/multiline、ResizeObserver、打印/截图边界、`aria-hidden` 与非安全能力声明 |

## Batch 0 横切任务

1. 建立公开导出到组件 docs entry 的 manifest，并在 CI 做 100% 覆盖检查。
2. 启用 API Extractor API report/doc model；所有公开 Props/Events/Ref 补 TSDoc。
3. 扩展 `@meu/test-utils`：render、axe、SSR/hydration、pointer/gesture、form、locale/RTL、reduced-motion。
4. 建立统一 overlay、motion、press/focus 与 scroll-lock 契约，先供后续批次复用。
5. 修复 35 个失效 Story 链接，为无 Story 的公开组件补齐 Story；添加 Autodocs、交互测试、主题/locale/RTL/字号工具栏与移动 viewport 矩阵。
6. 增加 bundle-size、API Extractor、文档完整性、CSS Token 和兼容性门禁。
7. 固化 Chromium/WebKit E2E 稳定性门禁，历史失败与 flaky 必须有回归用例，禁止带红灯进入组件优化批次。
