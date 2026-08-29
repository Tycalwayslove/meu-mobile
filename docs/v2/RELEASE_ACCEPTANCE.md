# Meu Mobile V2 最终发布验收

## 目的

本文件是 68 个组件从 `verification` 提升到 `commercial` 的最终候选签字表。自动化通过只证明仓库可重复验证的范围；真实设备、辅助技术、旧 WebView、持续性能、许可分发和人工视觉审批必须填写实际结果，不能用模拟器或计划代替。

开发阶段不触发 Chromatic、Vercel 或 npm 发布。只有下方所有阻断项完成后，才对同一个冻结 commit 统一执行一次 Chromatic 与 Vercel 发布；本轮仍不发布 npm。

## 候选版本

| 字段            | 记录                                     |
| --------------- | ---------------------------------------- |
| 候选 commit SHA | 待定                                     |
| 冻结日期        | 待定                                     |
| 候选负责人      | 待定                                     |
| 变更范围        | 68 个组件、官网、Storybook、表单与图标包 |
| npm             | 不发布                                   |

候选 SHA 一旦进入人工验收，不允许静默替换。任何代码、样式、Token、Story 或组件契约变更都必须生成新候选，并重跑受影响的自动化与人工场景。候选冻结后只允许提交验收记录、性能/设备证据和组件文档的 `status` 字段；`commercial:check` 会拒绝其他文件变化。

## 已有自动化证据

下表混合当前工作树的生成式/定向证据与本批前历史全量基线；每项明确标注口径，不能把历史快照当作当前候选证明。候选冻结后仍需对同一 SHA 运行 `pnpm verify:release` 统一复验：

| 门禁         | 当前证据                                                                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 文档映射     | 68 个产品、125 个公开值、384 个公开类型、68 份共置文档；0 未认领、0 覆盖问题                                                                                                                     |
| Figma        | 68/68 个组件族已建立永久组件集链接；最后 9 项已完成 Light/Dark、Token 绑定、44px 触控目标与结构 QA                                                                                               |
| API          | 226 个结构化类型、2361/2361 个字段有说明、242 个事件；API Extractor 公开契约已同步                                                                                                               |
| Storybook    | 当前本地构建含 444 个 Story，文档引用 415 个 Story ID 且无失配；81/81 个标题含关键交互或语义断言；完整矩阵 444 × 7、共 3,108 个组合通过，0 axe 违规、0 `pageerror`                               |
| 官网         | 68 个组件页与 8 个公共页面 × Light/Dark、共 152 个场景为最近全量浏览器基线；本批 Next 16 production build 与 82 个静态页面生成通过                                                               |
| 单元与集成   | 当前工作树 `pnpm test` 19/19 个任务通过，其中 mobile 为 149 个文件、958/958 tests，form-react 为 19 个文件、70/70 tests；Next H5 移动双引擎 112/112 通过                                         |
| 兼容静态扫描 | 199 个 production 构建文件通过 Chrome 70 / iOS 13 基线                                                                                                                                           |
| 体积         | 68/68 产品与 125/125 公开值在预算内；共享 CSS 25,021 B gzip / 32 KiB                                                                                                                             |
| 运行时基准   | 性能/恢复专页 14/14、三轮重复 42/42：VirtualList 10,000 行与 40 次往返、TreeSelect 1,500 节点、SwipeActions/FloatingPanel 取消恢复，以及 Image/InfiniteList/ImageUploader 确定性失败、重试与取消 |
| 支持矩阵     | React 19 / Next.js 16 App Router、运行时 peer、私有发布边界与隔离消费者版本由 `pnpm support:check` 固定                                                                                          |
| 许可工程门禁 | `pnpm legal:check` 校验许可副本、5 条图标来源、官网披露和 `@meu/icons-core` 实际 pack 文件清单；法律结论仍需人工签字                                                                             |

这些结果不自动把组件标记为 `commercial`。真机、旧 WebView、持续性能、法务和人工视觉仍为阻断项。

## 人工阻断项

每项只允许 `pending`、`pass`、`fail` 或 `waived`。`waived` 必须写明批准人、风险、支持范围变化和对应留存文档；不能只写“已知问题”。

