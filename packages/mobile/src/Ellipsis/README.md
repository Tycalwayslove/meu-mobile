# Ellipsis

商用级纯文本截断组件。按容器实际内容宽度支持单行/多行与 `start`、`middle`、`end` 三种保留方向，并提供受控或非受控展开。完整文本始终保留给辅助技术；视觉候选按 Unicode grapheme 截断，不拆开 emoji、旗帜或常见组合字符。

```tsx
import { Ellipsis } from "@meu/mobile";

<Ellipsis
  content={description}
  rows={2}
  direction="end"
  onExpandedChange={(expanded) => setAnalyticsState(expanded)}
/>;
```

受控模式：

```tsx
const [expanded, setExpanded] = useState(false);

<Ellipsis content={description} expanded={expanded} onExpandedChange={setExpanded} />;
```

## Props 与 Events

| Prop/Event          | 默认值   | 契约                                                        |
| ------------------- | -------- | ----------------------------------------------------------- |
| `content: string`   | 必填     | 完整纯文本                                                  |
| `rows`              | `1`      | 有限值向下取整且至少为 1；非有限值回退 1                    |
| `direction`         | `"end"`  | `"start" \| "middle" \| "end"`                              |
| `expanded`          | -        | 存在即受控；视觉状态只跟随调用方                            |
| `defaultExpanded`   | `false`  | 非受控初始值，仅首次挂载读取                                |
| `expandText`        | `"展开"` | falsy 时隐藏收起态操作                                      |
| `collapseText`      | `"收起"` | falsy 时隐藏展开态操作                                      |
| `expandAriaLabel`   | -        | 图标/含糊展开内容的 accessible name                         |
| `collapseAriaLabel` | -        | 图标/含糊收起内容的 accessible name                         |
| `onExpandedChange`  | -        | button 激活后回调 `(nextExpanded, event)`；受控时不乐观更新 |
| `onEllipsisChange`  | -        | 完成测量且截断布尔结果变化时回调                            |
| `ref` / `actionRef` | -        | 分别指向根 div 与当前操作 button                            |
| `remeasureKey`      | -        | 祖先排版改变但容器未 resize 时，改变该值强制重测            |
| 原生 div 属性       | -        | 除 `children`/`dangerouslySetInnerHTML` 外透传              |

根状态可通过 `data-state="pending|complete|collapsed|expanded"` 观测。`data-direction` 和 `data-meu-ellipsis-action` 也是稳定入口；生成 class 和隐藏测量 DOM 不是 API。

## 无障碍与键盘

- 完整文本通过视觉隐藏节点暴露，视觉候选 `aria-hidden`，不会把省略号当正文重复朗读。
- 操作为原生 `type="button"`，支持 Tab、Enter 和 Space，触控目标至少 44×44 CSS px，并用 `aria-expanded` 暴露状态。
- 自定义为图标或含糊内容时必须同时提供 `expandAriaLabel` 与 `collapseAriaLabel`。
- 操作内容只放简短文本或装饰图标；不要放交互控件、全局 id 或有副作用的组件，因为 `expandText` 也会渲染到隐藏测量镜像。
- 组件默认文案为中文；业务负责本地化正文、可见操作和无障碍名称。

## 测量、SSR 与兼容

服务端只输出完整辅助文本和稳定 CSS clamp fallback，不输出未经测量的按钮；客户端 effect 后生成精确候选，因此相同首屏 props 可稳定 hydration。测量直接读取同字体镜像的单行高度、扣除根左右 padding，并让隐藏 action 与真实按钮共享 footprint。

优先通过 `ResizeObserver` 响应容器变化；旧 WebView 回退到 window resize，并始终处理 orientationchange。字体在 `document.fonts.ready` 及后续 `loadingdone` 后重测；无 requestAnimationFrame 时回退 timer。组件自身 `className`/`style` 变化会重测；祖先样式或主题变量改变排版却没有触发尺寸通知时，应改变 `remeasureKey`。React 19 callback ref cleanup 会被透传，旧式 callback ref 仍在卸载时收到 null。RTL 间距使用逻辑属性，但 `start/end` 表示字符串数组的起止，不等同 bidi 视觉方向。

正式支持 iOS Safari/WKWebView 15+ 与 Android Chrome/WebView 89+，这些环境使用 `Intl.Segmenter` 保持完整 Unicode grapheme。更旧内核的 fallback 只覆盖常见 ZWJ emoji、旗帜、肤色、variation selector 与部分组合附加符，并非完整 UAX #29；Indic spacing mark/virama、Hangul Jamo 与 CRLF 的精确聚合属于观察档限制。

宽度为 0 或无法得到有效行高时保持 pending，等待后续 resize/font 通知。仅支持纯文本；富文本、链接混排、法律文本和必须立即阅读的错误信息不应使用。

容器比 44px 操作触控目标更窄，或“省略号 + action”无法放入允许行数时，action 可能额外占一行。应扩大容器、使用 `expandText={null}` 纯截断，或在外部提供全文入口；组件不会缩小触控目标来强行满足行数。

## 测试证据

- `Ellipsis.test.tsx`：方向、展开、受控/非受控、键盘、回调、测量和全部回退、字体、ref、RTL 属性、rows、grapheme。
- `Ellipsis.ssr.test.tsx`：服务端完整内容与稳定 clamp fallback。
- `Ellipsis.hydration.test.tsx`：真实 SSR→hydrateRoot，根 DOM 复用、0 hydration error、测量后按钮和交互。
- `Ellipsis.stories.tsx`：单/多行、三方向、受控交互、图标操作、纯截断、窄宽 RTL。
- 本轮目标命令为 `pnpm --filter @meu/mobile exec vitest run src/Ellipsis --maxWorkers=1`；Storybook 静态构建、Chromatic、Vercel 和真机读屏留给发布批次。

## 未来变更规则

默认值、受控判定、事件时序和完整辅助文本属于兼容契约。新增富文本、方向或自定义标记前必须先定义 grapheme/bidi/复制/读屏行为。任何 action 样式变更必须同步隐藏镜像并补窄宽测试；任何测量调度变更必须保留 ResizeObserver、旧 WebView、字体、零宽、卸载和 hydration 证据。公共 API 变化必须同步类型、测试、Story、README 与 [`Ellipsis.docs.mdx`](./Ellipsis.docs.mdx)。

更完整的状态、性能、历史矩阵与变更记录见 [`Ellipsis.docs.mdx`](./Ellipsis.docs.mdx)。
