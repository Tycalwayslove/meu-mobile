# ImageUploader

完整、永久的组件契约与测试证据见 [ImageUploader.docs.mdx](./ImageUploader.docs.mdx)。

用于商品图、评价图和凭证图片的选择、上传、失败重试、删除与预览。组件只管理上传任务和展示，网络传输由
调用方通过 `upload` 注入。

```tsx
const [images, setImages] = useState<ImageUploaderItem[]>([]);

<ImageUploader
  value={images}
  maxCount={6}
  upload={async (file, { signal, onProgress }) => {
    const result = await uploadProductImage(file, { signal, onProgress });
    return { url: result.url, thumbnailUrl: result.thumbnailUrl, alt: file.name };
  }}
  onChange={setImages}
/>;
```

## 值与任务

- `value / defaultValue / onChange` 只包含可序列化的 `ImageUploaderItem[]`。成功值不保存 `File`、object URL、
  `AbortSignal`、进度或异常对象。
- `upload(file, { signal, onProgress, taskId })` 由调用方接入 fetch、XHR、预签名 URL 或业务 SDK。组件不创建
  HTTP client，不猜测接口返回结构。
- 选择文件后建立 pending / uploading / error 任务。失败任务可以重试或删除；删除上传中任务和组件卸载都会
  abort 当前请求并回收 object URL。
- `onUploadQueueChange` 只用于观察临时任务，不应作为需要持久化或提交的表单值。

## 选择与校验

- 真实 `<input type="file">` 是选择、capture、焦点和可访问名称的事实源。`accept` 默认 `image/*`，同时作为
  原生选择提示与运行时校验条件。
- `maxCount` 同时统计成功项和活动任务；`maxSize` 支持字节上限或函数；`beforeUpload` 可异步拒绝或转换文件。
- `onReject` 区分 accept / max-size / before-upload / max-count；`onCountExceed` 提供超出数量。
- `onDelete` 可异步返回 `false` 阻止删除。readOnly 保留预览但禁止选择、重试和删除；disabled 同时禁用预览。

## 展示与表单

- 成功图片复用 Meu `Image`，预览复用 `ImageViewer`；add、delete、retry 都是至少 44×44px 的原生按钮。
- `renderItem` 可替换成功项外观；`renderUpload` 必须把收到的真实 input 保留在返回树中。
- `MeuFormImageUploader` 在 `@meu/form-react` 中绑定 React Hook Form 数组字段，负责 dirty / touched、错误关联、
  schema 校验和失败时聚焦真实 input。核心组件仍可脱离表单使用。
- 未来 uni-app 复用成功项、任务状态、校验原因和回调语义，重新实现文件选择、上传取消、object URL 与 DOM
  焦点层；公共成功值无需迁移。