| ID       | 验收项                   | 最低范围                                                                                                     | 状态    | 执行人/日期 | 证据或问题                                                                 |
| -------- | ------------------------ | ------------------------------------------------------------------------------------------------------------ | ------- | ----------- | -------------------------------------------------------------------------- |
| DEV-01   | iOS 当前主版本真机       | Safari、WKWebView、VoiceOver；D-01 至 D-06                                                                   | pending | —           | —                                                                          |
| DEV-02   | iOS 支持下限附近真机     | iOS 15.x Safari 与 WKWebView；核心表单、Overlay、手势                                                        | pending | —           | —                                                                          |
| DEV-03   | Android 当前主版本真机   | Chrome、Android WebView、TalkBack；D-01 至 D-06                                                              | pending | —           | —                                                                          |
| DEV-04   | Android 支持下限附近真机 | Chrome/WebView 89 附近；核心表单、Overlay、手势                                                              | pending | —           | —                                                                          |
| DEV-05   | 观察档运行时抽测         | iOS 13–14、Chromium/WebView 79–88；记录允许的降级                                                            | pending | —           | —                                                                          |
| PERF-01  | 持续手势性能             | Carousel、BottomSheet、ImageViewer、SwipeActions、FloatingPanel 连续 60 秒；记录 FPS、长任务、失控或滚动阻塞 | pending | —           | 自动化已有 SwipeActions/FloatingPanel 各 40 轮取消恢复；仍缺真实 60 秒采样 |
| PERF-02  | 图片与集合内存           | ImageUploader/ImageViewer 大图、删除、重试、卸载；VirtualList/TreeSelect 长时间滚动；记录峰值和回落          | pending | —           | 自动化已有 VirtualList 40 次往返及上传 retry/Abort；仍缺峰值与回落         |
| NET-01   | 弱网与恢复               | 慢 3G、离线、丢包；Image/InfiniteList/ImageUploader 的取消、重试、恢复和重复请求                             | pending | —           | 双引擎确定性失败/重试/取消通过；仍缺慢 3G、离线与丢包实测                  |
| LEGAL-01 | Meu 自有代码分发方式     | 复核 `UNLICENSED` 是否符合私有仓库、未来制品和客户交付方式                                                   | pending | —           | —                                                                          |
| LEGAL-02 | 第三方图标许可           | 复核 Lucide ISC、Feather MIT、完整许可文本与 notices 随实际分发制品保留                                      | pending | —           | 工程门禁与官网披露已通过；待按实际交付方式签字                             |
| LEGAL-03 | 图标来源与命名           | 复核 `icons.lock.json` 的版本、commit、SHA-512/SHA-256、Meu ID 与上游名称映射；确认 Meu 命名不暗示原创几何   | pending | —           | 5 条映射、未修改几何及 Meu 命名声明已自动验证；待负责人签字                |
| VIS-01   | 最终人工视觉审批         | 冻结 SHA 上运行一次 Chromatic；Light/Dark、移动视口、差异全部批准或记录                                      | pending | —           | —                                                                          |
| WEB-01   | 官网正式发布             | VIS-01 完成后触发 Vercel；首页、68 个页面、Storybook 链接与移动视口 smoke test                               | pending | —           | —                                                                          |

图标检查不是法律意见。工程证据位于 `packages/icons-core/icons.lock.json`、`THIRD_PARTY_NOTICES.md`、`licenses/` 与上游 SVG 快照；最终可分发性必须由有授权的法务或负责人确认，并记录在 [`LEGAL_REVIEW.md`](./LEGAL_REVIEW.md)。

`pnpm commercial:guard` 已接入日常 `pnpm check`：它验证 13 个阻断项结构完整，并禁止在阻断项未完成时提前把任意组件标为 `commercial`。所有人工记录和组件状态提交后，使用 `pnpm commercial:check` 严格校验 68/68 状态、候选 SHA、全部阻断项和干净工作树；候选 SHA 必须是当前提交的祖先，且候选之后只能存在上述验收证据文件，不能夹带运行时或契约变化。

## 记录要求

真机结果使用 [`DEVICE_VERIFICATION.md`](./DEVICE_VERIFICATION.md) 的字段和 D-01 至 D-06 场景。性能结果至少记录设备、OS、浏览器/WebView、构建 SHA、采样工具、持续时间、数据规模、网络条件、峰值/均值和原始截图或 trace。法务结果必须记录审核范围与实际分发物，不能只审核源码目录。

所有 `fail` 必须关联 issue 或修复提交。修复后重新生成候选 SHA，并复验受影响的自动化、设备和视觉项目；不得在旧 SHA 的通过记录上直接覆盖失败。

## 最终发布顺序

1. 冻结候选 SHA，运行 `pnpm verify:release`，确认工作树无未提交变更。
2. 完成 DEV、PERF、NET 和 LEGAL 项；将结论同步到相关组件的 `*.docs.mdx` 限制、兼容性、证据与变更记录。
3. 对同一 SHA 手动运行一次 `Publish Storybook`，完成 Chromatic 人工视觉审批。
4. 视觉通过后触发 Vercel `Release Meu Mobile Docs` Deploy Hook。
5. 对正式官网、68 个组件页与 Storybook 跳转执行移动端 smoke test，记录最终 URL 和构建 SHA。
6. 只有全部阻断项为 `pass`，或有完整批准记录的 `waived`，才批量把适用组件状态改为 `commercial`；提交最终状态后运行 `pnpm commercial:check`。

发布操作细节见 [`../DEPLOYMENT.md`](../DEPLOYMENT.md)。
