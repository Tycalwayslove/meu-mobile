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

# 生成官网逐字段 Props / Events 表
pnpm api:properties

# 校验逐字段文档模型没有落后于源码
pnpm api:properties:check

# 严格门禁：除快照一致外，任何 API/TSDoc warning 也会失败
pnpm api:extract:strict
```

`pnpm api:extract` 与 `pnpm api:properties:check` 已加入 Quality CI，并位于
`pnpm build:packages` 之后。前者不会因为迁移期已有的
`ae-missing-release-tag` 警告让普通 CI 失败，但仍会统计并显示债务总数。API report 或 doc model
没有更新时，普通校验会失败。

官网的 Props / Events 表由 `scripts/generate-api-properties.mjs` 通过 TypeScript 类型检查器生成，
字段包含名称、类型、必填、默认值和 TSDoc 说明。生成产物为
`apps/docs/app/_generated/api-properties.json`；它补充 API Extractor 的顶层签名模型，但不改变
`.api.md` / `.api.json` 的权威身份。

## 当前迁移基线

首次建立快照时共有 463 个 `ae-missing-release-tag` 警告；当前普通校验已降至 374 个。
以每次 `pnpm api:extract` 输出的 deferred warning 总数为实时基线，避免人工维护的分包表与声明面漂移。
该数量按 API Extractor 的公开声明诊断计数，不等同于组件数量或 Props 字段数量；它是严格门禁启用前必须归零的 API 注释债务。

## 维护流程

1. 修改公开组件、Props、Events、类型或导出后，先执行 `pnpm build:packages`。
2. 执行 `pnpm api:extract`。如果快照过期，先检查变化是否符合组件的 V2 留存文档和兼容策略。
3. 执行 `pnpm api:properties`，检查官网 Props / Events 字段、默认值和说明是否准确。
4. 确认变化后执行 `pnpm api:extract:update`，把对应 `.api.md`、`.api.json` 与生成的逐字段模型一起提交。
5. 新增或修改的公开声明必须写 TSDoc，并标记 `@public`、`@beta`、`@alpha` 或 `@internal`。
6. 每一批组件完成时执行 `pnpm api:extract:strict`；旧债务可以按批次清理，但不允许引入新的 warning。

## 迁移期例外

- 普通 CI 暂时忽略且仅忽略 `ae-missing-release-tag` 对退出码的影响；编译错误、API 快照变化和 doc model 变化仍会失败。
- 严格命令不应用上述例外，适合作为单组件或单批次达到 V2 商用状态的验收门禁。
- API Extractor 只证明声明面稳定，不能替代运行时行为、无障碍、浏览器、WebView、视觉回归或 E2E 验证。

## Doc model 边界

API Extractor 的 `.api.json` 能稳定表达顶层导出、签名引用和顶层 TSDoc，但不会把当前大量“交叉类型 + 内联对象”形式的 Props 拆成独立 API members，也不会展开 React 继承属性。因此它适合作为 API 身份、签名和文档引用的权威输入，不能单独生成完整 Props 表。官网生成器使用 TypeScript AST / TypeChecker 展开仓库自有字段，并刻意不复制 React 原生 DOM 属性；原生属性仍以最终类型签名为准。以后若把 Props 逐步改为具名 interface，也必须先评估是否构成公开 API 变化。
