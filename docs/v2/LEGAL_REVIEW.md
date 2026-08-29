# Legal review record

本文档用于记录 Meu Mobile 正式交付前的负责人或法务结论，不构成法律意见。审核必须针对实际交付方式和实际制品，不能只查看源码目录。

## 待确认的交付范围

| 项目                    | 结论                                               |
| ----------------------- | -------------------------------------------------- |
| 使用范围                | 待填写：仅 Meu 内部 / 指定客户项目 / 其他          |
| 交付形式                | 待填写：源码工作区 / 私有制品 / 应用 bundle / 其他 |
| npm                     | 当前不发布                                         |
| Meu 自有代码条款        | 待填写：权利人、适用条款与获准范围                 |
| 第三方 notices 放置位置 | 待填写：随源码、制品、应用或合同附件的位置         |

## LEGAL-01 · Meu 自有代码

当前包保持 `private: true`；`@meu/icons-core` 明确为 `UNLICENSED`。这能阻止误公开，却不能替代面向客户或其他主体的分发授权。审核人需要确认：

- Meu 对源码、构建产物、文档和设计资产的权利主体；
- 内部使用、指定客户交付、再分发、修改和备份分别允许到什么范围；
- 最终制品中应携带的 Meu 自有许可证、合同条款或版权声明。

## LEGAL-02 · 第三方许可随制品保留

工程门禁 `pnpm legal:check` 已验证 Lucide/Feather 许可副本一致、图标来源记录完整、官网披露可访问，并通过 `npm pack --dry-run` 检查 `@meu/icons-core` 的许可文件清单。审核人仍需根据最终交付载体确认 notices 是否随实际制品保留。

审核范围至少包括：

- `THIRD_PARTY_NOTICES.md` 与 `licenses/`；
- `packages/icons-core/icons.lock.json`、上游 SVG 快照和实际 pack 清单；
- 最终应用 bundle、源码压缩包、私有包或客户交付目录中的许可文件位置；
- 其他运行时依赖由各依赖包携带的许可，以及最终打包方式是否改变其保留要求。

## LEGAL-03 · 图标来源与 Meu 命名

当前五个图标固定到 `lucide-static@1.34.0` 和 Lucide commit `1a60fd28ed7111bbf6acedc0896f3d83cd73945a`，逐文件与逐几何 hash 已记录，且均为 `modified=false`。`MeuIcon*` 和 Meu ID 仅是稳定 API 命名，不表示 Meu 创作或拥有上游图形。

## 签字

| 阻断项   | 状态    | 审核人 | 日期 | 审核范围 / 结论 / 附件 |
| -------- | ------- | ------ | ---- | ---------------------- |
| LEGAL-01 | pending | —      | —    | —                      |
| LEGAL-02 | pending | —      | —    | —                      |
| LEGAL-03 | pending | —      | —    | —                      |

完成后，将结论同步到 [`RELEASE_ACCEPTANCE.md`](./RELEASE_ACCEPTANCE.md) 的对应阻断项。若结论为 `waived`，必须同时记录批准人、风险、支持范围变化和后续处理计划。
