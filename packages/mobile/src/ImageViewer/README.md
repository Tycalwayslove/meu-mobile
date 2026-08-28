# ImageViewer

用于商品图、评价图和凭证图片的全屏预览。单图与多图使用同一 API，并保留关闭、前后切换、缩放与复位的
原生按钮，手势不是唯一操作路径。

```tsx
const [open, setOpen] = useState(false);
const [index, setIndex] = useState(0);

<ImageViewer
  open={open}
  images={[
    { src: "/front.jpg", alt: "商品正面" },
    { src: "/detail.jpg", alt: "商品细节" }
  ]}
  index={index}
  onIndexChange={setIndex}
  onOpenChange={setOpen}
/>;
```

## 契约

- `open / defaultOpen / onOpenChange` 只管理预览层显示，关闭原因区分 close-button / escape。
- `index / defaultIndex / onIndexChange` 支持受控和非受控图片索引，并区分 drag / previous / next /
  imperative；受控调用方不提交新索引时，当前图片保持权威值。
- `images` 的每一项必须提供 `alt`。图片 loading / error 复用 Meu `Image`，错误不会让关闭操作消失。
- 默认不循环，显示页码；`renderFooter` 可显示标题或业务操作，但业务下载、分享和权限仍由调用方负责。
- 默认支持最大 3× 的双指/双击缩放和放大后平移。缩放大于 1 时停止横向切图，避免手势竞争。
- Full controls 提供关闭、上一张、下一张、放大、缩小、复位；键盘支持 Escape、方向键、`+`、`-`、`0`。
  Minimal controls 只保留关闭和页码，适合宿主提供自定义操作的场景。
- Web 实现使用 Portal、厚 Mask、页面滚动锁、焦点圈定与返回焦点。图片单击和遮罩单击不会关闭，避免与
  双击缩放冲突。
- `ImageViewerRef` 只暴露平台中立的 goTo / previous / next / resetZoom 与 nativeElement。

该展示组件不绑定表单字段，因此不提供 form-react adapter。未来 uni-app 复用图片、索引、缩放、关闭原因和
命令式契约，替换 Portal、DOM 焦点与手势适配层。
