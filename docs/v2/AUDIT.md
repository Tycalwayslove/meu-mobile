# Meu Mobile V2 现状审计

审计日期：2026-08-28

本文件记录 V2 启动时的可复查基线。它不代表组件已经达到商用质量；后续每批次完成后都必须更新对应组件的留存文档、质量证据和本审计中的剩余问题。

> 说明：下方“可复查基线”和“系统性风险”保留 2026-08-28 启动时事实，不能当作当前仓库状态。最新进度见文末“阶段复查”。

## 结论

V1 已经具备可观的组件数量、基础单测和视觉展示，但尚未形成可证明的商用闭环。主要缺口集中在四处：

1. 官网的 68 个产品条目不能完整覆盖全部公开导出；
2. Props、Events、Ref 与行为说明没有稳定事实源，官网示例也不是逐组件维护；
3. Storybook 以静态展示为主，缺少交互、无障碍、RTL、字号和兼容矩阵证明；
4. 现有兼容脚本只证明少量语法与选择器，不足以证明旧版 Safari、WebView 和复杂手势可用。

因此 V2 必须先完成文档模型和质量门禁，再按依赖顺序优化组件。旧版 [`COMPONENT_ROADMAP.md`](../COMPONENT_ROADMAP.md) 的“完成”表示 V1 文件已交付，不等同 V2 商用验收通过。

## 可复查基线

| 项目            | 当前事实                                                        | V2 要求                                                                     |
| --------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 官网产品条目    | `apps/docs/app/_data/components.ts` 登记 68 个组件族            | 每个条目映射全部公开导出，不能遗漏 Provider、Trigger、Group 或 form adapter |
| 公开 API        | 四个运行时包合计约 102 个大写组件或子组件导出                   | CI 从入口文件生成 manifest，并校验 100% 文档覆盖                            |
| 组件 README     | mobile 62 个源码目录、59 份 README，其中 34 份不超过 5 行       | 迁移为源码共置的 `Component.docs.mdx`，README 最终只保留入口指针            |
| Storybook       | 75 个 story 文件、248 个 story exports                          | 每个公开组件至少有可执行示例、Autodocs、关键 `play`、axe 和视觉矩阵         |
| Story 交互      | `play` function 为 0                                            | P0/P1 关键路径必须在真实浏览器中执行                                        |
| 官网 Story 链接 | 63 个链接中审计发现 35 个失效，另有 5 个页面无 Story 链接       | 从 Storybook index 读取显式 ID，禁止猜测 `--default`                        |
| 官网 Demo       | 50 个页面复用分类级 Demo；18 个有相对独立预览                   | 每个页面使用组件专属、可复制、能运行的真实示例                              |
| API 文档        | 页面没有结构化 Props、Events、Methods、默认值和变更记录         | TypeScript/TSDoc + API Extractor 自动生成，MDX 只补充行为约束               |
| 单元测试        | mobile 最近记录 277/277、form-react 31/31 通过                  | 增加 axe、SSR/hydration、RTL、reduced-motion、表单和手势辅助工具            |
| Next H5 E2E     | 本地 `tests/next-h5/.test-results/.last-run.json` 当前为 passed | Chromium 与 WebKit 必须在 CI 稳定全绿，且不允许 flaky                       |
| 真机兼容        | 目前没有可追踪的真实 iOS/Android 验收记录                       | 发布候选至少完成一次 Safari/VoiceOver 和 Chrome/TalkBack 验收               |
| 兼容脚本        | `scripts/check-client-compat.mjs` 只扫描少量 JS/CSS 语法        | 增加 Web API 能力检查、fallback 测试和明确的分级支持矩阵                    |

## 信息架构缺口

官网目前通过 [`components.ts`](../../apps/docs/app/_data/components.ts) 维护标题、简介、亮点和猜测出的 Story ID；[`page.tsx`](../../apps/docs/app/components/[slug]/page.tsx) 再渲染通用 `<Component />` 代码片段。这种模型无法表达必填 Props、受控与非受控、事件时序、Ref、键盘、兼容性和限制。

V2 采用以下事实源：

- TypeScript 声明与 TSDoc：Props、Events、Ref、默认值和弃用信息；
- 源码共置 `Component.docs.mdx`：场景、行为、无障碍、动效、兼容、限制和变更记录；
- Storybook index：稳定的示例 ID 与可执行示例；
- Figma node：设计状态、Token 和视觉验收入口；
- 测试与 CI 产物：只记录实际运行过的质量证据。

文档索引器合并这些输入并生成只读 manifest，官网只消费 manifest，不再维护第二套手工 API 表。

## 系统性风险

### 基础设施

