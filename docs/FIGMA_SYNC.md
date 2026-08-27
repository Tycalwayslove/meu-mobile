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
当前待办只剩：具备相应席位后发布 Library 并重跑 Code Connect；Button 的 pressed 状态待代码契约定稿后补入。
