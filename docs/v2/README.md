# Meu Mobile V2 商用化计划

## 目标

V2 不是扩充组件数量，而是把现有组件从“能展示”提升为“可在真实移动商城长期使用”。完成时必须同时满足：

- 每个公开组件族都有明确、稳定且可迁移的 API 与事件契约；
- 样式、状态、动效、触摸、键盘、读屏、SSR、RTL 和 WebView 行为经过验证；
- 每个组件都有一份永久留存文档，代码变更必须同步更新；
- 官网从留存文档与类型清单生成完整用法、Props、Events、Ref、Token、兼容性与示例；
- 当前不发布 npm，先通过 workspace、官网、Storybook 与隔离 Next H5 测试站完成商用验收。

## 当前基线

- Manifest 登记 68 个组件族、125 个公开值、369 个公开类型和 68 份源码共置留存文档；未认领公开值与文档覆盖问题均为 0。
- 68/68 个组件族已由 `audit/implementation` 进入 `verification`；这表示本地实现与自动化证据齐全到可执行最终验收，不代表已越过真机、Chromatic 和发布门禁。
- API 属性清单已覆盖 222 个结构化类型、2250 个字段与 232 个事件；2250/2250 个字段均有 TSDoc，四个运行时包的 API Extractor strict gate 为 0 warning，所有公开声明均有明确 release tag。
- Storybook 当前包含 80 个标题、374 个 Story；68 个官网组件链接、342 个留存文档 Story ID 与对应 Autodocs entry 均通过静态校验。
- 80 个 Storybook 标题均至少包含一项关键 `play` 交互；本地浏览器门禁会等待交互成功，再在 390×844 视口验证 374 个 Story × 7 场景（Light、Dark、en-US、RTL、reduced-motion、200% 字体、forced-colors），共 2,618 个组合，最近一次结果为 0 违规、0 `pageerror`。
- 官网预览已改为按组件 slug 呈现组件专属状态和交互，不再让 50 个页面只复用分类级相同画面；Props / Events 来自完整的生成 API 模型。
- 官网生产构建由独立本地门禁验证 68 个组件页面的 Light/Dark、主题恢复、页面结构、React `pageerror` / `console.error`（含 hydration mismatch）和 axe WCAG A/AA；当前 136 个页面/主题场景全部通过。
- Bundle 门禁对 68 个产品族和 125 个公开运行时值分别执行 Rollup tree-shaking；当前全部在分级 gzip 预算内，共享 CSS 为 22,670 B / 32 KiB 预算。
- `@meu/test-utils` 已提供 a11y、SSR/hydration、表单、手势、locale/RTL 与 reduced-motion 辅助能力；单元、隔离 Next H5 Chromium/WebKit 与旧语法扫描已有本地门禁。
- 隔离 Next H5 已为初始 open Portal、测量与手势边界建立 8 案例 × 2 引擎专项 hydration；10,000 行 VirtualList、1,500 节点 TreeSelect 与 SwipeActions 高频 pointer 预算也已通过。
- 真实 iOS Safari/VoiceOver、Android Chrome/TalkBack、旧 WebView 运行时、持续手势帧率/内存/弱网专项，以及最终 Chromatic 视觉审批仍是发布阻断项。

这些数字是当前仓库可重复生成的证据，不等同于组件已经达到 `commercial`。每个组件仍需按模板补齐剩余适用项并完成最终发布验收。

## 事实源与文档架构

每个公开组件最终有且只有一份与源码共置的 `Component.docs.mdx`。共享实现目录的导出也必须有独立 docs entry，例如 `Checkbox` 与 `CheckboxGroup` 可以共用实现和 Story 文件，但两者必须分别映射 API、用法与测试证据。

文档与官网的职责分工：

1. TypeScript 声明是 Props、Events、Ref 类型事实源；所有公开字段补齐 JSDoc。
2. `Component.docs.mdx` 是行为、场景、兼容性、限制、测试证据和变更记录事实源。
3. API Extractor 从声明与 TSDoc 生成 API report/doc model，避免人工复制 Props 表。
4. Storybook 明确维护 story ID，Autodocs 与 `play` 提供可执行示例和交互证明。
5. 文档索引器合并 MDX frontmatter、API model、Storybook index、Figma node 和质量证据，输出官网只读 manifest。
6. `apps/docs` 只消费生成的 manifest 与 MDX，移除手写 slug switch、伪 `<Component />` 示例和猜测出来的 Story ID。
7. CI 校验每个公开导出都有 docs entry，每份文档含必需章节，Story、Figma node 与源码链接有效。

现有组件目录 README 在迁移期间保留；组件完成 V2 后由共置 MDX 取代或只保留指针，避免维护两套相互漂移的契约。

## 商用 Definition of Done

组件只有同时满足以下适用项，状态才能从 `implementation` 进入 `commercial`：

