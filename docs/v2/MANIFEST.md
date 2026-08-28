# 组件与公开 API Manifest

`apps/docs/app/_generated/component-manifest.json` 是 V2 组件文档覆盖的机器可读基线。它连接三类事实：

- 四个公开包入口实际导出的值与类型；
- `apps/docs/app/_data/components.ts` 中的产品组件目录；
- 组件源码旁的 `*.docs.mdx` 留存文档。

## 命令

| 命令                           | 用途                                                      | 是否因当前覆盖缺口失败 |
| ------------------------------ | --------------------------------------------------------- | ---------------------- |
| `pnpm docs:manifest`           | 重新生成并写入 manifest                                   | 否                     |
| `pnpm docs:manifest:verify`    | 检查已提交的 manifest 是否与源码、目录和文档保持同步      | 仅 manifest 过期时失败 |
| `pnpm docs:manifest:report`    | 输出完整覆盖报告，供迁移期间查看                          | 否                     |
| `pnpm docs:manifest:check`     | 发布门禁；同时检查新鲜度、共置文档和公开 API 的产品页归属 | 是                     |
| `pnpm test:component-manifest` | 运行解析器单测与当前仓库集成测试                          | 是                     |

V2 迁移完成前，日常开发先使用 `docs:manifest:verify`。只有缺口归零后，才把严格的 `docs:manifest:check` 接入总质量门禁。

当前 `pnpm check` 与 GitHub Quality 工作流已经运行非阻塞覆盖版的 `docs:manifest:verify`，因此公开入口、产品目录或共置文档变化后，未更新 manifest 会立即被拦截。

## 映射规则

公开 API 从以下入口自动读取，不维护第二份手写清单：

- `packages/mobile/src/index.ts`
- `packages/form-react/src/index.ts`
- `packages/icons-react/src/index.ts`
- `packages/primitives-react/src/index.ts`

产品条目按 `packageName + sourcePath` 与公开导出关联，而不是按展示名称猜测。例如官网的 `Form` 对应源码模块 `MeuForm`，官网的 `Icon` 对应 `MeuIcon`。同一源码模块可以服务多个产品页，例如 `ConfigProvider / ThemeProvider` 和 `Cell / List`；每个产品仍必须拥有以自身名称命名的独立 MDX，不能用同目录任意文件冒充覆盖。

目录型组件的默认留存文档位置为：

```text
packages/mobile/src/Button/Button.docs.mdx
```

单文件模块的默认位置为：

```text
packages/primitives-react/src/Portal.docs.mdx
```

## 新增或修改组件

1. 在包入口声明公开导出。
2. 在官网组件目录中新增或更新产品条目，并填写准确的 `packageName` 与 `sourcePath`。
3. 在源码旁维护对应 `*.docs.mdx`。
4. 运行 `pnpm docs:manifest` 并提交生成文件。
5. 运行 `pnpm test:component-manifest` 和 `pnpm docs:manifest:verify`。

严格校验还会报告以下问题：

- 产品条目缺少共置文档；
- frontmatter 与产品 name、slug、package、source 不一致；
- frontmatter 声明了不存在的公开值，或源码公开值没有被任何对应文档声明；
- 留存模板的必需章节缺失；
- 产品条目声明的源码没有公开导出；
- 公开导出没有任何产品文档归属；
- 外部 `export *` 无法被本地静态枚举。

`@meu/form-react` 当前透传 `react-hook-form` 的 `export *`。manifest 会保留这个事实，但不会假装已经枚举其上游 API；V2 发布前应决定改为显式导出，或将其作为经过审计的例外策略记录下来。
