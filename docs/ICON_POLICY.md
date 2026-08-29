# Meu 图标规范

基础图标从 Lucide 精选并生成，不在运行时依赖完整 Lucide React 包。清单顶层记录统一的 Lucide
版本与 ISC 许可证，每个图标记录上游名称、修改状态、适用许可证和 Meu 语义名。当前精选图形
源自 Feather，因此同时保留 Feather MIT 声明；两份完整许可文本都随 `@meu/icons-core` 包分发。

命名约定：

- 语义 ID：`chevron-left`
- React 导出：`MeuIconChevronLeft`
- Figma：`Meu/Icon/ChevronLeft`
- DOM：`data-meu-icon="chevron-left"`

图标统一使用 24 × 24 viewBox、`currentColor`、2 px stroke 和圆角端点。品牌 Logo 与业务专属图标
必须作为 MeuMall 自有资产单独登记。禁止新增 emoji 和 iconfont。

分发与披露门禁：

- `pnpm legal:check` 校验仓库、`@meu/icons-core` 与官网公开下载文件中的许可文本完全一致。
- 门禁通过 `npm pack --dry-run --json` 验证实际图标包包含 `LICENSE`、第三方 notices、完整许可文本、
  lock、manifest 与所有上游 SVG 快照。
- 官网 `/licenses` 页面披露 Lucide、Feather 与 TanStack Virtual 的版本、来源、Meu 命名边界和
  完整许可文本入口。
- `modified=true` 的上游几何会被生成器和许可门禁拒绝，必须建立独立来源与授权记录后才能准入。
- 工程门禁只保证来源与通知材料随制品保留；正式外部分发仍需项目负责人或法务按交付方式签字。
