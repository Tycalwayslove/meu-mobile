# 组件留存文档模板

每个与源码共置的 `Component.docs.mdx` 必须保留下列章节。无适用内容时写明“不适用”及原因，不能直接删除章节。

```markdown
---
name: ComponentName
slug: component-name
package: "@meu/mobile"
exports: [ComponentName]
status: audit
localVerification: pending
localGapIds: [LOC-COMPONENT-NAME-01]
priority: P0
since: 0.1.0
implementedVersion: null
lastReviewed: YYYY-MM-DD
figma:
  fileKey: null
  nodeId: null
storyIds: []
source: packages/mobile/src/ComponentName
---

# ComponentName

## 当前能力

- 当前已经实现并经过验证的能力。
- 不把计划能力写成已实现。

## 何时使用

## 何时不要使用

## 结构与状态

记录 anatomy，以及 normal、pressed、focus-visible、disabled、loading、invalid、selected 等适用状态。

## 基础用法

## 受控与非受控

## 表单集成

## Props

由 API Extractor doc model 生成；此处补充跨字段约束和默认行为，不手抄类型签名。

## Events

逐项说明触发时机、参数、`reason/source`、是否可取消以及与状态更新的顺序。

## Ref 与命令式方法

## 键盘操作

| 按键 | 行为 |
| ---- | ---- |

## 触摸与手势

## 无障碍

记录 DOM 语义、accessible name、ARIA、焦点、读屏公告与错误关联。

## 动效

记录进入/退出、时长、缓动、中断行为和 reduced-motion 降级。

## 主题与定制

只列稳定 Token、data 属性和插槽；内部 class 不作为公开 API。

## SSR 与 Next.js

## RTL 与国际化

## 浏览器与 WebView

默认继承 [`SUPPORT_MATRIX.md`](./SUPPORT_MATRIX.md)；这里只记录该组件额外的运行时要求、降级与限制。

## 边界情况与已知限制

## 性能预算

## 测试证据

- Unit:
- Story interaction:
- Storybook 浏览器矩阵:
- 官网 Next 运行时:
- Bundle:
- SSR/hydration:
- RTL:
- Reduced motion:
- Mobile Chromium/WebKit E2E:
- Chromatic Light/Dark:
- Real device:

## V2 优化记录

### 待优化

### 已完成

## 变更记录

| 日期 | 版本 | 类型 | 内容 | 迁移说明 |
| ---- | ---- | ---- | ---- | -------- |
```

`localVerification` 只能是 `pending` 或 `complete`：

- `pending` 必须列出至少一个稳定的 `LOC-<SLUG>-NN` 缺口编号；每关闭一个缺口就同步删除。
- `complete` 必须使用空数组 `localGapIds: []`，表示该组件当前规划内的本地自动化验证已全部通过。
- `status: commercial` 只允许与 `localVerification: complete` 同时出现；真机、许可、视觉回归等发布级验证仍由发布验收清单单独约束。

## 更新规则

- Props/Events/Ref 的公开变化必须修改类型 JSDoc、测试、文档和变更记录。
- 视觉或动效变化必须更新 Figma、Story 和 Chromatic 基线。
- 兼容性、限制或降级变化即使不改变类型，也必须更新文档。
- 所有组件默认继承 `SUPPORT_MATRIX.md`；新增 React、Next、浏览器或 WebView 支持前必须先完成独立消费者验证。
- 破坏性变更需先进入弃用周期，记录替代 API 与迁移示例。
- 测试链接只能指向已运行的证据，不能用计划项冒充完成项。
- Story interaction 必须说明覆盖的是“每个标题的关键路径”还是“每个 Story”；Axe 必须记录视口、主题、规则级别，以及是否在 `play` 完成后执行，禁止用静态 Story 数量冒充交互证明。
- Bundle 数值必须由 `scripts/check-bundle-size.mjs` 生成并与 `docs/v2/bundle-size.json` 一致；不得手工调整证据行或只提高预算掩盖回归。
- Story ID、Figma node、公开导出和 docs entry 的映射必须通过 CI，不允许用字符串猜测链接。
