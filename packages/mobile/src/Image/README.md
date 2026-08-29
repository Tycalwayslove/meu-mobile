# Image

Image 是 `@meu/mobile` 的原生图片状态原语。它保留 `img` 的替代文本、响应式候选、浏览器懒加载和请求提示，同时提供稳定容器、加载占位、一次备用来源和最终错误视觉。

```tsx
import { Image } from "@meu/mobile";

<Image
  src={product.image}
  srcSet={`${product.imageSmall} 480w, ${product.imageLarge} 960w`}
  sizes="(max-width: 480px) 100vw, 480px"
  fallbackSrc={product.originalImage}
  alt={product.name}
  width="100%"
  aspectRatio="4 / 3"
  fit="cover"
  position="center"
  loading="lazy"
  radius="surface"
/>;
```

## 行为契约

来源链固定为 primary `src/srcSet` → 单个 `fallbackSrc` → visual `fallback`，不会无限重试。无 primary 但有 `fallbackSrc` 时直接请求备用来源；任一来源 prop 变化会开始新的 loading 周期。

`data-state` 公开 `loading | loaded | error`，`data-source` 公开 `primary | fallback`。最终 error 会卸载损坏的 img：非空 `alt` 由 root 继续以图片语义暴露，`alt=""` 的装饰内容保持隐藏。

## API 摘要

| 能力         | Props                                                                                |
| ------------ | ------------------------------------------------------------------------------------ |
| 来源与响应式 | `src`, `srcSet`, `sizes`, `fallbackSrc`                                              |
| 原生请求提示 | `loading`, `decoding`, `fetchPriority`, `crossOrigin`, `referrerPolicy`, `draggable` |
| 稳定布局     | `width`, `height`, `aspectRatio`, `intrinsicWidth`, `intrinsicHeight`                |
| 裁切与外观   | `fit`, `position`, `radius`, `className`, `style`                                    |
| 状态视觉     | `placeholder`, `fallback`                                                            |
| 原生扩展     | `imageProps`（非冲突 img 属性，className/style 会合并）                              |
| 事件与引用   | `onLoad`, `onError`, root `ref`, native `imageRef`                                   |

`alt` 必填；纯装饰图片传空字符串。数字 width/height 归一为非负 root CSS 尺寸；两者均为正数时自动转成可随 `max-width:100%` 收缩的比例盒，同时继续作为默认原生尺寸。`intrinsicWidth/intrinsicHeight` 可单独覆盖 img 固有尺寸，推荐与 `width="100%" + aspectRatio` 配合，彻底分离布局与资源比例。

`onLoad/onError` 只透传 React 实际观察到的原生事件；正常的 primary 与备用来源双失败会各触发一次 error。若 SSR 图片在 hydration 前已经从缓存完成，组件会用 `complete/naturalWidth` 恢复状态，但不会伪造已经错过的 SyntheticEvent。业务重试应改变来源 prop，不通过 DOM 命令绕过状态机。

## 无障碍与组合

- alt 描述图片传达的信息；相邻文字已完整表达且图片无额外信息时使用 `alt=""`。
- placeholder/fallback 仅是视觉槽位，不放按钮、链接、另一张带 alt 的图片或 live region。
- Image 本身不交互；需要点击时放入语义正确且满足触控尺寸的 Button/Link。
- `imageProps` 可向 native img 添加 `aria-describedby`、`title`、`data-*` 等属性，不能覆盖由顶层 props 管理的来源、alt、名称、隐藏、role、事件和请求字段；运行时也会防御经 `any` 注入的冲突无障碍属性。

## SSR、兼容与性能

服务端首帧不读取浏览器状态；有来源时输出 placeholder + img，无来源时输出可访问 fallback，hydration 后才检查已缓存完成的图片。组件不是 `next/image` 的替代品，不提供 CDN loader、preload、服务端裁图或 blur data URL。

完整支持范围继承仓库 V2 矩阵（iOS Safari/WKWebView 15+、Android Chrome/WebView 89+）。旧 WebView 不支持 native lazy 时退化为 eager；观察档若不支持 `aspect-ratio`，仍可从原生 intrinsicWidth/intrinsicHeight 获得资源比例，但 wrapper 的预留高度可能降级。`fetchPriority` 不被支持时只会忽略提示。

长列表使用 `loading="lazy"` 和 CDN 裁剪；首屏 LCP 图片通常保持 eager 并按应用性能策略设置优先级。没有稳定尺寸或比例仍可能产生 CLS。

## 测试与维护

组件目录永久保留以下证据：

- `Image.test.tsx`：原生属性、三态、缓存完成检测、备用来源链、来源重置、布局/裁切、装饰语义、双 refs 与 React 19 callback-ref cleanup。
- `Image.ssr.test.tsx`：服务端原生 markup、响应式提示、无源和备用来源。
- `Image.hydration.test.tsx`：有源/无源节点复用与 hydration 零报错。
- `Image.stories.tsx`：loading、loaded、error、fallbackSrc、lazy、响应式裁切和 Light/Dark。

未来变更必须保持 alt 必填、既有默认值、三态、有限来源链和双 ref 兼容；新增 native 属性需明确覆盖顺序并补 Unit + SSR/hydration；错误语义变更必须覆盖 informative/decorative alt 和事件次数。浏览器支持声明只有在独立消费者与真实设备证据完成后才能扩大。

完整 Props/Events、边界、测试证据和未来变更规则见 [Image.docs.mdx](./Image.docs.mdx)。
