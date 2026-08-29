# Watermark

完整、永久的组件契约与测试证据见 [Watermark.docs.mdx](./Watermark.docs.mdx)。

用于移动 H5 内容的版权提示与泄露追踪。它在容器内绘制不可交互的重复 SVG 图案，不改变子内容语义，也不进入表单绑定层。

```tsx
<Watermark content={["Meu Mobile", operatorId]}>
  <OrderReceipt />
</Watermark>
```

## 内容与布局

- `content` 支持单行字符串、换行字符串或字符串数组；`image` 优先，加载失败时回退到 `content`。
- 平铺定义包含三枚相同图片，但 `onImageLoad` / `onImageError` 对当前 URL 的一次尝试合计最多触发一次，以首先收到的终态事件为准；URL 变化会开始新尝试。重试同一 URL 时请更换 cache-buster 或重新挂载。
- `width/height` 定义单枚水印的内容盒，`gap` 定义平铺间距，`offset` 定义相对容器左上角的首枚偏移，默认角度为 `-22°`。
- 采用交错两行平铺，旋转后的外接尺寸参与图案计算，因此不会切掉文字或图片边角。
- 图片建议使用 Meu 自有或已获授权的 SVG/PNG，并提供至少 2x 的源尺寸；不要直接使用未知许可的品牌或图库素材。
- 组件不创建 object URL，也不会接管 `image` URL 的生命周期；调用方创建的 blob URL 应在 URL 不再使用或组件卸载后自行 `URL.revokeObjectURL`。外链图片是否可加载、打印或被 canvas 截图仍受 CORS、CSP 和宿主策略约束。

## 无障碍、主题与 SSR

- 水印 SVG 固定为 `aria-hidden`、`focusable=false`、`pointer-events:none`，真实内容与操作仍由 children 提供。
- 默认颜色使用 `--meu-color-muted`，会随 Light/Dark/System token 变化；可通过 `font.color` 覆盖。
- 服务端与客户端首屏输出同一份 SVG，不读取 `window/document`，适合 Next.js SSR 与 hydration。
- 默认监听水印节点的删除或篡改并自动重建，`onRemove` 只用于审计提示；高可信宿主可用 `tamperProtection={false}` 关闭观察。
- SVG 使用百分比 viewport 与矢量 pattern，容器尺寸变化会由浏览器自动重排，不依赖 `ResizeObserver`、DPR 监听或 window resize fallback；文字与 SVG 图片保持矢量清晰度，位图清晰度仍取决于源资源。
- wrapper 的 `overflow:hidden` 与 Figma `clipsContent=true` 一致，overlay 还通过绝对定位的 100% SVG viewport 和自身 `overflow:hidden` 双重限制在 host 边界内。需要阴影、sticky 或越界提示的业务内容不应直接把 Watermark 当作无裁切包装器。
- SVG 是真实前景元素而非 CSS background，并设置 print color adjustment 提示；浏览器/系统仍可选择省墨或分页策略，打印/PDF、长容器跨页和第三方截图工具必须在业务导出链路验收。

## 安全边界

Watermark 只能提高复制成本、标识来源，不能阻止开发者工具删除、截图、录屏、OCR 或二次编辑。敏感数据仍必须依靠鉴权、最小授权、脱敏、审计和服务端访问控制。

`tamperProtection` 只观察 overlay 自身和它从直接 host 被移除的情况，不扫描业务 children。它按逆序恢复同一批 DOM 变更、卸载时断开 observer，并避免删除已经移到 overlay 外的临时节点；它仍不是跨 Realm、关闭 JavaScript 或恶意 CSS 注入的安全边界。

## uni-app 边界

内容、图片回退、几何、间距、偏移和旋转契约可以复用；Web 端 SVG、DOM MutationObserver、CSS token 与 React ref 属于 H5 适配层，uni-app 版本应使用 canvas/native view 重新实现渲染和宿主观察。
