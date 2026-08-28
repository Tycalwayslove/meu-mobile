# @meu/test-utils

Meu Mobile 的共享测试基础，统一组件的 Provider、SSR/hydration、locale/RTL、reduced-motion 和 axe 无障碍验证方式。该包仅用于测试，不进入应用运行时。

## Render 与 Provider

`renderWithMeu` 保持原有默认值：`locale="zh-CN"`、`theme="light"`。它接受 Testing Library 的全部 render options，并额外支持 `locale`、`theme`、`direction` 和 `portalContainer`。

```tsx
import { renderWithMeu, renderWithMeuLocale, renderWithMeuRtl } from "@meu/test-utils";

renderWithMeu(<Button>保存</Button>);
renderWithMeuLocale(<Button>Continue</Button>, "en-US", { theme: "dark" });
renderWithMeuRtl(<Pagination current={2} total={8} />, { locale: "en-US" });
```

需要自行组合 Provider 时，可直接使用 `MeuTestProvider`。RTL 是独立的布局轴，不会根据目前仅有的 `zh-CN` / `en-US` locale 自动推断。

## SSR 与 hydration

```tsx
import { hydrateWithMeu, renderMeuToString } from "@meu/test-utils";

const ui = <PasscodeInput aria-label="验证码" />;
const serverHTML = renderMeuToString(ui, { locale: "zh-CN" });
const view = hydrateWithMeu(ui, { serverHTML, locale: "zh-CN" });
```

`hydrateWithMeu` 未传 `serverHTML` 时会先生成相同 Provider 配置的服务端 HTML。若组件预期服务端不渲染内容，应单独断言 `renderMeuToString` 的结果。

## document locale 与 RTL

组件若读取全局 `document.documentElement`，使用 `setTestDocumentLocale`，并在测试结束时调用返回的恢复函数。

```ts
const restore = setTestDocumentLocale({ locale: "ar", direction: "rtl" });
try {
  // assertions
} finally {
  restore();
}
```

## Reduced motion

```ts
const motion = installReducedMotionMock(true);
try {
  expect(window.matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true);
  motion.setReducedMotion(false);
} finally {
  motion.restore();
}
```

控制器支持现代 `change` 事件与旧版 `addListener`。每个测试都必须 `restore()`，避免污染后续用例。

## Axe

```tsx
const { container } = renderWithMeu(<Button>提交</Button>);
await assertNoAxeViolations(container);
```

- `runAxe(context?, options?)` 返回 `AxeResults`，适合精确断言规则。
- `assertNoAxeViolations(context?, options?)` 在发现问题时抛出包含 rule、impact 和 DOM target 的错误。
- jsdom 无法计算真实颜色，默认关闭 `color-contrast` 规则；颜色对比必须在浏览器视觉审计中验证。传入的同名规则可以覆盖默认值。
- axe 是自动化基线，不能替代键盘、触控、读屏器和真实移动浏览器验证。

## API

| API                        | 用途                               |
| -------------------------- | ---------------------------------- |
| `MeuTestProvider`          | 可组合的 ConfigProvider 测试包装器 |
| `renderWithMeu`            | 默认中文亮色的通用 render          |
| `renderWithMeuLocale`      | 明确 locale 的 render              |
| `renderWithMeuRtl`         | 明确 RTL 布局的 render             |
| `renderMeuToString`        | 使用相同 Provider 生成服务端 HTML  |
| `hydrateWithMeu`           | 对服务端 HTML 执行真实 hydration   |
| `setTestDocumentLocale`    | 临时设置并恢复 document lang/dir   |
| `installReducedMotionMock` | 控制并恢复 prefers-reduced-motion  |
| `runAxe`                   | 返回 axe 原始检查结果              |
| `assertNoAxeViolations`    | 将 axe violations 转为测试失败     |

公开类型包括 `MeuRenderOptions`、`MeuHydrateOptions`、`MeuTestProviderOptions`、`MeuDirection`、`ReducedMotionController`、`AxeResults` 和 `RunOptions`。
