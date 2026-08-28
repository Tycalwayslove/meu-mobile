# Design System: Meu Mobile

## 1. Visual Theme & Atmosphere

Meu Mobile 是一套克制、可靠、面向高频任务的移动产品语言。整体像一件做工精确的随身工具：低饱和纸白底色、深墨文字、单一松柏绿强调色。信息密度为 7/10，视觉变化为 2/10，动效强度为 4/10；优先级通过排版、留白与结构线表达，而非大面积卡片、渐变或装饰。

页面遵循单列流式阅读。主内容左右留白 16 px，分组间距 24 px；列表用分隔线表达层级，只有浮层、可操作摘要和关键结果可以使用 Surface 卡片。所有内容处于清晰空间内，不重叠。

## 2. Color Palette & Roles

### Light

- **Rice Canvas** (`#F8F7F3`) — 应用背景与页面底。
- **Porcelain Surface** (`#FFFFFF`) — 浮层、输入框、必要的卡片表面。
- **Ink 900** (`#1E2420`) — 主文字、图标、强对比边框；绝不使用纯黑。
- **Ink 600** (`#5B625D`) — 次级文字、说明、非激活图标。
- **Ink 300** (`#CDD1CC`) — 常规 1 px 分隔线与输入框边框。
- **Ink 100** (`#EAECE7`) — 禁用背景、悬停底色。
- **Pine Accent** (`#176B5B`) — 唯一品牌强调色：主按钮、选择态、焦点环与进度。
- **Success** (`#287A52`)、**Warning** (`#A45C13`)、**Danger** (`#B63A36`) — 仅用于语义反馈，不能作为品牌主色或大面积背景。

### Dark

- **Night Canvas** (`#161A17`) — 应用背景。
- **Night Surface** (`#202620`) — 容器与浮层。
- **Night Ink** (`#F0F2EC`) — 主文字。
- **Night Muted** (`#B7BDB5`) — 次级文字。
- **Night Border** (`#3A423B`) — 结构线。
- **Pine Accent Dark** (`#62B89D`) — 深色模式的主强调色。

所有正文与背景必须达到 WCAG AA：正常文字对比度至少 4.5:1，大号文字和非文字 UI 至少 3:1。禁止霓虹、外发光、彩虹渐变和第二品牌强调色。

## 3. Typography Rules

- **UI / Latin:** `Geist`, `Noto Sans SC`, `PingFang SC`, sans-serif。`Geist` 用于拉丁数字和英文，`Noto Sans SC` 用于中文；交付时自托管并做字重子集化。
- **Mono:** `Geist Mono`, `SFMono-Regular`, monospace。仅用于金额、订单号、时间码等需要纵向对齐的数据。
- **Display:** 24 / 30 px，600；仅页标题和结果页标题使用。
- **Title:** 20 / 28 px，600；分区标题。
- **Body:** 16 / 24 px，400；默认正文。
- **Label:** 14 / 20 px，500；字段标签、列表辅助信息。
- **Meta:** 12 / 16 px，400；次要元数据。

中文不做负字距；拉丁大标题可使用 `-0.01em`。正文单行不强制截断；截断内容必须提供完整名称的 `aria-label` 或详情入口。禁止 Inter、通用衬线字体和纯装饰性大标题。

## 4. Spatial, Shape & Elevation Rules

- 基础空间单位为 4 px；可用档位仅为 4、8、12、16、20、24、32、40、48。
- 默认页边距 16 px；全宽列表只在行内容内缩 16 px；底部固定操作区为 16 px，并叠加安全区。
- 圆角：控件 10 px，容器 14 px，底部面板 20 px 20 px 0 0，头像 50%。不使用药丸形卡片。
- 阴影只用于浮在页面之上的临时层：`0 12px 32px rgba(24, 32, 26, .16)`；其余层级用边框和背景差表示。
- 控件高度：compact 32 px，small 36 px，medium 44 px，large 52 px。任何可点击区域不得小于 44 px。

## 5. Component Stylings

- **Button:** 主要按钮为 Pine Accent 实色、白字、10 px 圆角；次要按钮为透明表面与 Ink 300 边框；文字按钮无底框。按下仅 `translateY(1px)` 并轻微压暗，禁用态不得只靠透明度表达。
- **Field / Input:** 标签固定在输入区上方。输入高度 44 px，默认边框 Ink 300，聚焦为 2 px Pine 焦点环；错误文字位于控件下方并附图标/文本，不能只靠红色。
- **Cell / List:** 每行最小 52 px，标题左对齐，辅助信息右对齐或置于第二行。整行可点击时显示可访问的链接/按钮语义；不可点击行不伪装成按钮。
- **Selection:** 单选和复选保持原生语义。选中态使用 Pine Accent + 勾选图形 + `aria-checked`，不只改变颜色。
- **Feedback:** Toast 只反馈短、可逆操作；有后果的操作使用 Dialog 或 BottomSheet。删除类操作必须明确动词并置于安全操作之后。
- **Loading:** 用贴合最终布局的 Skeleton；行内异步操作用小型静态进度标记。避免无限旋转的主加载器，除非确实无法确定时长。

## 6. Navigation, Layout & Responsive Rules

手机基准宽度为 360–430 CSS px，设计先满足此区间。窄于 360 px 时保留 16 px 主边距但允许按钮文案折行；宽于 600 px 时只扩大内容容器至最大 640 px，不把手机控件拉成桌面面板。

NavBar 顶部高度 56 px，TabBar 底部高度 56 px，均考虑 `env(safe-area-inset-*)`。顶部与底部固定区必须为滚动内容保留真实空间；不依赖绝对定位覆盖内容。列表、表单、页面底操作区均采用单列。

## 7. Motion & Interaction

- 默认过渡：进入 180 ms、退出 140 ms；使用 `cubic-bezier(.2,.8,.2,1)`。
- BottomSheet、Dialog 使用 `transform` 和 `opacity`，不得动画化 `top`、`height`、`width` 或 `left`。
- 下拉刷新、滑动操作、轮盘选择必须可中断、可回退，并遵守触摸滚动的自然方向。
- `prefers-reduced-motion: reduce` 时移除位移与骨架 shimmer，保留不超过 1 ms 的状态切换。
- 无永久装饰性动效；只有加载、同步等进行中的任务能出现循环动效。

## 8. Accessibility & Content Rules

- 焦点顺序与视觉顺序一致；Dialog 打开后焦点进入标题或首个可操作项，关闭后返回触发元素。
- Icon-only 按钮必须有明确 `aria-label`；图片有功能时提供替代文本，纯装饰图 `alt=""`。
- 状态与错误用文字、图标、形状共同表达；动态通知用适当的 `aria-live`，不打断输入。
- 文案使用具体动作：`保存更改`、`删除这条记录`，不使用含糊的 `确定`（除非上下文已完整说明）。

## 9. Anti-Patterns (Banned)

- 不使用纯黑、霓虹发光、夸张渐变、玻璃拟态、漂浮装饰粒子或自定义鼠标。
- 不使用 Inter、通用衬线字体、emoji 作为 UI 图标、三等分功能卡片或无意义大圆角卡片墙。
- 不使用只靠颜色表达状态、低于 44 px 的可点区域、无标签输入框、无焦点管理的浮层。
- 不让内容被固定 TabBar / 操作条遮挡；不制造无法取消的加载或手势死锁。
- 不写「无缝」「下一代」「立即开启」等泛化 AI 文案，也不使用虚构姓名和假精确数据。
