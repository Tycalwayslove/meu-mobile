# Product

## Register

product

## Users

Meu Mobile 面向开发移动 Web、PWA 与 Hybrid WebView 的 React 团队，首要消费者是 Next.js H5 商城。使用者需要在 360–430 CSS px 的移动界面中快速组合表单、导航、反馈、选择器和高成本交互，并在更换电脑、仓库或业务项目后仍能从代码、类型与文档恢复完整契约。后续 uni-app 适配复用 Token、行为契约和平台无关逻辑，但 Web 组件不会伪装成可直接运行的原生组件。

## Product Purpose

Meu Mobile 提供一套可长期维护、可验证、可商用的移动 React 组件。成功不是组件数量增加，而是每个公开组件都具备稳定 API、完整状态、移动触摸与键盘行为、表单集成、SSR/RTL/WebView 兼容性、无障碍证明以及与源码共置的永久文档。当前不发布 npm，先通过 workspace、线上官网、Storybook、Chromatic 和隔离 Next H5 测试站完成验收。

## Brand Personality

克制、可靠、精确。界面应像高频使用的随身工具：信息密度适中，以排版、留白和结构线表达层级，松柏绿只承担操作与状态强调。交互反馈清楚直接，动效说明状态变化，不抢占用户注意力。

## Anti-references

- 不做桌面组件缩窄后的伪移动界面，也不使用低于 44×44 CSS px 的交互目标。
- 不使用玻璃拟态、霓虹发光、彩虹渐变、装饰粒子、无意义大圆角卡片墙或第二品牌强调色。
- 不以自定义控件替代成熟原生语义，不用颜色作为状态的唯一表达，不发布无标签输入或无焦点管理的浮层。
- 不用静态 Story、语法扫描或通过单个浏览器的结果冒充完整的商用兼容证明。
- 不复制 Ant Design Mobile、Vant、React Aria、Ionic 或 Material Design 的视觉和实现；只吸收其移动业务覆盖、交互质量、兼容策略与可访问性标准。

## Design Principles

1. **契约先于外观。** 先冻结受控状态、事件原因、表单语义、Ref 和兼容边界，再完善视觉与动效。
2. **原生语义优先。** 能用 button、input、textarea、label 和 form 完成的能力，不发明替代交互。
3. **移动场景决定实现。** 以触摸、软键盘、安全区、WebView、窄屏、长文本和外接键盘作为默认条件。
4. **动效只解释状态。** 进入、退出、加载和手势反馈可使用短时动效；所有动效必须可中断并支持 reduced motion。
5. **文档和证据属于组件。** 每次组件改动必须同步类型、测试、Story、共置 MDX、官网清单和变更记录，不能依赖聊天记录或个人电脑状态。

## Accessibility & Inclusion

所有首发组件以 WCAG 2.2 AA 为基线。正文对比度至少 4.5:1，大号文字与非文字 UI 至少 3:1；所有功能可通过键盘完成，复杂模式遵循 WAI-ARIA APG。交互目标至少 44×44 CSS px，状态与错误同时使用文字、图标或形状表达。组件必须支持 200% 字号、强制色彩、高对比、RTL、中英文长文案、读屏名称与状态、焦点恢复和 `prefers-reduced-motion`。发布候选还需留下 iOS Safari/VoiceOver 与 Android Chrome/TalkBack 的真实设备记录。