| 维度     | 验收要求                                                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| API      | 受控/非受控成对；公开 DOM props、ref、默认值；事件含稳定的 `reason/source`；破坏性变化有迁移方案                                       |
| 状态     | normal、pressed、focus-visible、disabled；适用时覆盖 loading、selected、invalid、readOnly、indeterminate、dragging、entering、exiting  |
| 样式     | 只使用设计 Token 或受审查的组件 Token；Light/Dark、窄屏、长文本、200% 字号、高对比可用                                                 |
| 动效     | 主要使用 transform/opacity；进入、退出、反向和手势中断正确；`prefers-reduced-motion` 有降级                                            |
| 触摸     | 默认触控目标至少 44×44 CSS px；处理 pointer cancel、滚动冲突、快速连点与长按；手势有按钮/键盘替代                                      |
| A11y     | WCAG 2.2 AA；原生语义优先；名称、状态、错误、焦点与 live region 正确；axe 无阻断问题                                                   |
| 键盘     | 所有功能可完成；复杂模式遵循 WAI-ARIA APG；外接移动键盘可用                                                                            |
| 表单     | 透传 name、ref、onBlur、disabled、readOnly、required；原生 FormData 与 RHF adapter 均有验证                                            |
| SSR/Next | render 不读取浏览器全局；SSR 与 hydration DOM 稳定；客户端边界和 Portal 不产生 mismatch                                                |
| RTL/i18n | `lang/dir` 生效；逻辑属性与方向性手势正确；中英文文案不溢出；日期数字经过 locale                                                       |
| 兼容性   | 完整支持 iOS/WKWebView 15+、Android WebView/Chrome 89+；iOS 13–14、Chromium 79–88 作为观察档；旧语法检查继续保留但不再等同完整支持承诺 |
| 性能     | tree-shaking 有效；组件增量 gzip 有记录；手势不通过 React state 逐帧渲染；集合组件有规模基准                                           |
| 证明     | 单元、Storybook interaction、axe、SSR、RTL、reduced-motion、移动 Chromium/WebKit E2E、Light/Dark 视觉回归全部通过                      |
| 文档     | 模板章节齐全；完整 Props/Events/Ref；真实示例可复制；限制、兼容性、测试证据和变更记录已更新                                            |

## 参考基线

Meu 不复制任一组件库实现，而是按不同维度取长：

- Ant Design Mobile、Vant：移动业务覆盖和 API 完整度；
- React Aria：行为、表单、SSR、RTL、交互和无障碍；
- Ionic：移动手势、Overlay、动效性能与 WebView 支持策略；
- Material Design 3：视觉状态与层级，不作为 Web 代码实现来源；
- WAI-ARIA APG、WCAG 2.2：语义、键盘、触摸目标与拖动替代的最终判据；
- Next.js：Server/Client Components 与 hydration 边界。

关键官方资料：

- [React Aria Quality](https://react-aria.adobe.com/quality)
- [React Aria Forms](https://react-aria.adobe.com/forms)
- [Ionic Browser Support](https://ionicframework.com/docs/reference/browser-support)
- [Ionic Animations](https://ionicframework.com/docs/utilities/animations)
- [WAI-ARIA APG Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [WCAG 2.2 新增准则](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)

## 状态模型

每个组件族使用同一状态流：

```text
audit → design → implementation → verification → commercial
```

- `audit`：完成现状、竞品、缺口和 API 风险清单；
- `design`：Figma、Token、状态、动效和交互契约冻结；
- `implementation`：代码、类型、Story、单测和表单 adapter 同步修改；
- `verification`：视觉、axe、SSR、RTL、E2E、兼容与性能证据齐全；
- `commercial`：留存文档和官网发布完成，无阻断缺陷。

## 实施批次

| 批次    | 范围                                                      | 目标                                                  |
| ------- | --------------------------------------------------------- | ----------------------------------------------------- |
| Batch 0 | 文档/API manifest、测试工具、motion/overlay 基础、CI 红项 | 建立所有组件共享的质量基础，禁止重复造轮子            |
| Batch 1 | Foundation + 高频 Actions + Data Entry                    | 先稳定所有上层组件依赖的原语和首屏高频交互            |
| Batch 2 | Overlay 与 Feedback                                       | 统一 Portal、焦点、滚动锁、队列、进入退出和关闭原因   |
| Batch 3 | Navigation + Information                                  | 完成路由语义、键盘、RTL、长文本和内容结构             |
| Batch 4 | Collections 与手势                                        | 处理 pointer、滚动仲裁、替代路径、性能和 flaky E2E    |
| Batch 5 | Picker 与日期时间                                         | 统一草稿/确认模型、locale、时区、键盘 grid 与弹层行为 |
| Batch 6 | Advanced                                                  | 完成图片、上传、密码输入、树、虚拟化和安全边界        |

每个组件完成时，同一个变更必须包含：实现、类型 JSDoc、单测、Story/交互、视觉基线、留存文档、官网页面和变更记录。不得把文档留到所有代码完成后集中补写。

逐组件优化内容见 [`COMPONENT_PLAN.md`](./COMPONENT_PLAN.md)，启动基线与风险证据见 [`AUDIT.md`](./AUDIT.md)，体积方法与当前基线见 [`PERFORMANCE.md`](./PERFORMANCE.md)，真机记录使用 [`DEVICE_VERIFICATION.md`](./DEVICE_VERIFICATION.md)，所有组件使用 [`COMPONENT_DOC_TEMPLATE.md`](./COMPONENT_DOC_TEMPLATE.md) 留存。

## 发布门禁

在以下条件全部满足前不发布 npm：

1. 计划内 P0/P1 组件均达到 `commercial`；P2 未完成项必须从公开首发范围移除或明确标记实验性。
2. 公开导出、API manifest、留存文档和官网页面实现 100% 映射。
3. GitHub Quality、Chromatic 和隔离 Next H5 E2E 全绿，无 flaky 用例。
4. 至少完成一次真实 iOS Safari 与 Android Chrome/TalkBack 验收记录。
5. bundle、SSR、RTL、主题、字号放大和兼容矩阵有可复查证据。