- `Portal`、`useFocusTrap`、`useBodyScrollLock` 是所有模态浮层的共同基础，但缺少独立单测与嵌套场景证明。
- `ConfigProvider`、`ThemeProvider` 缺少完整 test/story/docs；locale、direction、motion 和 portal container 尚未形成统一契约。
- `@meu/test-utils` 当前主要提供基础 render，缺少 axe、SSR、pointer、form、locale/RTL 和 reduced-motion helpers。

### 国际化与方向

- 目前只有少数组件明确验证 RTL；代码仍存在方向性 `left/right` 或 margin 属性。
- 多个组件包含硬编码中文 accessible label 或状态文案，不能仅靠 ConfigProvider 的 locale 声明证明国际化完成。

### 动效与手势

- Story 中没有交互测试，无法证明 pointer cancel、滚动竞争、动画反向、卸载清理和 reduced-motion。
- reduced-motion 规则尚未覆盖全部动效；部分 spinner 只是减速，并未提供静态替代。

### 浏览器与 WebView

- `Carousel` 等组件直接依赖较新的媒体查询监听方式；Picker、PullToRefresh、SwipeActions、BottomSheet、ImageViewer 依赖滚动、指针、ResizeObserver、visualViewport 或 Pointer Capture 的浏览器差异。
- “Chrome 70 / iOS 13”目前只能视为旧语法扫描目标，不能作为完整运行时支持承诺。V2 提议完整支持 iOS/WKWebView 15+ 与 Android WebView/Chrome 89+，更早版本进入观察档并按组件记录降级。

### 包与消费边界

- V2 Web 首发已冻结为 React 19 与 Next.js 16 App Router；React 18、Next 14–15 和 Pages Router 未经独立消费者验证，不作支持承诺。精确版本、peer 与扩展准入条件见 [`SUPPORT_MATRIX.md`](./SUPPORT_MATRIX.md)。
- uni-app 仍是后续适配边界；V2 Web 组件不应伪装为可直接运行的 uni-app 原生组件，但 Token、行为契约和平台无关逻辑需要可复用。

## 最高风险组件族

| 优先级 | 组件族                              | 原因                               | V2 首要证明                                            |
| ------ | ----------------------------------- | ---------------------------------- | ------------------------------------------------------ |
| 1      | Portal / FocusTrap / BodyScrollLock | 所有模态基础，缺少独立测试         | 嵌套浮层、多锁、焦点恢复、iOS fixed body、卸载清理     |
| 2      | ConfigProvider / ThemeProvider      | 全局配置基础缺少完整证明           | SSR、嵌套覆盖、system 主题首屏、locale/dir/motion 传播 |
| 3      | BottomSheet                         | snap、drag、键盘和内部滚动交接复杂 | pointer cancel、visual viewport、动态高度、iOS 真机    |
| 4      | Carousel                            | 自动播放、循环、可见性和手势竞争   | fallback、暂停机制、键盘、RTL、reduced-motion          |
| 5      | PullToRefresh                       | Safari 橡皮筋与滚动容器边界敏感    | 嵌套滚动、取消、失败恢复、显式按钮替代                 |
| 6      | SwipeActions                        | 自研 pointer/transform 状态机      | lost capture、滚动仲裁、异步动作、RTL                  |
| 7      | Picker 族                           | 五个上层组件共享滚轮基础           | 惯性滚动、动态列、禁用项、键盘与读屏                   |
| 8      | ImageViewer                         | pinch、双击、拖移与轮播组合        | 多指取消、边界回弹、资源清理、内存                     |
| 9      | TreeSelect                          | 异步、虚拟化、树语义和弹层组合     | 竞态、缓存/重试、焦点虚拟行、10k 节点                  |
| 10     | VirtualList                         | 测量、回收、SSR 和焦点相互影响     | 动态高度、scroll anchoring、hydration、iOS 延迟测量    |

`ImageUploader` 作为紧随其后的高风险项，需重点处理 Abort、object URL、并发、重试、卸载清理和错误恢复。

## 推荐实施顺序

1. **Batch 0：商用门禁与文档模型**——公开 API manifest、API Extractor、docs schema、Story index、测试工具和 CI。
2. **Foundations**——Token、Icon、Config/Theme/i18n、Portal、VisuallyHidden、focus/scroll、SafeArea、Field。
3. **原子操作与输入**——Button、IconButton、文本输入、选择控件、数值输入和完整 Form adapters。
4. **信息与导航**——内容结构、路由语义、键盘、RTL、长文本和响应式。
5. **Overlay 栈**——Mask → Popup → Dialog/Toast → Popover → BottomSheet → ActionMenu。
6. **Picker 栈**——先稳定 PickerWheel，再扩展级联、日期、日历、时间和表单适配。
7. **集合与手势**——PullToRefresh、InfiniteList、Carousel、SwipeActions、FloatingPanel。
8. **高级组件**——NumberKeyboard、PasscodeInput、ImageViewer/Uploader、VirtualList、TreeSelect、Watermark。
9. **发布候选**——全量文档、视觉、交互、兼容、性能、真机和独立 Next H5 回归。

