# V2 API 治理与 API Extractor

## 目的

API Extractor 将编译后的声明文件转换为两类可审查、可复用的稳定产物：

- `etc/api/*.api.md`：面向代码审查的公开 API 快照。任何签名变化都必须显式更新并进入 Git diff。
- `etc/api/*.api.json`：API 文档模型，后续官网 Props、Events 和类型引用生成器以此为结构化输入。

当前覆盖 `@meu/mobile`、`@meu/form-react`、`@meu/icons-react` 和
`@meu/primitives-react`。API Extractor 读取各包构建后的 `dist/index.d.ts`，因此运行前必须先构建包。

## 命令

```bash
# 先生成 dist 声明文件
pnpm build:packages

# 校验已提交的 API report 和 doc model 是否仍与源码一致
pnpm api:extract

# 接受经过审查的 API 变化并更新两类产物
pnpm api:extract:update

# 严格门禁：除快照一致外，任何 API/TSDoc warning 也会失败
pnpm api:extract:strict
```

`pnpm api:extract` 已加入 Quality CI，并位于 `pnpm build:packages` 之后。它不会因为迁移期已有的
`ae-missing-release-tag` 警告让普通 CI 失败，但仍会统计并显示债务总数。API report 或 doc model
没有更新时，普通校验会失败。

## 当前迁移基线

首次建立快照时共有 463 个 `ae-missing-release-tag` 警告：

| 包                      | 待补 release tag / TSDoc 的公开声明 |
| ----------------------- | ----------------------------------: |
| `@meu/mobile`           |                                 397 |
| `@meu/form-react`       |                                  52 |
| `@meu/icons-react`      |                                   7 |
| `@meu/primitives-react` |                                   7 |
| 合计                    |                                 463 |

这里的数量按 API Extractor 的公开声明诊断计数，不等同于组件数量或 Props 字段数量。它是严格门禁启用前必须归零的 API 注释债务。

## 维护流程

1. 修改公开组件、Props、Events、类型或导出后，先执行 `pnpm build:packages`。
2. 执行 `pnpm api:extract`。如果快照过期，先检查变化是否符合组件的 V2 留存文档和兼容策略。
3. 确认变化后执行 `pnpm api:extract:update`，把对应 `.api.md` 与 `.api.json` 一起提交。
4. 新增或修改的公开声明必须写 TSDoc，并标记 `@public`、`@beta`、`@alpha` 或 `@internal`。
5. 每一批组件完成时执行 `pnpm api:extract:strict`；旧债务可以按批次清理，但不允许引入新的 warning。

## 迁移期例外

- 普通 CI 暂时忽略且仅忽略 `ae-missing-release-tag` 对退出码的影响；编译错误、API 快照变化和 doc model 变化仍会失败。
- 严格命令不应用上述例外，适合作为单组件或单批次达到 V2 商用状态的验收门禁。
- API Extractor 只证明声明面稳定，不能替代运行时行为、无障碍、浏览器、WebView、视觉回归或 E2E 验证。

## Doc model 边界

API Extractor 的 `.api.json` 能稳定表达顶层导出、签名引用和顶层 TSDoc，但不会把当前大量“交叉类型 + 内联对象”形式的 Props 拆成独立 API members，也不会展开 React 继承属性。因此它适合作为 API 身份、签名和文档引用的权威输入，不能单独生成完整 Props 表。迁移期官网生成器仍需结合 TypeScript AST/现有组件 manifest；以后若把 Props 逐步改为具名 interface，也必须先评估是否构成公开 API 变化。
