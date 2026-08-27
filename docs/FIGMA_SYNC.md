# Figma 同步规则

Figma 用于视觉设计、变量、组件变体与 Code Connect；仓库中的设计 token 和组件契约仍是可审查的
事实源。

同步顺序固定为：Discovery → Gap Analysis → Foundations → Components → Code Connect → QA。
任何写入前必须先比较 Figma 与仓库值。遇到冲突时记录双方来源并明确选择，不做静默覆盖。

当前 Design 文件已依据 `meu-design` 与代码契约创建：

- 文件：[Meu Mobile Design System](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v)
- 文件夹：`645308087`
- 首轮范围：Foundations、Meu 图标、Button、Field、TextInput、FormTextInput 与治理说明
- Batch 2A 页面：[Components/TextArea-SearchField](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v/Meu-Mobile-Design-System?node-id=42-6)
- TextArea 组件集：[Meu/TextArea（44:71）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v/Meu-Mobile-Design-System?node-id=44-71)，24 个 variants
- SearchField 组件集：[Meu/SearchField（45:89）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v/Meu-Mobile-Design-System?node-id=45-89)，30 个 variants
- Batch 2B：Checkbox、Radio、Switch 共 90 个 atomic variants，覆盖三档尺寸、选择状态、focus/error/disabled 与 loading。
- Checkbox 组件集：[small（50:65）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=50-65)、[medium（50:125）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=50-125)、[large（50:185）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=50-185)，共 36 个 variants
- Radio 组件集：[small（50:224）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=50-224)、[medium（50:263）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=50-263)、[large（50:302）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=50-302)，共 24 个 variants
- Switch 组件集：[small（50:359）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=50-359)、[medium（50:414）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=50-414)、[large（50:469）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=50-469)，共 30 个 variants
- 组合展板：[CheckboxGroup（50:471）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=50-471)、[RadioGroup（50:501）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=50-501)
- Batch 2C 页面：[Stepper-Slider-Rate-Selector（53:8）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=53-8)，共 79 个 variants
- Stepper 组件集：[Default（54:74）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=54-74)、[Min（54:147）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=54-147)、[Max（54:220）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=54-220)，共 36 个 variants
- Slider 组件集：[Meu/Slider（56:134）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=56-134)，12 个 variants
- Rate 组件集：[Meu/Rate（57:197）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=57-197)，15 个 variants
- Selector 组件集：[Meu/Selector（58:66）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=58-66)，16 个 variants
- Batch 2C 验证展板：[Core combinations（59:2）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=59-2)、[Dark mode（59:66）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=59-66)；可见 fill / stroke 的变量绑定缺口为 0
- Batch 3A Cell 页面：[页面（67:214）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=67-214)、[Meu/Cell（67:482）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=67-482)，24 个 `Interactive × Description × Prefix × State` variants
- Batch 3A List 页面：[页面（70:2）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=70-2)、[Meu/List（70:589）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=70-589)，12 个 `Mode × Divider × Header` variants
- Batch 3A 明暗主题展板：[Cell Light / Dark（67:483 / 67:501）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=67-483)、[List Light / Dark（70:590 / 70:632）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=70-590)；组件树硬编码 paint 为 0，代码映射候选为 `packages/mobile/src/List/Cell.tsx` 与 `packages/mobile/src/List/List.tsx`
- Batch 3B1 页面：[Tag（77:2）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=77-2)、[Badge（77:3）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=77-3)、[Avatar（77:4）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=77-4)、[Image（77:5）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=77-5)、[Ellipsis（77:6）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=77-6)
- Tag 组件集：[small（79:62）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=79-62)、[medium（79:123）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=79-123)、[large（79:184）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=79-184)，共 90 个 variants
- Badge / Avatar 组件集：[Meu/Badge（81:52）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=81-52)，20 个 variants；[Meu/Avatar（83:88）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=83-88)，27 个 variants
- Image / Ellipsis 组件集：[Meu/Image（85:90）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=85-90)，24 个 variants；[Meu/Ellipsis（87:74）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=87-74)，18 个 variants
- Batch 3B1 QA：共 179 个 variants、1677 个变量绑定字段、253 个组件属性引用、18 个 44 px 交互示例；硬编码可见 paint 与未命名节点均为 0。新增 `color/accent-contrast` Light/Dark 语义变量（`var(--meu-color-accent-contrast)`）并重绑 accent solid 前景色
- Batch 3B2 页面：[Card（101:2）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=101-2)、[Collapse（106:2）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=106-2)
- Batch 3B2 组件集：[Meu/Card（102:110）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=102-110)，12 个 `Variant × Padding` variants；[Meu/Collapse（106:34）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=106-34)，4 个 `Variant × State` variants
- Batch 3B2 QA：Light/Dark 显式模式、Foundation 变量绑定、PascalCase 命名、metadata、截图与 44 px 触控目标均通过；组件 variants 内可见 fill / stroke 硬编码为 0。Card 保持非交互，Collapse 的视觉状态对应原生 button 与 ARIA 代码契约
- Batch 3C1 页面：[NavBar（110:5）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=110-5)、[SegmentedControl（110:657）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=110-657)、[PaginationDots（110:661）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=110-661)
- Batch 3C1 组件集：[Meu/NavBar（111:673）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=111-673)，2 个 Back variants；[Meu/SegmentedControl（114:112）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=114-112)，12 个 `Size × Status × State` variants；[Meu/PaginationDots（116:28）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=116-28)，4 个 `Direction × Variant` variants
- Batch 3C1 QA：Light/Dark Foundation 绑定、命名、metadata 与代码 API 对齐；组件树硬编码可见 paint 和未命名节点均为 0。NavBar / SegmentedControl 交互目标不小于 44 px，PaginationDots 保持只读，不伪造点击目标
- Batch 3C2 页面：[Tabs（120:2）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=120-2)、[TabBar（123:2）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=123-2)、[Steps（124:2）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=124-2)
- Batch 3C2 组件集：[Meu/Tabs（122:794）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=122-794)，8 个 `Activation × Stretch × DestroyInactive` variants；[Meu/TabBar（123:767）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=123-767)，6 个 `State × SafeArea` variants；[Meu/Steps（124:1080）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=124-1080)，24 个 `Direction × Current × Status` variants
- Batch 3C2 QA：组件树硬编码可见 paint 和未命名节点均为 0；Tabs 的交互目标高度为 44 px，TabBar 为 56 px，Steps 保持只读有序列表语义。Tabs 同时覆盖自动/手动激活、拉伸与按需销毁内容，且默认保留面板内部状态
- Batch 4A 页面：[Progress（128:2）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=128-2)、[Skeleton（130:2）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=130-2)、[Empty（131:2）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=131-2)、[Result（132:2）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=132-2)
- Batch 4A 组件集：[Meu/Progress（129:170）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=129-170)，24 个 `Size × Tone × State` variants；[Meu/Skeleton（130:23）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=130-23)，6 个 `Variant × Animated` variants；[Meu/Empty（131:25）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=131-25)，2 个 Illustration variants；[Meu/Result（133:112）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=133-112)，10 个 `Status × Actions` variants
- Batch 4A QA：四个组件的属性、变体矩阵、Light/Dark Foundations 绑定和页面说明均通过；组件树硬编码可见 fill 与未绑定 stroke 均为 0。Progress 明确 determinate/indeterminate 语义，Skeleton 保持装饰性并由调用方设置 `aria-busy`，Empty 强制原因与下一步操作，Result 不内置路由、重试或自动跳转
- Batch 4B 页面：[Mask（144:2）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=144-2)、[Popup（145:2）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=145-2)
- Batch 4B 组件集：[Meu/Mask（149:47）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=149-47)，6 个 `Opacity × Dismissible` variants；[Meu/Popup（151:724）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=151-724)，8 个精选 `Position × Mask × CloseButton × SafeArea` variants
- Batch 4B QA：新增 `color/overlay` Light/Dark 语义变量并提供 Web syntax，Mask 与 Popup 未绑定 solid fill 和未命名节点均为 0；Popup 四方向、遮罩、关闭按钮和安全区均有覆盖，关闭目标为 44 × 44 px。代码同时验证引用计数滚动锁、最上层 Escape/Tab、焦点恢复和 Portal SSR 边界
- Batch 4C Dialog 页面：[Dialog（154:2）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=154-2)；组件集：[Meu/Dialog（156:1019）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=156-1019)，27 个 `Tone × Actions × State` variants
- Batch 4C Dialog QA：Light / Dark 预览为 `157:5 / 157:14`，Title、Description 与三项 Action 均为文本属性；未命名节点、重复 variant、未绑定 fill / stroke 和 44 px 触控失败均为 0，108 个圆角全部绑定 Foundation 变量。`actionLayout=auto | horizontal | vertical` 写入组件说明，三操作样例按 auto 规则纵排；Figma 的 `Tone` 是设计场景轴，映射代码 `actions[].tone` 与主操作样式，不是 `Dialog.tone` 顶层 API
- Batch 4C Toast 页面：[Toast（164:2）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=164-2)；组件集：[Meu/Toast（165:812）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=165-812) 与 [Meu/Toast / Entering（167:816）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=167-816)，分别包含 24 个 `Tone × Position × Content` variants
- Batch 4C Toast QA：Default / Entering 两套组件均覆盖 neutral、success、warning、danger，top、center、bottom 以及 message / action；Entering 以 0.72 opacity 静态表达内部进入动效，不虚构公开 state API。两套组件共 288 个可见 paint 变量绑定，未绑定为 0，重复 variant 为 0，操作目标高度为 44 px；Light / Dark 预览、默认 3 秒、Undo 至少 5 秒、读屏播报与不抢焦点说明均已验证
- Batch 4D Popover 页面：[Popover（172:2）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=172-2)；文档与画布为 [172:7](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=172-7) / [172:35](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=172-35)，组件集为 [Meu/Popover（172:264）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=172-264)
- Batch 4D Popover QA：24 个 `Placement × Arrow` variants 覆盖四方向的 center / start / end 与箭头开关；216 个可见 paint 全部绑定 Foundation 变量，未绑定、重复 variant、未命名层与小于 44 px 的锚点均为 0，24 个浮层均应用阴影。Light / Dark 预览为 `172:61`；open、trigger、dismiss reason、Portal、collision、focus 与非模态限制仅作为运行时契约记录，不虚构为视觉 variant
- Batch 4D BottomSheet 页面：[BottomSheet（176:2）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=176-2)；文档、画布与主题预览为 [176:7](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=176-7) / [176:32](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=176-32) / [176:58](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=176-58)，组件集为 [Meu/BottomSheet（178:102）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=178-102)
- Batch 4D BottomSheet QA：8 个 `Title × Height` variants 覆盖有无标题与 Content / Peek / Half / Full 代表性高度；120 个可见 paint 全部绑定 Foundation 变量，未绑定、重复 variant、未命名层与小于 44 px 的拖拽手柄均为 0，8 个浮层均应用阴影。受控/非受控可见性、snapPoints 归一化、无障碍命名、handle-only 拖拽与键盘等价操作、dismiss reasons、Portal / Mask / 滚动锁 / 焦点恢复 / safe area / forceMount 均记录为运行时契约，不虚构为视觉 variant
- Batch 4D ActionMenu 页面：[ActionMenu（184:4）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=184-4)；Light / Dark 主题预览为 [186:5](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=186-5) / [186:22](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=186-22)，组件集为 [Meu/ActionMenu（187:123）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=187-123)
- Batch 4D ActionMenu QA：8 个 `Header × Groups × Emphasis` variants 覆盖有无标题、单组/多组与 neutral/danger；138/138 个相关 paint 绑定 Foundation 变量，Neutral 使用 `color/ink`、Danger 使用 `color/danger`，40 个动作行均不小于 44 px，未命名节点和重复直接子节点均为 0。模态 dialog、原生 button、危险操作 Dialog 确认、异步关闭锁、dismiss reasons、Provider 和焦点恢复均记录为运行时契约；Code Connect 因当前权限状态保持未连接，不虚构映射
- Batch 5 Picker 页面：[Picker（199:175）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=199-175)；组件集：[Meu/Picker（199:92）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=199-92)；Light / Dark 预览为 [199:109 / 199:150](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=199-109)
- Batch 5 Picker QA：4 个 `Columns × Header` variants 覆盖单列/三列代表布局与有无标题栏；86/86 个 paint 绑定 Foundation 变量，未绑定、未命名和重复 variant 均为 0；4 个取消/确定按钮均为 84×44px。滚轮固定 5×48px，跨列连续选中窗、上下 fade 和 disabled 内容示例齐全；draft、confirm/cancel、listbox、Portal、focus、scroll/snap 等仅记录为运行时契约，不伪造视觉状态轴
- Batch 5 CascadePicker 页面：[CascadePicker（210:2）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=210-2)；组件集：[Meu/CascadePicker（212:100）](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=212-100)；文档与 Light / Dark 预览为 [223:2 / 223:30 / 223:64](https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v?node-id=223-2)
- Batch 5 CascadePicker QA：4 个 `Depth × State` variants 覆盖二级/三级 Ready 与显式空子级；84/84 个 variant paint 绑定 Foundation 变量，未绑定、未命名和重复 variant 均为 0，取消/确定目标均为 84×44px。滚轮复用 48px 行、连续选中窗和上下 fade；Ready 示例使用有效的“浙江省 → 杭州市 → 西湖区”路径，`children: []` 的末列真实空白并禁用确定，不伪造占位 option。父级换支、静默归一化、确认式 draft 和表单 adapter 仅记录为运行时契约
- 代码事实源：`packages/tokens`、`packages/mobile`、`packages/form-react`、`packages/icons-*`

## 后续同步流程

1. 先读取 `meu-design` 与组件源码，生成差异清单。
2. 设计 token 只从 `../meu-design/tokens.json` 生成，不在 Figma 中单独改值。
3. Figma 变量、变体和说明更新后，再同步 Storybook 与独立文档站示例。
4. 组件发布为团队 Library 后，补齐或刷新 Code Connect 映射。
5. 每轮完成命名、变量绑定、light/dark、触控尺寸、对比度和截图检查。

当前不发布 npm；这不影响 Figma 维护。首轮已尝试 8 个 Code Connect 映射，但当前 Figma 账号
不具备 Organization / Enterprise 下的 Dev 或 Full seat，因此映射暂时阻塞。Code Connect 依赖
Figma 套餐、席位与 Library 发布状态，不能用 npm 发布替代。

发生冲突时，以 `meu-design` 和代码中的可审查契约为准，并在 Governance 页面记录差异，不做静默覆盖。
Figma 治理待办为：具备相应席位后发布 Library 并重跑 Code Connect；Button 的 pressed 状态待代码契约定稿后补入。后续组件继续按路线图逐批同步。