68 个组件族各自的优化主轴见 [`COMPONENT_PLAN.md`](./COMPONENT_PLAN.md)，单组件交付格式见 [`COMPONENT_DOC_TEMPLATE.md`](./COMPONENT_DOC_TEMPLATE.md)。

## 权威证据入口

- 官网目录：`apps/docs/app/_data/components.ts`
- 官网组件页：`apps/docs/app/components/[slug]/page.tsx`
- 官网预览分派：`apps/docs/app/_components/ComponentPreview.tsx`
- Storybook 配置：`apps/storybook/.storybook/main.ts`、`apps/storybook/.storybook/preview.tsx`
- 包公开入口：`packages/*/src/index.ts`
- 测试工具：`packages/test-utils/src/index.tsx`
- 兼容扫描：`scripts/check-client-compat.mjs`
- GitHub 质量流程：`.github/workflows/quality.yml`
- V1 路线图：`docs/COMPONENT_ROADMAP.md`

## 阶段复查：2026-08-29

已由当前仓库命令重新生成或执行的证据：

- `docs:manifest:report`：68 个产品条目、125 个公开值、371 个公开类型、68 份共置文档，未认领值与覆盖问题均为 0。
- 68/68 个产品条目状态为 `verification`；尚无条目提前标记为 `commercial`。
- `api:properties:strict`：222 个结构化类型、2263 个字段、2263 个已描述字段、237 个事件，公开字段文档覆盖率 100%。
- `api:extract:strict`：mobile、form-react、icons-react、primitives-react 四包均为 0 warning；公开声明全部具有明确 release tag。
- `storybook:validate-links`：68 个组件链接、374 个 Story、342 个文档 Story ID 全部有效；Autodocs 覆盖所有链接标题，80 个标题均至少有一项关键 `play`。
- `check-storybook-a11y.mjs`：390×844 视口逐一运行 374 个 Story × 7 场景（Light、Dark、en-US、RTL、reduced-motion、200% 字体、forced-colors）；有 `play` 时必须先成功结束，再执行 axe WCAG A/AA，2,618 个组合全部通过且无 `pageerror`。
- 官网的共享分类 Demo 已按 slug 拆成组件专属焦点预览，Props / Events 读取完整生成 API 模型。
- 官网生产构建已通过 68 个组件页 × Light/Dark 的本地浏览器门禁，覆盖主题恢复、H1/预览/API 结构、React 页面与控制台异常（含 hydration mismatch）及 axe WCAG A/AA，共 136 个场景。
- `bundle:size:check`：68 个产品族与 125 个公开运行时值均在分级 gzip 预算内；共享 CSS 为 22,670 B / 32 KiB，逐组件结果已同步到留存文档。
- 隔离 Next H5：完整套件在移动 Chromium/WebKit 中 92/92 通过，每条用例均断言 0 `pageerror`、0 `console.error`；除基础布局、IconButton、自定义 Portal、VisuallyHidden 与真实 Field/TextInput/TextArea 外，还直接验证 system Light/Dark Token、reduced-motion 计算值、PullToRefresh 的真实滚动祖先边界/方向仲裁/请求锁/touchcancel，以及 Slider/Rate 的可信鼠标 pointer 拖动、单次完成、重复点击清零和合成 cancel 收敛；8 个初始 open Portal/测量/手势 hydration 案例在两种引擎均通过。
- 运行时性能：10,000 行 VirtualList、1,500 节点 TreeSelect 与 SwipeActions 240 次 pointermove 均在仓库预算内，详见 `PERFORMANCE.md`。
- 客户端兼容静态扫描通过 198 个构建文件；它仍只证明旧语法/选择器基线，不构成旧 WebView 完整支持承诺。

仍阻断 `commercial` 的共性事项：真实 iOS/Android 与读屏记录、旧 WebView 运行时抽测、持续手势帧率/内存/弱网专项、图标许可与分发方式的法务复核，以及最终集中执行的 Chromatic 视觉审批和 Vercel 官网发布。设备矩阵、场景与记录格式见 [`DEVICE_VERIFICATION.md`](./DEVICE_VERIFICATION.md)，最终候选签字表见 [`RELEASE_ACCEPTANCE.md`](./RELEASE_ACCEPTANCE.md)。
