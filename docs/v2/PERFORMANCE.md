# Meu Mobile V2 性能与体积证据

## 目标

性能验收同时约束“能否被 tree-shake”“单个组件带来的 JavaScript 成本”和“应用只需加载一次的共享样式”。体积门禁不能替代交互性能、内存与真机测试，但可以阻止无意中把整套组件或大型依赖带入一个原子组件。

## 可重复测量

执行：

```bash
pnpm bundle:size:update
pnpm bundle:size:check
```

脚本对组件 manifest 中 68 个产品族和 125 个公开运行时值逐项创建 Rollup ESM 消费入口，并使用生产 tree-shaking 生成独立 bundle：

- React、React DOM 与被测包的 peer dependencies 保持 external；
- 被测包的普通 dependencies 和 Meu workspace 运行时依赖计入结果；
- 同时记录 raw、gzip level 9 与 Brotli 字节数；
- Token、Primitive 与 Mobile CSS 合并后单独计算，按每个应用只导入一次处理；
- 精确结果写入 [`bundle-size.json`](./bundle-size.json)，并同步到每一份组件留存文档；
- `--check` 同时校验构建结果、JSON 基线、组件文档证据与预算，任何漂移都会失败。

## 预算

| 范围              | gzip 上限 | 说明                                                             |
| ----------------- | --------: | ---------------------------------------------------------------- |
| 常规产品族 / 单值 |    32 KiB | 原子、展示、导航与普通输入                                       |
| 复杂产品族 / 单值 |    48 KiB | 日期、Picker、图片、Carousel、TreeSelect、Popover 等依赖较重能力 |
| Form 全家族组合   |   112 KiB | 仅代表一次导入全部 adapters 的最坏组合                           |
| 单个 Form adapter |    64 KiB | 真实业务按需导入时的增量上限                                     |
| 全局共享 CSS      |    32 KiB | Token、Primitive 与 Mobile 样式 gzip 合计                        |

预算是发布上限，不是鼓励占满。新增依赖前必须先确认能否延迟加载、改用平台能力或复用已有 primitive；不得只为通过门禁而提高预算。

## 当前结果

- 68/68 个产品族和 125/125 个公开运行时值均在预算内；
- 共享 CSS：22,670 B gzip / 32,768 B 预算，18,839 B Brotli；
- 最大组合是 `@meu/form-react` 全部 adapters：105,390 B gzip / 114,688 B 预算；
- 最大单值是 `Popover`：46,278 B gzip / 49,152 B 预算，主要成本包含定位运行时；
- 较大的高级单值包括 `MeuFormImageUploader` 37,473 B、`MeuFormTreeSelect` 36,335 B、`ImageUploader` 30,434 B、`TreeSelect` 27,728 B 和 `ImageViewer` 26,652 B（均为 gzip）。

## 运行时预算

隔离 Next H5 production build 的 `/performance` 路由在 Playwright Pixel 5 Chromium 与 iPhone 13 WebKit 两个项目中执行同一组预算：

| 场景                  |              数据规模 | 本地门禁                                                                                  |
| --------------------- | --------------------: | ----------------------------------------------------------------------------------------- |
| VirtualList 远距跳转  | 10,000 行、overscan=3 | 挂载 DOM ≤20 行；跳至第 9,001 行并完成两帧提交 ≤500ms；跳转后仍 ≤20 行                    |
| TreeSelect 打开       |      1,500 个平铺节点 | 打开并完成两帧提交 ≤750ms；虚拟 treeitem DOM ≤30                                          |
| TreeSelect 搜索       |      1,500 个平铺节点 | 精确筛选并完成两帧提交 ≤500ms                                                             |
| SwipeActions 高频移动 |   单行、右侧双 action | 连续分发 240 次 pointermove 加 settle 的同步主线程成本 ≤250ms，并正确进入 right open 状态 |

`tests/next-h5/e2e/performance.spec.ts` 当前在两种移动引擎上 6/6 通过。完整隔离 Next H5 套件共 90/90 通过，每条用例结束后都会断言 0 `pageerror`、0 `console.error`，因此运行时预算不是脱离真实组件集成的微基准。

## 仍需独立证明

- VirtualList 动态高度快速滚动、滚动锚定、峰值内存与长任务；
- Carousel、BottomSheet、ImageViewer 的持续手势帧率、pointer cancel 与中断恢复；
- 图片上传的并发、Abort、object URL 回收与弱网内存；
- iOS Safari/WKWebView 与 Android Chrome/WebView 真机上的启动、滚动和键盘性能。

这些运行时证据应记录到对应组件的永久文档中；只有体积门禁通过不能把组件状态提升为 `commercial`。
