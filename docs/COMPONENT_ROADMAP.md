# Meu Mobile 组件路线图

路线按依赖深度推进：先完成可被其他组件复用的原子能力，再做输入、展示、导航和反馈，最后处理
Picker、手势与高成本复合组件。分类参考 Ant Design Mobile 等成熟移动组件库，但 API、视觉和兼容
策略以 Meu 设计契约为准。

## Batch 0：工程与基础能力（已完成）

- tokens、主题和 ConfigProvider
- SVG 图标数据与 React 渲染层
- Portal、VisuallyHidden
- Button、Field、TextInput
- React Hook Form + Zod 集成
- Storybook、独立文档站、隔离 Next H5 测试

## Batch 1：通用与布局（已完成）

- IconButton
- Space
- Divider
- SafeArea

完成标准：公开类型、Vanilla Extract 样式、单测、Storybook、README、深色主题与 44 px 触控区域。

## 表单集成加固（已完成）

- 嵌套字段与动态数组字段
- 同步/异步校验、dirty/touched/submitting、reset/watch/trigger
- 路径化服务端错误映射与首次错误聚焦
- Storybook 集成示例和 React 测试覆盖

## Batch 2：基础信息录入（已完成）

- Batch 2A：TextArea、SearchField（已完成）
- Batch 2B：Checkbox、CheckboxGroup、Radio、RadioGroup、Switch（已完成）
- Batch 2C：Stepper、Slider、Rate、Selector（已完成）

重点：受控/非受控契约、键盘和读屏语义、Field/Form 集成、错误与禁用态。

## Batch 3：信息展示与导航（已完成）

- Batch 3A：Cell、List（已完成）
- Batch 3B1：Tag、Badge、Avatar、Image、Ellipsis（已完成）
- Batch 3B2：Card、Collapse（已完成）
- Batch 3C1：NavBar、SegmentedControl、PaginationDots（已完成）
- Batch 3C2：Tabs、TabBar、Steps（已完成）

重点：先完成 Cell/List，再基于它们组装导航与列表型组件。

## Batch 4：反馈与浮层（已完成）

- Batch 4A：Progress、Skeleton、Empty、Result（已完成）
- Batch 4B：浮层基础设施、Mask、Popup（已完成）
- Batch 4C：Dialog、Toast（已完成）
- Batch 4D：Popover（已完成）、BottomSheet（已完成）、ActionMenu（已完成）

重点：统一 Portal、焦点捕获与恢复、滚动锁、Escape、reduced motion 和命令式 helper 的可替换性。

## Batch 5：选择器与复合输入

- Picker（已完成）、CascadePicker（已完成）、DatePicker（已完成）、TimePicker（已完成）、Calendar（已完成）、DateRangePicker（已完成）

重点：复用 `date-adapter`，核心包不绑定具体日期库和业务时区。

## Batch 6：手势、高成本与业务验证组件

- PullToRefresh、InfiniteList、Carousel、SwipeActions、FloatingPanel
- ImageViewer、ImageUploader、NumberKeyboard、PasscodeInput、TreeSelect、VirtualList、Watermark

重点：只有完成 iOS Safari、Android Chrome、性能和替代操作路径验证后才能进入稳定 API。

## 每批交付流程

1. 从 `meu-design` 固化组件契约和状态矩阵。
2. 完成代码、Storybook、独立文档站示例和 Figma 组件。
3. 通过单测、类型、lint、构建、兼容扫描和隔离 Next H5 E2E。
4. 使用 changeset 记录公开 API；当前包保持 `private`，不发布 npm。
5. 每批独立提交，避免一个提交同时跨越多个依赖层级。
