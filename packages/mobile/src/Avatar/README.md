# Avatar

`Avatar` 是固定尺寸、非交互的身份图像组件。它在图片加载、成功、失败和空源时保持稳定尺寸，并让失败回退沿用同一个可访问名称。完整发布记录与验证矩阵见 [Avatar.docs.mdx](./Avatar.docs.mdx)；本文件是代码审查与日常接入时必须长期保留的消费者契约。

## 用法

```tsx
<Avatar
  src={user.avatarUrl}
  srcSet={`${user.avatarUrl} 1x, ${user.avatar2xUrl} 2x`}
  sizes="44px"
  alt={user.displayName}
  initials="LX"
  loading="lazy"
  objectPosition="50% 25%"
/>
```

可点击的账户入口必须由原生 Link/Button 包裹；Avatar 自身始终是非交互 span。

## 能力与回退规则

- shape：circle、rounded、square。
- size：small 32px、medium 44px、large 56px，或有限 number；非有限值回退 44px，0/负值夹到 1px。
- fallback 固定优先级：`fallback` > trim 后的 `initials` > trim 后 alt 的首个 Unicode code point。
- loading、空源和 error 使用同一视觉 fallback；error 后改变 src/srcSet 会重新进入 loading。
- fallbackSrc 可在主源失败后尝试一次备用图片，再落到内容 fallback。
- srcSet 可独立提供图片候选；sizes、loading、decoding、fetchPriority、crossOrigin、referrerPolicy、draggable 透传原生 img。
- fit 控制 object-fit，objectPosition 控制裁切焦点。默认 cover / 50% 50%。
- 组件不做循环重试、上传、缓存或 Next/Image 优化。

## Props

| 名称            | 默认值    | 说明                                     |
| --------------- | --------- | ---------------------------------------- |
| alt             | 必填      | 身份图像名称；纯装饰 Avatar 传空字符串   |
| src / srcSet    | undefined | 图片 URL / 响应式候选；空白 src 不发请求 |
| sizes           | undefined | srcSet 宽度候选的原生尺寸提示            |
| fallback        | undefined | 最高优先级静态回退                       |
| fallbackSrc     | undefined | 主图片失败后尝试一次的备用 URL           |
| initials        | undefined | 显式短缩写，优先于 alt 派生              |
| shape           | circle    | circle / rounded / square                |
| size            | medium    | small / medium / large / number          |
| fit             | cover     | CSS object-fit                           |
| objectPosition  | 50% 50%   | CSS object-position                      |
| loading         | eager     | 原生 eager / lazy                        |
| decoding        | async     | 原生 auto / async / sync                 |
| fetchPriority   | undefined | 原生 high / low / auto 请求提示          |
| crossOrigin     | undefined | 原生 CORS 模式                           |
| referrerPolicy  | undefined | 原生请求来源策略                         |
| draggable       | false     | 是否允许原生图片拖拽                     |
| ref             | undefined | 稳定根 span                              |
| imageRef        | undefined | 当前 img；空源/error/unmount 时为 null   |
| className/style | undefined | 根 span 样式入口                         |

其他安全的 span HTML 属性可透传。`children` 和 `dangerouslySetInnerHTML` 被禁止，避免调用方破坏内部 Image 状态结构。

## Events

- `onLoad(event)`：React 观察到当前 primary/fallback 的原生 load 时，Image 先进入 loaded，再透传事件。
- `onError(event)`：React 观察到原生 error 时透传；有 fallbackSrc 时主源失败先切到备用 loading，备用也失败才进入内容 error。

事件不能取消 Avatar 的状态迁移。正常的 primary 与 fallbackSrc 双失败可能收到两次 onError；若 hydration 前缓存已完成，状态会恢复但不会合成已经错过的 SyntheticEvent。需要恢复时由业务改变 src/srcSet/fallbackSrc；组件不会循环重试。

## 无障碍

- 非空 alt 是成功图片和失败回退的共同名称；initials 不能替代准确 alt。
- 空 alt 表示整个 Avatar 纯装饰，图片和 fallback 都不会进入 accessibility tree。
- loading fallback 被 aria-hidden，避免和仍存在的 img 重复朗读。
- 自定义 fallback 只放短文本或图标，不得放按钮、链接、输入框或 live region。
- Avatar 不进入 Tab 顺序。small 只有 32px，不能当触控目标；交互外层至少 44×44。
- shape、颜色和图片本身不能作为唯一状态信号；在线/失败等状态需相邻文本或有名称的 Badge。

## RTL、主题与兼容

Avatar 没有方向性布局，RTL 不改变裁切或内容顺序。背景、文字、圆角和字体使用 Meu Token；forced-colors 只绘制一个 CanvasText 外轮廓。图片淡入继承 Image 的 reduced-motion 0ms 关闭策略。

正式支持为 React 19、iOS Safari/WKWebView 15+ 与 Android Chrome/WebView 89+。Chrome 70 / iOS 13 仅是构建语法扫描与观察档，不构成完整运行时承诺。旧 WKWebView 可能把 native lazy loading 退化为 eager；loading/decoding 本来就是提示，不影响 fallback 正确性。跨域请求是否成功取决于图片服务器配置。

SSR 首帧只由 props 决定：空源输出 fallback，有源输出 loading placeholder + img。客户端 hydrate 后才检查已缓存图片，不读取随机值或布局，因此结构稳定。

## 测试证据

- `Avatar.test.tsx`：9 项 Unit，覆盖回退、事件、装饰语义、refs、响应式/请求属性、备用源、srcSet-only、换源恢复、尺寸和焦点变量。
- `Avatar.ssr.test.tsx`：2 项 SSR，覆盖可访问 fallback、响应式输出与无效尺寸归一化。
- `Avatar.hydration.test.tsx`：1 项真实 renderToString → hydrateRoot，断言 0 recoverable/console error、ref 恢复和 error fallback。
- `Avatar.stories.tsx`：图片、initials、自定义 fallback、三种 shape/预设与数值 size、响应式焦点、失败、RTL/装饰、Light/Dark。
- `tests/next-h5/e2e/avatar-contract.spec.ts`：受控网络闸门在 mobile Chromium/WebKit 各验证视口外 lazy 延迟请求、慢响应 fallback/`aria-busy`、native decode、不可解码失败与换源恢复，共 4 次引擎执行通过。
- 仓库既有 Storybook 390×844 七场景矩阵与 Next H5 Chromium/WebKit 场景已经覆盖 Avatar 基础和异步请求边界；Chromatic 与 VoiceOver/TalkBack 真机仍是待验证项。

本目录的快速验证命令：

```bash
pnpm --filter @meu/mobile exec vitest run src/Avatar --maxWorkers=1
pnpm --filter @meu/mobile typecheck
pnpm --filter @meu/next-h5-integration exec playwright test e2e/avatar-contract.spec.ts
```

## 未来变更规则

1. alt/fallback 优先级、非交互 span 根、ref 指向和公开 data 属性是兼容契约；改变时必须按破坏性变更处理。
2. 新图片能力以可选 prop 增加，默认值必须保持现有视觉、请求与 SSR 首帧。
3. 点击、在线状态、角标、编辑和上传留给 Button/Link、Badge、ImageUploader 组合，不进入 Avatar。
4. 每个新状态都要补 Unit、SSR/hydration、Story、无障碍和兼容说明；视觉状态还需 Light/Dark、RTL、forced-colors、200% 字体和 reduced-motion 证据。
5. 未实际运行的 Chromatic、外部网络或真机验证不得写成“已通过”。
