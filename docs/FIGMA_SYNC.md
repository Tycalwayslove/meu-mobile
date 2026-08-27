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
