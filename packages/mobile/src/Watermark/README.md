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
- `width/height` 定义单枚水印的内容盒，`gap` 定义平铺间距，`offset` 定义相对容器左上角的首枚偏移，默认角度为 `-22°`。
- 采用交错两行平铺，旋转后的外接尺寸参与图案计算，因此不会切掉文字或图片边角。
- 图片建议使用 Meu 自有或已获授权的 SVG/PNG，并提供至少 2x 的源尺寸；不要直接使用未知许可的品牌或图库素材。

## 无障碍、主题与 SSR

- 水印 SVG 固定为 `aria-hidden`、`focusable=false`、`pointer-events:none`，真实内容与操作仍由 children 提供。
- 默认颜色使用 `--meu-color-muted`，会随 Light/Dark/System token 变化；可通过 `font.color` 覆盖。
- 服务端与客户端首屏输出同一份 SVG，不读取 `window/document`，适合 Next.js SSR 与 hydration。
- 默认监听水印节点的删除或篡改并自动重建，`onRemove` 只用于审计提示；高可信宿主可用 `tamperProtection={false}` 关闭观察。

## 安全边界

Watermark 只能提高复制成本、标识来源，不能阻止开发者工具删除、截图、录屏、OCR 或二次编辑。敏感数据仍必须依靠鉴权、最小授权、脱敏、审计和服务端访问控制。

## uni-app 边界

内容、图片回退、几何、间距、偏移和旋转契约可以复用；Web 端 SVG、DOM MutationObserver、CSS token 与 React ref 属于 H5 适配层，uni-app 版本应使用 canvas/native view 重新实现渲染和宿主观察。
