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

候选 SHA 一旦进入人工验收，不允许静默替换。任何代码、样式、Token、Story 或留存文档变更都必须生成新 SHA，并重跑受影响的自动化与人工场景。

## 已有自动化证据

以下数字来自 2026-08-29 本地生产构建和浏览器门禁，候选冻结后仍需运行 `pnpm verify:release` 复验：

| 门禁         | 当前证据                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| 文档映射     | 68 个产品、125 个公开值、371 个公开类型、68 份共置文档；0 未认领、0 覆盖问题                            |
| API          | 222 个结构化类型、2258/2258 个字段有说明、232 个事件；API Extractor 0 warning                           |
| Storybook    | 374 个 Story × 7 场景，共 2,618 个组合；关键 `play`、axe WCAG A/AA 与 `pageerror` 全部通过              |
| 官网         | 68 个组件页 × Light/Dark，共 136 个主题、结构、axe 与 React 运行时场景通过                              |
| 单元与集成   | Mobile 544、Form 53、Docs 145；隔离 Next H5 Chromium/WebKit 88/88 通过                                  |
| 兼容静态扫描 | 202 个 production 构建文件通过 Chrome 70 / iOS 13 基线                                                  |
| 体积         | 68/68 产品与 125/125 公开值在预算内；共享 CSS 22,670 B gzip / 32 KiB                                    |
| 运行时基准   | VirtualList 10,000 行、TreeSelect 1,500 节点、SwipeActions 高频 pointer 场景在双引擎预算内              |
| 支持矩阵     | React 19 / Next.js 16 App Router、运行时 peer、私有发布边界与隔离消费者版本由 `pnpm support:check` 固定 |

这些结果不自动把组件标记为 `commercial`。真机、旧 WebView、持续性能、法务和人工视觉仍为阻断项。

## 人工阻断项

每项只允许 `pending`、`pass`、`fail` 或 `waived`。`waived` 必须写明批准人、风险、支持范围变化和对应留存文档；不能只写“已知问题”。

| ID       | 验收项                   | 最低范围                                                                                                     | 状态    | 执行人/日期 | 证据或问题 |
| -------- | ------------------------ | ------------------------------------------------------------------------------------------------------------ | ------- | ----------- | ---------- |
| DEV-01   | iOS 当前主版本真机       | Safari、WKWebView、VoiceOver；D-01 至 D-06                                                                   | pending | —           | —          |
| DEV-02   | iOS 支持下限附近真机     | iOS 15.x Safari 与 WKWebView；核心表单、Overlay、手势                                                        | pending | —           | —          |
| DEV-03   | Android 当前主版本真机   | Chrome、Android WebView、TalkBack；D-01 至 D-06                                                              | pending | —           | —          |
| DEV-04   | Android 支持下限附近真机 | Chrome/WebView 89 附近；核心表单、Overlay、手势                                                              | pending | —           | —          |
| DEV-05   | 观察档运行时抽测         | iOS 13–14、Chromium/WebView 79–88；记录允许的降级                                                            | pending | —           | —          |
| PERF-01  | 持续手势性能             | Carousel、BottomSheet、ImageViewer、SwipeActions、FloatingPanel 连续 60 秒；记录 FPS、长任务、失控或滚动阻塞 | pending | —           | —          |
| PERF-02  | 图片与集合内存           | ImageUploader/ImageViewer 大图、删除、重试、卸载；VirtualList/TreeSelect 长时间滚动；记录峰值和回落          | pending | —           | —          |
| NET-01   | 弱网与恢复               | 慢 3G、离线、丢包；Image/InfiniteList/ImageUploader 的取消、重试、恢复和重复请求                             | pending | —           | —          |
| LEGAL-01 | Meu 自有代码分发方式     | 复核 `UNLICENSED` 是否符合私有仓库、未来制品和客户交付方式                                                   | pending | —           | —          |
| LEGAL-02 | 第三方图标许可           | 复核 Lucide ISC、Feather MIT、完整许可文本与 notices 随实际分发制品保留                                      | pending | —           | —          |
| LEGAL-03 | 图标来源与命名           | 复核 `icons.lock.json` 的版本、commit、SHA-512/SHA-256、Meu ID 与上游名称映射；确认 Meu 命名不暗示原创几何   | pending | —           | —          |
| VIS-01   | 最终人工视觉审批         | 冻结 SHA 上运行一次 Chromatic；Light/Dark、移动视口、差异全部批准或记录                                      | pending | —           | —          |
| WEB-01   | 官网正式发布             | VIS-01 完成后触发 Vercel；首页、68 个页面、Storybook 链接与移动视口 smoke test                               | pending | —           | —          |

图标检查不是法律意见。工程证据位于 `packages/icons-core/icons.lock.json`、`THIRD_PARTY_NOTICES.md`、`licenses/` 与上游 SVG 快照；最终可分发性必须由有授权的法务或负责人确认。

## 记录要求

真机结果使用 [`DEVICE_VERIFICATION.md`](./DEVICE_VERIFICATION.md) 的字段和 D-01 至 D-06 场景。性能结果至少记录设备、OS、浏览器/WebView、构建 SHA、采样工具、持续时间、数据规模、网络条件、峰值/均值和原始截图或 trace。法务结果必须记录审核范围与实际分发物，不能只审核源码目录。

所有 `fail` 必须关联 issue 或修复提交。修复后重新生成候选 SHA，并复验受影响的自动化、设备和视觉项目；不得在旧 SHA 的通过记录上直接覆盖失败。

## 最终发布顺序

1. 冻结候选 SHA，运行 `pnpm verify:release`，确认工作树无未提交变更。
2. 完成 DEV、PERF、NET 和 LEGAL 项；将结论同步到相关组件的 `*.docs.mdx` 限制、兼容性、证据与变更记录。
3. 对同一 SHA 手动运行一次 `Publish Storybook`，完成 Chromatic 人工视觉审批。
4. 视觉通过后触发 Vercel `Release Meu Mobile Docs` Deploy Hook。
5. 对正式官网、68 个组件页与 Storybook 跳转执行移动端 smoke test，记录最终 URL 和构建 SHA。
6. 只有全部阻断项为 `pass`，或有完整批准记录的 `waived`，才批量把适用组件状态改为 `commercial`。

发布操作细节见 [`../DEPLOYMENT.md`](../DEPLOYMENT.md)。
