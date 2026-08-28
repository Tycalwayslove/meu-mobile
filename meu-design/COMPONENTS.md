# Meu Mobile：组件目录与契约

## 组件分层

| 层级               | 组件                                                                                                         | 发布优先级 |
| ------------------ | ------------------------------------------------------------------------------------------------------------ | ---------- |
| Foundation         | ConfigProvider、ThemeProvider、Portal、SafeArea、Icon、Space、Divider、VisuallyHidden                        | P0         |
| Actions & feedback | Button、IconButton、Mask、Toast、Dialog、BottomSheet、ActionMenu、Popover、Progress、Skeleton、Empty、Result | P0         |
| Data entry         | Field、Form、TextInput、TextArea、SearchField、Checkbox、RadioGroup、Switch、Stepper、Slider、Rate、Selector | P0         |
| Navigation         | NavBar、Tabs、SegmentedControl、TabBar、IndexList、SideNav                                                   | P0         |
| Information        | Cell、List、Card、Tag、Badge、Avatar、Image、Collapse、Ellipsis、Steps、PaginationDots                       | P0         |
| Collections        | PullToRefresh、InfiniteList、Carousel、SwipeActions、FloatingPanel                                           | P1         |
| Pickers            | Picker、CascadePicker、DatePicker、Calendar、DateRangePicker、TimePicker                                     | P1         |
| Advanced           | ImageViewer、ImageUploader、NumberKeyboard、PasscodeInput、TreeSelect、VirtualList、Watermark                | P2         |

P0 是首发库；P1 需完成手势与性能专项；P2 仅在真实业务验证需求后立项。每个组件都必须支持 `className`、`style`、受控/非受控模式（不适用者除外）、禁用态、深色主题和稳定的测试选择器。

## 通用 API 规则

- 对可交互组件统一使用 `disabled?: boolean`、`loading?: boolean`（有异步态时）、`onClick?: (event) => void`；`loading` 时阻止重复触发。
- 所有 `value` 组件都成对提供 `value` / `defaultValue` / `onChange`。不要把受控状态藏在内部。
- 可见性组件统一为 `open` / `defaultOpen` / `onOpenChange`；废弃 `visible` 等同义属性。
- `tone` 只允许 `neutral | accent | success | warning | danger`；`variant` 表示视觉形式，不混用语义。
- Portal 类型组件提供 `container?: HTMLElement | (() => HTMLElement) | null`，并在 SSR 中安全降级。
- Portal 的 `container={undefined}` 使用 `document.body`，`container={null}` 明确要求原地渲染；组件级
  `container` 优先于 ConfigProvider 的 `portalContainer`。
- 回调传递结构化参数，避免把 DOM 事件作为唯一信息来源；事件若传递，置于最后一个参数。

## P0 核心组件契约

### IconButton / Space / Divider / SafeArea

```ts
type IconButtonProps = {
  "aria-label": string;
  variant?: "solid" | "outline" | "ghost";
  tone?: "accent" | "neutral" | "danger";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
};
type SpaceProps = {
  direction?: "horizontal" | "vertical";
  align?: "start" | "center" | "end" | "baseline" | "stretch";
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  block?: boolean;
  wrap?: boolean;
};
type DividerProps = {
  direction?: "horizontal" | "vertical";
  align?: "start" | "center" | "end";
  children?: ReactNode;
};
type SafeAreaProps = { position?: "top" | "bottom" };
```

IconButton 强制要求可访问名称，触控区域不得小于 44 × 44 px。Space 只使用已有 spacing token，
不接受任意数字。Divider 使用原生 separator 语义。SafeArea 只提供不可交互的
`env(safe-area-inset-*)` 占位，不负责固定定位。

### ConfigProvider / ThemeProvider

```ts
type MeuConfig = {
  locale?: "zh-CN" | "en-US";
  theme?: "light" | "dark" | "system";
  icon?: { size?: number; strokeWidth?: number };
  portalContainer?: HTMLElement | (() => HTMLElement) | null;
};
```

职责：注入 locale、主题 class、portal 容器和全局 token。它不能承载业务请求、路由或全局 Toast 状态；Toast 由独立 provider 管理。主题切换只切换语义变量，不重新编译组件 CSS。

### Button / IconButton

```ts
type ButtonProps = {
  variant?: "solid" | "outline" | "ghost" | "text";
  tone?: "accent" | "neutral" | "danger";
  size?: "small" | "medium" | "large";
  block?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  children: ReactNode;
};
```

默认：`solid`、`accent`、`medium`。渲染原生 `<button>`，有 `type` 透传。加载时保留原有宽度并通过 `aria-busy` 提示；禁止在没有文字的 Button 中放图标，改用 IconButton。IconButton 必须要求 `aria-label`。

### Field / Form / TextInput / TextArea / SearchField

```ts
type FieldProps = {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
};
type TextInputProps = Omit<ComponentProps<"input">, "size"> & {
  size?: "small" | "medium" | "large";
  clearable?: boolean;
  onClear?: () => void;
  status?: "default" | "error";
};
type TextAreaProps = Omit<ComponentProps<"textarea">, "children"> & {
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  showCount?: boolean;
  size?: "small" | "medium" | "large";
  status?: "default" | "error";
};
type SearchFieldProps = Omit<
  ComponentProps<"input">,
  "type" | "size" | "value" | "defaultValue" | "onChange"
> & {
  value?: string;
  defaultValue?: string;
  loading?: boolean;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  clearable?: boolean;
  onClear?: () => void;
  size?: "small" | "medium" | "large";
  status?: "default" | "error";
};
```

`Field` 负责 `label`—control—description/error 的 `id` 关联，`TextInput` 不重复渲染标签。`Form` 只负责布局、提交与字段上下文，不内置验证规则；可通过 adapter 对接 React Hook Form、Formik 或原生状态。错误信息以 `aria-describedby` 关联，首次提交失败时聚焦第一个错误字段。

`TextArea` 使用原生 `<textarea>`，`autoSize` 只调整高度，不接管滚动容器；`showCount` 与原生
`maxLength` 配合，并通过 `aria-describedby` 关联计数。`SearchField` 使用原生
`<input type="search">`，回车触发 `onSearch`，不在组件内部实现防抖、请求或历史记录。清除按钮仅在有值且可编辑时出现，触控区域不得小于 44 × 44 px。

### Checkbox / CheckboxGroup / Radio / RadioGroup / Switch

```ts
type SelectionValue = string | number;
type CheckboxProps = Omit<
  ComponentProps<"input">,
  "type" | "size" | "checked" | "defaultChecked" | "onChange" | "value"
> & {
  value?: SelectionValue;
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  size?: "small" | "medium" | "large";
  status?: "default" | "error";
};
type CheckboxGroupProps<T extends SelectionValue> = {
  value?: T[];
  defaultValue?: T[];
  onChange?: (value: T[]) => void;
  direction?: "horizontal" | "vertical";
  disabled?: boolean;
  name?: string;
  children: ReactNode;
};
type RadioProps = Omit<
  ComponentProps<"input">,
  "type" | "size" | "checked" | "defaultChecked" | "onChange" | "value"
> & {
  value?: SelectionValue;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  size?: "small" | "medium" | "large";
  status?: "default" | "error";
};
type RadioGroupProps<T extends SelectionValue> = {
  value?: T | null;
  defaultValue?: T;
  onChange?: (value: T, event: ChangeEvent<HTMLInputElement>) => void;
  direction?: "horizontal" | "vertical";
  disabled?: boolean;
  name?: string;
  children: ReactNode;
};
type SwitchProps = Omit<
  ComponentProps<"input">,
  "type" | "size" | "checked" | "defaultChecked" | "onChange"
> & {
  checked?: boolean;
  defaultChecked?: boolean;
  loading?: boolean;
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  size?: "small" | "medium" | "large";
  status?: "default" | "error";
};
```

三个原子控件均保留原生 input 语义和至少 44 × 44 px 的可点击区域。Checkbox 的
`indeterminate` 同步原生 DOM 属性并暴露 `aria-checked="mixed"`。RadioGroup 为内部 Radio
提供同一 `name`，保留浏览器方向键行为；受控空值使用 `null`。Switch 使用
`input[type="checkbox"][role="switch"]`，`loading` 时阻止重复切换。需要“选择后再提交”的设置使用
Checkbox，不使用 Switch。

### Stepper / Slider / Rate / Selector

```ts
type DataEntrySize = "small" | "medium" | "large";
type DataEntryStatus = "default" | "error";

type StepperProps = Omit<
  ComponentProps<"input">,
  "type" | "size" | "value" | "defaultValue" | "onChange"
> & {
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  allowEmpty?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  size?: DataEntrySize;
  status?: DataEntryStatus;
  decrementAriaLabel?: string;
  incrementAriaLabel?: string;
};

type SliderMark = { value: number; label?: ReactNode };
type SliderProps = Omit<
  ComponentProps<"input">,
  "type" | "size" | "value" | "defaultValue" | "onChange"
> & {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number, event: ChangeEvent<HTMLInputElement>) => void;
  onChangeComplete?: (
    value: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
  min?: number;
  max?: number;
  step?: number;
  marks?: SliderMark[];
  showValue?: boolean;
  formatValue?: (value: number) => ReactNode;
  disabled?: boolean;
  size?: DataEntrySize;
  status?: DataEntryStatus;
};

type RateProps = Omit<
  ComponentProps<"input">,
  | "type"
  | "size"
  | "min"
  | "max"
  | "step"
  | "value"
  | "defaultValue"
  | "onChange"
> & {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  count?: number;
  allowHalf?: boolean;
  allowClear?: boolean;
  character?: ReactNode;
  getValueLabel?: (value: number, count: number) => string;
  readOnly?: boolean;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  size?: DataEntrySize;
  status?: DataEntryStatus;
};

type SelectorValue = string | number;
type SelectorOption<T extends SelectorValue> = {
  value: T;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};
type SelectorProps<T extends SelectorValue> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> & {
  options: SelectorOption<T>[];
  value?: T[];
  defaultValue?: T[];
  onChange?: (value: T[], options: SelectorOption<T>[]) => void;
  multiple?: boolean;
  allowClear?: boolean;
  columns?: number;
  showCheckMark?: boolean;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  size?: DataEntrySize;
  status?: DataEntryStatus;
  ref?: Ref<HTMLDivElement>;
};
```

`Stepper` 使用带 `role="spinbutton"` 的文本输入保留小数编辑过程，按钮与输入都遵守 `min`、`max`、
`step` 和 `precision`；空值只有在 `allowEmpty` 时合法。`Slider` 首个稳定版本使用原生
`input[type="range"]`，保留浏览器的触摸、方向键、Home / End 与读屏语义；双滑块 range 作为高成本扩展，
不在单值 API 中伪装实现。`Rate` 使用原生 range 选择模型，支持方向键、半星和只读输出，并通过
`aria-valuetext` 暴露可读名称。`Selector` 的公开值始终是数组，单选时最多一个值，多选时按选项顺序返回；内部使用原生
radio / checkbox 语义。四个组件均提供至少 44 × 44 px 的触控目标并接入 Field/Form 错误关联。

### Cell / List

```ts
type CellProps = Omit<
  ComponentProps<"div">,
  "children" | "onClick" | "prefix" | "title"
> & {
  title: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  arrow?: boolean | ReactNode;
  clickable?: boolean;
  disabled?: boolean;
  href?: string;
  target?: HTMLAttributeAnchorTarget;
  rel?: string;
  download?: AnchorHTMLAttributes<HTMLAnchorElement>["download"];
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  onClick?: MouseEventHandler<HTMLElement>;
  ref?: Ref<HTMLElement>;
};
type ListProps = Omit<ComponentProps<"div">, "children" | "title"> & {
  header?: ReactNode;
  footer?: ReactNode;
  mode?: "plain" | "card";
  divider?: "inset" | "full" | "none";
  children?: ReactNode;
};
```

`Cell` 是移动端信息行原语：非空 `href` 存在时使用 `<a>`，`onClick` / `clickable` 为真时使用
`<button type="button">`，静态行使用 `<div>`，绝不使用 `div role="button"`。可交互行默认显示箭头，
可通过 `arrow={false}` 关闭或传入自定义节点。`disabled` 链接移除 `href`、退出 Tab 顺序、设置
`aria-disabled` 并阻止回调；按钮使用原生 `disabled`。整行最小高度和交互目标不得小于 44 px。

`extra` 放短值或状态文本，`suffix` 放尾部展示节点；当整行可交互时，`prefix` / `extra` /
`suffix` 不得再放嵌套按钮或链接。`List` 只处理组标题、组尾注、背景、圆角与分隔线，不能把业务数据
结构固定到组件内部。List body 使用 `role="list"`，内部 Cell 包装层使用 `role="listitem"`，实际
交互节点仍保留原生 button / anchor 语义。`plain` 用于通栏列表，`card` 用于带边框和圆角的分组；
`divider` 仅控制行间分隔线，不改变内容间距。

### Tag / Badge / Avatar / Image / Ellipsis

```ts
type DisplayTone = "neutral" | "accent" | "success" | "warning" | "danger";
type DisplaySize = "small" | "medium" | "large";

type TagProps = Omit<ComponentProps<"span">, "children" | "onClick" | "ref"> & {
  children: ReactNode;
  tone?: DisplayTone;
  variant?: "solid" | "soft" | "outline";
  size?: DisplaySize;
  rounded?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  ref?: Ref<HTMLSpanElement | HTMLButtonElement>;
};

type BadgeProps = Omit<ComponentProps<"span">, "children" | "content"> & {
  children?: ReactNode;
  content?: ReactNode;
  dot?: boolean;
  max?: number;
  showZero?: boolean;
  bordered?: boolean;
  tone?: DisplayTone;
  label?: string;
  offset?: readonly [x: number, y: number];
};

type ImageProps = Omit<
  ComponentProps<"div">,
  "children" | "onError" | "onLoad"
> & {
  src?: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  fit?: CSSProperties["objectFit"];
  radius?: "none" | "control" | "surface" | "round";
  placeholder?: ReactNode;
  fallback?: ReactNode;
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  decoding?: ImgHTMLAttributes<HTMLImageElement>["decoding"];
  crossOrigin?: ImgHTMLAttributes<HTMLImageElement>["crossOrigin"];
  referrerPolicy?: ImgHTMLAttributes<HTMLImageElement>["referrerPolicy"];
  sizes?: string;
  srcSet?: string;
  draggable?: boolean;
  imageRef?: Ref<HTMLImageElement>;
  onLoad?: ReactEventHandler<HTMLImageElement>;
  onError?: ReactEventHandler<HTMLImageElement>;
};

type AvatarProps = Omit<
  ComponentProps<"span">,
  "children" | "onError" | "onLoad"
> & {
  src?: string;
  alt: string;
  fallback?: ReactNode;
  size?: DisplaySize | number;
  shape?: "circle" | "rounded" | "square";
  fit?: CSSProperties["objectFit"];
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  imageRef?: Ref<HTMLImageElement>;
  onLoad?: ReactEventHandler<HTMLImageElement>;
  onError?: ReactEventHandler<HTMLImageElement>;
};

type EllipsisProps = Omit<ComponentProps<"div">, "children"> & {
  content: string;
  rows?: number;
  direction?: "start" | "end" | "middle";
  expandText?: ReactNode;
  collapseText?: ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (
    expanded: boolean,
    event: MouseEvent<HTMLButtonElement>,
  ) => void;
  onEllipsisChange?: (ellipsed: boolean) => void;
};
```

`Tag` 默认为静态 `<span>`；传入 `onClick` 时改用 `<button type="button">`，从而保留键盘、焦点与
禁用语义。它只表达短标签，不承载移除按钮或业务筛选状态。`Badge` 可以独立显示，也可以包裹目标并把
标记定位到右上角；数字内容遵守 `max` 和 `showZero`，点状 Badge 默认对读屏隐藏，只有提供 `label`
时才暴露含义。

`Image` 负责 loading / loaded / error 三态、占位与失败回退，使用原生 `<img loading>`，不自行实现
IntersectionObserver。`alt` 必填，装饰图片显式传空字符串。`Avatar` 在 Image 之上提供尺寸、形状和
姓名首字符回退，不重复实现加载状态；在线状态或数量使用 Badge 组合。

`Ellipsis` 支持头部、尾部和中部截断，并根据容器宽度重新测量；`expanded` / `defaultExpanded` /
`onExpandedChange` 遵守受控组件契约。展开与收起操作使用原生按钮，折叠视觉文本不能成为读屏器获取
完整内容的障碍。服务端首屏必须保持稳定，测量只在客户端执行。

### Card / Collapse

```ts
type CardProps = Omit<
  ComponentProps<"div">,
  "children" | "onClick" | "title"
> & {
  children?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  extra?: ReactNode;
  media?: ReactNode;
  footer?: ReactNode;
  variant?: "outlined" | "filled" | "elevated";
  padding?: "none" | "small" | "medium" | "large";
};

type CollapseItem = {
  value: string;
  title: ReactNode;
  content: ReactNode;
  extra?: ReactNode;
  disabled?: boolean;
};
type CollapseProps = Omit<
  ComponentProps<"div">,
  "children" | "defaultValue" | "onChange"
> & {
  items: readonly CollapseItem[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onChange?: (value: string[], event: MouseEvent<HTMLButtonElement>) => void;
  accordion?: boolean;
  variant?: "plain" | "card";
  arrow?: ReactNode | ((expanded: boolean) => ReactNode);
};
```

`Card` 是无状态内容容器，按 media、header、body、footer 的固定槽位组织内容；`title` 不隐式生成
标题层级，页面应在传入节点中选择合适的 `h2` / `h3`。整卡不提供点击 API，避免用 `div`
伪造按钮以及卡内交互元素嵌套冲突；导航和操作使用明确的原生链接或 Button。`outlined` 用于默认
分组，`filled` 用于弱层级内容，`elevated` 只用于确实需要悬浮层级的场景。

`Collapse` 使用稳定且唯一的 item `value` 管理展开项，`value` / `defaultValue` / `onChange`
遵守受控组件契约；`accordion` 只允许一个值。标题触发器必须是原生 `<button type="button">`，
通过 `aria-expanded` / `aria-controls` 关联 `role="region"` 内容，禁用项使用原生 `disabled`。
收起内容保留挂载状态以保存内部表单状态，通过可见性和 `aria-hidden` 退出交互与读屏；动效遵守
`prefers-reduced-motion`。`extra` 和自定义 `arrow` 仅作展示，不允许放嵌套按钮或链接。

### NavBar / SegmentedControl / PaginationDots / Tabs / TabBar / IndexList / SideNav

```ts
type NavBarProps = Omit<ComponentProps<"header">, "children" | "title"> & {
  title?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  backHref?: string;
  backIcon?: ReactNode;
  backLabel?: ReactNode;
  backAriaLabel?: string;
  onBack?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  bordered?: boolean;
  ref?: Ref<HTMLElement>;
};

type SegmentedControlValue = string | number;
type SegmentedControlOption<T extends SegmentedControlValue> = {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};
type SegmentedControlProps<T extends SegmentedControlValue> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> & {
  options: readonly SegmentedControlOption<T>[];
  value?: T | null;
  defaultValue?: T;
  onChange?: (value: T, event: ChangeEvent<HTMLInputElement>) => void;
  size?: "small" | "medium" | "large";
  block?: boolean;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  status?: "default" | "error";
  ref?: Ref<HTMLDivElement>;
};

type PaginationDotsProps = Omit<ComponentProps<"div">, "children"> & {
  count: number;
  activeIndex: number;
  direction?: "horizontal" | "vertical";
  variant?: "dot" | "line";
  ref?: Ref<HTMLDivElement>;
};

type TabsItem = {
  key: string;
  label: ReactNode;
  content?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
};
type TabsProps = Omit<
  ComponentProps<"div">,
  "children" | "defaultValue" | "onChange"
> & {
  items: readonly TabsItem[];
  value?: string | null;
  defaultValue?: string;
  onChange?: (
    key: string,
    event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>,
  ) => void;
  activationMode?: "automatic" | "manual";
  stretch?: boolean;
  destroyInactive?: boolean;
  ref?: Ref<HTMLDivElement>;
};

type TabBarItem = {
  key: string;
  label: ReactNode;
  icon: ReactNode | ((active: boolean) => ReactNode);
  badge?: ReactNode;
  href?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
};
type TabBarProps = Omit<ComponentProps<"nav">, "children" | "onChange"> & {
  items: readonly TabBarItem[];
  value?: string | null;
  defaultValue?: string;
  onChange?: (
    key: string,
    event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => void;
  safeArea?: boolean;
  ref?: Ref<HTMLElement>;
};

type StepStatus = "wait" | "process" | "finish" | "error";
type StepItem = {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  status?: StepStatus;
};
type StepsProps = Omit<ComponentProps<"ol">, "children"> & {
  items: readonly StepItem[];
  current?: number;
  direction?: "horizontal" | "vertical";
  ref?: Ref<HTMLOListElement>;
};

type IndexListSection = {
  key: string;
  title?: ReactNode;
  brief?: ReactNode;
  content: ReactNode;
};
type IndexListProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "onChange"
> & {
  sections: readonly IndexListSection[];
  sticky?: boolean;
  indexAriaLabel?: string;
  onIndexChange?: (
    key: string,
    details: { source: "index" | "scroll"; event?: MouseEvent | KeyboardEvent },
  ) => void;
  ref?: Ref<{
    scrollTo: (
      key: string,
      options?: { behavior?: ScrollBehavior; focusIndex?: boolean },
    ) => boolean;
  }>;
};

type SideNavItem = {
  key: string;
  label: ReactNode;
  badge?: ReactNode;
  content?: ReactNode;
  disabled?: boolean;
};
type SideNavProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onChange"
> & {
  items: readonly SideNavItem[];
  value?: string | null;
  defaultValue?: string;
  onChange?: (
    key: string,
    event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>,
  ) => void;
  activationMode?: "automatic" | "manual";
  destroyInactive?: boolean;
  ref?: Ref<HTMLDivElement>;
};
```

`NavBar` 是普通文档流中的 `<header>`，不内置 fixed / sticky 定位。仅在提供 `backHref` 或
`onBack` 时渲染返回触发器；前者使用原生 `<a>`，后者使用原生 `<button type="button">`，默认返回图标
和本地化可访问名称由组件提供。标题保持视觉居中，左右槽位允许页面注入明确的导航或操作节点，所有交互
目标不得小于 44 × 44 px。

`SegmentedControl` 使用同名原生 radio input，保留键盘方向键、Tab 与表单语义；选项可附带图标，但文字
标签不可省略。非受控模式没有合法 `defaultValue` 时选中第一个可用选项，受控 `null` 表示无选中项。
`block` 只控制是否占满容器宽度，不改变值模型。组件接入 Field 的 label、description、error 关联，并由
`@meu/form-react` 提供 `MeuFormSegmentedControl` 适配器。

`PaginationDots` 是轮播图、引导页等场景的只读位置指示器，不提供点击事件或内部翻页逻辑。`count` 归一化为
非负整数，`activeIndex` 夹在有效范围内；根节点通过本地化 `aria-label` 报告“当前页 / 总页数”，视觉点对
读屏隐藏。需要直接跳页时应组合 Tabs、按钮或业务分页器。

`Tabs` 同时管理 tablist 与 tabpanel，遵循 WAI-ARIA tabs 模式：按钮通过 `aria-controls` 关联面板，
激活项使用 `aria-selected`，方向键跳过禁用项并循环，Home / End 跳到首尾可用项。默认
`activationMode="automatic"`，只有面板切换有明显延迟时才使用 manual 模式并通过 Enter / Space 激活。
面板默认保持挂载以保留内部状态；`destroyInactive` 是明确的性能取舍。标签栏可横向滚动，但组件不内置
sticky 定位。

`TabBar` 用于 2–5 个一级页面入口，外层使用 `<nav>`，每项必须同时提供图标和文字；有 `href` 时渲染
原生 `<a>`，否则渲染 `<button type="button">`，当前项设置 `aria-current="page"`。组件只维护选中值并
提供路由适配点，不调用任何路由库，也不内置 fixed 定位；`safeArea` 仅追加底部安全区占位。

`Steps` 是只读有序列表，不提供点击跳步 API。未显式指定 item `status` 时，`current` 之前为 finish、
当前为 process、之后为 wait；error 由单项覆盖。状态不能只依赖颜色，读屏器会获取本地化状态文本，
当前步骤使用 `aria-current="step"`。Tabs、TabBar 与 Steps 都不是数据录入控件，不提供表单 adapter。

`IndexList` 只管理自身有界滚动视口，不监听或接管页面滚动。sections key 是稳定且唯一的分组身份；
主内容区使用有名称的 section，右侧索引使用 44 × 44 px 原生按钮、roving tab stop、上下方向键和
Home / End。`onIndexChange` 区分用户索引操作与内容滚动，imperative `scrollTo` 明确报告目标是否存在；
sticky 仅影响组件内部标题。调用方必须为组件提供明确高度。

`SideNav` 用于同层级垂直分类切换。items 带 content 时渲染 WAI-ARIA vertical tabs，并默认保留非活动
面板状态；不带 content 时渲染 navigation 与原生按钮，由调用方持有内容区域，当前项使用
`aria-current="page"`。上下方向键、Home / End 跳过禁用项，延迟内容可选 manual activation。
两者均不调用路由、不内置 fixed/sticky 页面定位、不进入表单 adapter；uni-app 复用值和事件契约，
重新实现平台滚动、焦点与无障碍桥接。

### Mask / Popup

```ts
type OverlayDismissReason = "mask" | "escape" | "close-button";
type OverlayOpenChangeDetails = { reason: OverlayDismissReason };

type MaskProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: OverlayOpenChangeDetails) => void;
  dismissible?: boolean;
  opacity?: "thin" | "default" | "thick" | number;
  lockScroll?: boolean;
  container?: HTMLElement | (() => HTMLElement) | null;
  forceMount?: boolean;
  children?: ReactNode;
};

type PopupProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: OverlayOpenChangeDetails) => void;
  position?: "top" | "right" | "bottom" | "left";
  mask?: boolean;
  closeOnMaskClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  closeLabel?: string;
  lockScroll?: boolean;
  restoreFocus?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  returnFocusRef?: RefObject<HTMLElement | null>;
  container?: HTMLElement | (() => HTMLElement) | null;
  forceMount?: boolean;
  safeArea?: boolean;
  children: ReactNode;
} & ({ "aria-label": string } | { "aria-labelledby": string });
```

两者均使用 `open / defaultOpen / onOpenChange`，受控模式下组件只发出关闭意图，不篡改外部状态。
`Mask` 默认打开、不可关闭、锁定页面滚动，并对读屏隐藏；`dismissible` 只增加指针点击关闭能力，不能作为
模态内容唯一的关闭路径。`thin / default / thick` 分别为 `0.24 / 0.48 / 0.72`，透明度数字会夹在
0–1。

`Popup` 默认关闭、从底部进入，并启用 mask、滚动锁、焦点圈定、Escape 和焦点恢复。根节点使用
`role="dialog"` 与 `aria-modal="true"`，因此必须提供 `aria-label` 或 `aria-labelledby`。遮罩点击默认不关闭，
避免移动端误触；开启后通过 `reason: "mask"` 报告。关闭按钮至少 44 × 44 px，并使用本地化名称。多个浮层
嵌套时，只有最上层响应 Escape 与 Tab 圈定，滚动锁使用引用计数。`forceMount` 只保留 DOM，不允许关闭态
进入可访问树或 Tab 顺序。触摸浏览器不保证点击后聚焦触发器，调用方可用 `returnFocusRef` 显式指定恢复目标。
进入/退出只使用 transform 与 opacity，reduced-motion 下取消位移动画。

### Popover

```ts
type PopoverPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "right"
  | "right-start"
  | "right-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end";
type PopoverOpenChangeDetails = {
  reason: "trigger" | "escape" | "outside" | "focus-out";
};
type PopoverProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: PopoverOpenChangeDetails) => void;
  children: ReactElement;
  content: ReactNode;
  trigger?: "click" | "manual";
  placement?: PopoverPlacement;
  offset?: number;
  viewportPadding?: number;
  arrow?: boolean;
  autoFocus?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnFocusOut?: boolean;
  restoreFocus?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  container?: HTMLElement | (() => HTMLElement) | null;
  forceMount?: boolean;
} & ({ "aria-label": string } | { "aria-labelledby": string });
```

`Popover` 是由单个可聚焦触发器锚定的非模态交互浮层，不替代只读说明使用的 Tooltip，也不内置菜单项、
选择或危险操作语义。默认点击触发、顶部居中、显示箭头，并在视口边缘自动 flip / shift；实际定位结果通过
`data-placement` 暴露，调用方不应假设首选位置一定可用。`offset` 与 `viewportPadding` 会归一化为非负有限值。

触发器获得 `aria-haspopup="dialog"`、`aria-expanded` 与 `aria-controls`，内容使用非模态 `role="dialog"`，
因此必须通过 `aria-label` 或 `aria-labelledby` 提供名称。默认进入时把焦点放到浮层容器或调用方指定的
`initialFocusRef`；Tab 顺序在 Portal 前后保持，焦点移出、外部指针、Escape 或再次点击触发器都会分别报告
`outside / escape / trigger`；调用方显式启用 `closeOnFocusOut` 后才报告 `focus-out`，避免 iOS WebKit 在
Portal 初始聚焦时误判。关闭后默认恢复触发焦点，但外部指针已经移动焦点时不得抢回。
`trigger="manual"` 只保留定位和 ARIA 关联，由调用方控制开关。

Popover 不使用 Mask、不锁滚动、不设置 `aria-modal`；放在 Dialog / Popup 内时，其 Portal 节点作为该模态
浮层的合法焦点分支，关闭后继续回到原模态焦点范围。进入/退出只使用 transform 与 opacity，
reduced-motion 下取消缩放动画。基础实现采用 Floating UI 的定位与交互原语，Meu 只维护公开契约、视觉 token
和兼容边界。Figma 只表达 Placement / Arrow / Content Density 等设计维度，不把运行时碰撞结果或 open/closed
生命周期伪装成业务 variant。

### BottomSheet / Dialog / ActionMenu

```ts
type BottomSheetSnapPoint = number | "content";
type BottomSheetOpenChangeDetails = {
  reason: "escape" | "mask" | "close-button" | "drag";
};
type BottomSheetSnapChangeDetails = {
  reason: "drag" | "handle";
  index: number;
};
type BottomSheetProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: BottomSheetOpenChangeDetails) => void;
  title?: ReactNode;
  snapPoints?: ReadonlyArray<BottomSheetSnapPoint>;
  snapPoint?: BottomSheetSnapPoint;
  defaultSnapPoint?: BottomSheetSnapPoint;
  onSnapPointChange?: (
    snapPoint: BottomSheetSnapPoint,
    details: BottomSheetSnapChangeDetails,
  ) => void;
  closeOnMaskClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  closeLabel?: string;
  dragHandle?: boolean;
  dragHandleLabel?: string;
  dragToDismiss?: boolean;
  lockScroll?: boolean;
  restoreFocus?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  returnFocusRef?: RefObject<HTMLElement | null>;
  container?: HTMLElement | (() => HTMLElement) | null;
  forceMount?: boolean;
  safeArea?: boolean;
  maskOpacity?: "thin" | "default" | "thick" | number;
  children: ReactNode;
} & (
  | { title: ReactNode }
  | { "aria-label": string }
  | { "aria-labelledby": string }
);

type DialogAction = {
  key: string;
  label: ReactNode;
  tone?: "neutral" | "accent" | "danger";
  disabled?: boolean;
  autoFocus?: boolean;
  closeOnPress?: boolean;
  onPress?: () => void | boolean | Promise<void | boolean>;
};
type DialogOpenChangeDetails =
  | { reason: "escape" }
  | { reason: "mask" }
  | { reason: "action"; actionKey: string };
type DialogSemantics =
  | { role?: "alertdialog"; description: ReactNode }
  | { role: "dialog"; description?: ReactNode };
type DialogProps = DialogSemantics & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: DialogOpenChangeDetails) => void;
  title: ReactNode;
  children?: ReactNode;
  actions: ReadonlyArray<DialogAction>;
  actionLayout?: "auto" | "horizontal" | "vertical";
  closeOnMaskClick?: boolean;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
  restoreFocus?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
  container?: HTMLElement | (() => HTMLElement) | null;
  forceMount?: boolean;
  maskOpacity?: "thin" | "default" | "thick" | number;
  onActionError?: (error: unknown, action: DialogAction) => void;
};

type ActionMenuConfirmation = {
  title?: ReactNode;
  description?: ReactNode;
  confirmText?: ReactNode;
  cancelText?: ReactNode;
};
type ActionMenuAction = {
  key: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  tone?: "neutral" | "danger";
  disabled?: boolean;
  closeOnPress?: boolean;
  confirmation?: ActionMenuConfirmation;
  onPress?: () => void | boolean | Promise<void | boolean>;
};
type ActionMenuOpenChangeDetails =
  | { reason: "escape" | "mask" | "cancel" }
  | { reason: "action"; actionKey: string };
type ActionMenuProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: ActionMenuOpenChangeDetails) => void;
  title?: ReactNode;
  description?: ReactNode;
  actions: ReadonlyArray<ActionMenuAction>;
  cancelText?: ReactNode | null;
  closeOnAction?: boolean;
  closeOnMaskClick?: boolean;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
  restoreFocus?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  returnFocusRef?: RefObject<HTMLElement | null>;
  container?: HTMLElement | (() => HTMLElement) | null;
  forceMount?: boolean;
  safeArea?: boolean;
  maskOpacity?: "thin" | "default" | "thick" | number;
  onAction?: (
    action: ActionMenuAction,
    index: number,
  ) => void | boolean | Promise<void | boolean>;
  onActionError?: (error: unknown, action: ActionMenuAction) => void;
} & (
  | { title: ReactNode }
  | { "aria-label": string }
  | { "aria-labelledby": string }
);
```

底部面板用于选择、补充输入和少量连续操作；`Dialog` 仅用于需要明确响应的告知、确认或不可逆操作，
不承载长表单和连续流程。两者复用 Mask / Portal、引用计数滚动锁、顶层焦点圈定与焦点恢复；遮罩点击默认
不关闭，Escape 默认关闭，任务关键场景可关闭 Escape。

`BottomSheet` 是底部进入的模态 `role="dialog"`。有可见 `title` 时自动生成 `aria-labelledby`，否则必须提供
`aria-label` 或 `aria-labelledby`。snap point 数字表示可视视口高度比例，必须是 `(0, 1]`；`"content"`
表示内容固有高度，并统一受 90% 视口上限约束。输入会按实际高度升序去重，默认打开到最高点；受控
`snapPoint` 不存在于归一化结果时回退到最近高度并通过 DOM 状态暴露实际值，不静默修改外部状态。
拖拽只从手柄开始，避免与面板内容滚动冲突；释放后按距离与速度吸附到相邻点，低于最小点且
`dragToDismiss=true` 时报告 `reason: "drag"`。手柄使用原生 `button`，点击在相邻高度间循环，方向键上下、
Home / End 均提供等价键盘路径。`dragHandle=false` 时不得开启拖拽。面板默认启用安全区、滚动锁、焦点捕获
和恢复；关闭态的 `forceMount` 节点不进入可访问树或 Tab 顺序。

`Dialog` 默认语义为 `alertdialog`，由可见标题生成
`aria-labelledby`，并要求 `description` 生成 `aria-describedby`；承载普通交互内容时必须显式选择 `dialog`。

操作按钮始终使用原生 `button` 与 Meu Button 视觉，最小 44 px；`auto` 布局在一至两个操作时横排、三个及
以上时纵排。异步 `onPress` 期间只给当前操作显示 loading，并暂时禁止其他操作、遮罩和 Escape；返回
`false` 或 reject 时保持打开，reject 交给 `onActionError`，未提供处理器时保留 rejected promise 以暴露错误。
成功后仅在 `closeOnPress !== false` 时发出 `reason: "action"` 的关闭意图。受控模式不自行篡改外部状态。
危险操作必须使用 `tone: "danger"`，取消操作使用 neutral，不依据按钮顺序猜测业务语义。

Dialog 的命令式 `alert / confirm` 由独立 `DialogProvider` 与 `useDialog` 提供，保留当前 React tree 的 locale、
theme 和 Portal 上下文；不通过模块级 `createRoot` 绕开 Provider。Promise 结果只表达用户选择，不吞并业务请求
错误，复杂状态仍使用声明式 Dialog。BottomSheet 与 Dialog 都锁定背景滚动、捕获焦点并恢复触发焦点。
`ActionMenu` 是由明确用户意图触发的底部模态动作面板，复用 Popup 的 Portal、Mask、滚动锁、焦点圈定、
安全区与进出场，不使用 BottomSheet 的拖拽与 snap。容器使用 `role="dialog"`，操作项使用原生 `button`；
它不是桌面式 `menu/menuitem` 复合控件，也不承载选择态、勾选或子菜单。可见 `title` 自动成为可访问名称，
无标题时必须提供 `aria-label` 或 `aria-labelledby`。标题和说明保持简短；建议包括取消项在内不超过四个
操作，长流程与大量选项分别使用 BottomSheet 或 Picker。

普通项保持原始顺序；`tone: "danger"` 的危险项无论传入位置如何都移入独立分组。危险项始终经过
Dialog 二次确认，`confirmation` 只覆盖确认文案；未提供时使用本地化安全默认值，调用方不能绕过确认。
普通项也可显式提供 `confirmation`。取消项默认显示本地化文案并独立成组，传入 `null` 才隐藏；遮罩与
Escape 默认关闭，异步操作期间阻止其他操作与所有关闭入口。

执行顺序固定为 `action.onPress` 后 `onAction`；任一步返回 `false` 或 reject 都保持打开，reject 交给
`onActionError`。成功后按照 item `closeOnPress`、再按照组件 `closeOnAction` 的默认值决定是否发出
`reason: "action"`；受控模式只发出意图，不修改外部状态。关闭原因明确区分
`mask / escape / cancel / action`。命令式 `show / clear` 由 `ActionMenuProvider` 与 `useActionMenu` 提供，
保留当前 React tree 的 locale、theme 和 Portal 上下文，不使用模块级 `createRoot`。

### Toast / Progress / Skeleton / Empty / Result

```ts
type ToastTone = "neutral" | "success" | "warning" | "danger";
type ToastPosition = "top" | "center" | "bottom";
type ToastAction = {
  label: ReactNode;
  closeOnPress?: boolean;
  onPress?: () => void | boolean | Promise<void | boolean>;
};
type ToastOpenChangeDetails = { reason: "timeout" } | { reason: "action" };
type ToastCloseDetails =
  ToastOpenChangeDetails | { reason: "programmatic" | "clear" };
type ToastProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: ToastOpenChangeDetails) => void;
  message: ReactNode;
  tone?: ToastTone;
  position?: ToastPosition;
  duration?: number;
  icon?: ReactNode | null;
  action?: ToastAction;
  container?: HTMLElement | (() => HTMLElement) | null;
  forceMount?: boolean;
  onActionError?: (error: unknown) => void;
};
type ToastShowOptions = Omit<
  ToastProps,
  "defaultOpen" | "onOpenChange" | "open"
> & {
  id?: string;
  onClose?: (details: ToastCloseDetails) => void;
};
type ToastController = {
  id: string;
  close: () => void;
  update: (options: Partial<Omit<ToastShowOptions, "id">>) => void;
};
type ToastApi = {
  show: (options: ToastShowOptions) => ToastController;
  success: (options: Omit<ToastShowOptions, "tone">) => ToastController;
  warning: (options: Omit<ToastShowOptions, "tone">) => ToastController;
  danger: (options: Omit<ToastShowOptions, "tone">) => ToastController;
  clear: () => void;
};
type ProgressProps = {
  value?: number;
  indeterminate?: boolean;
  label?: ReactNode;
  showValue?: boolean;
  formatValue?: (value: number) => ReactNode;
  size?: "small" | "medium" | "large";
  tone?: "accent" | "success" | "warning" | "danger";
};
type SkeletonProps = {
  variant?: "text" | "rectangle" | "circle";
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  lines?: number;
  lineWidths?: ReadonlyArray<CSSProperties["width"]>;
  animated?: boolean;
};
type EmptyProps = {
  title: ReactNode;
  description: ReactNode;
  action: ReactNode;
  illustration?: ReactNode;
};
type ResultProps = {
  status?: "success" | "error" | "info" | "warning" | "waiting";
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
};
```

Toast 默认 3 秒、`duration=0` 表示持续展示；带 action 时有效时长自动提升到至少 5 秒。悬停、焦点停留和
异步 action 执行期间暂停计时，组件挂载和更新时都不主动移动焦点。neutral / success 使用 polite `status`
播报，warning / danger 使用 assertive `alert`；可操作按钮放在 live region 外，避免按钮文字被当成状态消息重复播报。

`ToastProvider` 与 `useToast` 提供命令式 `show / success / warning / danger / clear`。Provider 使用 FIFO 队列，
同一时间只展示一条以避免移动视口堆叠和连续播报相互覆盖；传入相同 `id` 时更新队内已有消息而不是重复入队。
controller 可更新或关闭自己的消息。action 返回 `false` 或 reject 时保持展示，reject 交给 `onActionError`；
成功后仅在 `closeOnPress !== false` 时关闭。Provider 保留当前 locale、theme 与 Portal 上下文，不使用模块级
`createRoot`。Toast 不使用 Mask、不锁滚动、不捕获焦点，也不替代需要明确响应的 Dialog。

`Progress` 是 0–100 的只读线性进度条：determinate 时夹紧并设置 `aria-valuenow`，indeterminate 时省略
`aria-valuenow`；有可见标签时同时作为可访问名称，否则使用调用方的 `aria-label` 或本地化默认名称。
`formatValue` 只负责格式化可见数值，不修改 ARIA 数值。进度变化使用 transform，reduced-motion 下取消循环动画。

`Skeleton` 只描述视觉布局，始终对读屏隐藏；加载区域由调用方设置 `aria-busy`。`text` 可生成多行并接受逐行宽度，
`rectangle` 与 `circle` 用于匹配媒体和头像尺寸。默认不启用 shimmer；启用时必须在 reduced-motion 下退化为静态占位。

`Empty` 强制包含具体原因 `description` 与可执行的下一步 `action`，插画仅为可选装饰，不能替代说明。
`Result` 表达一次流程的 success / error / info / warning / waiting 结果，提供标题、说明和后续操作插槽；不内置路由、
请求重试或自动跳转。四个组件均不属于数据录入，不提供表单 adapter。

### Picker / CascadePicker / DatePicker / TimePicker / Calendar / DateRangePicker

```ts
type PickerValue = string | number;
type PickerOption<TValue extends PickerValue = PickerValue> = {
  label: ReactNode;
  value: TValue;
  disabled?: boolean;
  textValue?: string;
};
type PickerOpenChangeDetails = {
  reason: "confirm" | "cancel" | "mask" | "escape" | "trigger";
};
type PickerSelectDetails = {
  columnIndex: number;
  reason: "keyboard" | "pointer" | "scroll";
};
type PickerProps<TValue extends PickerValue = PickerValue> = {
  columns: ReadonlyArray<ReadonlyArray<PickerOption<TValue>>>;
  value?: ReadonlyArray<TValue | null>;
  defaultValue?: ReadonlyArray<TValue | null>;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: PickerOpenChangeDetails) => void;
  onSelect?: (
    value: ReadonlyArray<TValue | null>,
    options: ReadonlyArray<PickerOption<TValue> | null>,
    details: PickerSelectDetails,
  ) => void;
  onConfirm?: (
    value: ReadonlyArray<TValue | null>,
    options: ReadonlyArray<PickerOption<TValue> | null>,
  ) => void;
  onCancel?: (details: { reason: "cancel" | "mask" | "escape" }) => void;
  title?: ReactNode;
  columnLabels?: ReadonlyArray<string>;
  cancelText?: ReactNode;
  confirmText?: ReactNode;
  renderOption?: (
    option: PickerOption<TValue>,
    details: { columnIndex: number; selected: boolean },
  ) => ReactNode;
  closeOnMaskClick?: boolean;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
  restoreFocus?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
  container?: HTMLElement | (() => HTMLElement) | null;
  forceMount?: boolean;
  safeArea?: boolean;
  maskOpacity?: "thin" | "default" | "thick" | number;
} & (
  | { title: ReactNode }
  | { "aria-label": string }
  | { "aria-labelledby": string }
);

type PickerTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  open?: boolean;
  placeholder?: ReactNode;
  status?: "default" | "error";
  value?: ReactNode;
};

type CascadePickerOption<TValue extends PickerValue = PickerValue> =
  PickerOption<TValue> & {
    children?: ReadonlyArray<CascadePickerOption<TValue>>;
  };
type CascadePickerProps<TValue extends PickerValue = PickerValue> = Omit<
  PickerProps<TValue>,
  "columns" | "onConfirm" | "onSelect" | "renderOption"
> & {
  options: ReadonlyArray<CascadePickerOption<TValue>>;
  onSelect?: (
    value: ReadonlyArray<TValue | null>,
    options: ReadonlyArray<CascadePickerOption<TValue> | null>,
    details: PickerSelectDetails,
  ) => void;
  onConfirm?: (
    value: ReadonlyArray<TValue | null>,
    options: ReadonlyArray<CascadePickerOption<TValue> | null>,
  ) => void;
  renderOption?: (
    option: CascadePickerOption<TValue>,
    details: { columnIndex: number; selected: boolean },
  ) => ReactNode;
};
```

`Picker` 是由 Popup 承载的底部模态滚轮选择器；一至五列使用并列的单选 `listbox`，每个 option 仅包含
纯文本式名称，不承载按钮、链接或嵌套控件。DOM 焦点保持在列容器，通过 `aria-activedescendant` 指向当前
选项；方向键上下、Home / End、字符查找与点按提供离散等价路径，触摸与触控板沿用原生纵向滚动和 snap。
不可用项仍可见但不能成为当前值；键盘和滚动停止时都会跳过它们。复合 `label` 必须提供 `textValue`，
保证字符查找和读屏名称稳定；多列通过 `columnLabels` 提供独立名称。

打开时从已提交值生成一份 draft：缺失、越界或 disabled 值回退到该列第一个可用项，空列使用 `null`。
`onSelect` 只报告 draft，不修改已提交值；确认时才由非受控组件提交并调用 `onConfirm`，受控组件只发出
意图。取消、遮罩和 Escape 丢弃 draft，关闭原因必须区分；再次打开重新从外部或已提交值初始化。确认按钮
在任一列没有可用值时不可用。运行时 columns 变化会重新归一化 draft，但不伪造用户选择事件。

滚轮固定显示五行、每行 48 px，中央选中窗清晰可见；滚动仅更新 `scrollTop`，reduced-motion 下不使用平滑
动画。Picker 默认启用遮罩关闭、Escape、滚动锁、焦点圈定/恢复和 safe area；关闭态 forceMount 不进入
可访问树。建议单列至少五个、每列不超过约一百个可预测且有序的选项；更短集合使用 RadioGroup / Selector，
超长或需要搜索的集合使用列表或搜索选择器。

`PickerTrigger` 是可独立组合的原生 button 触发器，读取 Field 上下文并暴露 `aria-haspopup="dialog"`、
`aria-expanded`、错误与说明关联。`MeuFormPicker` 组合 Field、PickerTrigger 和 Picker，字段值仅在确认时写入，
取消不触发 dirty；错误聚焦到触发器。

`CascadePicker` 是 Picker 的树形数据适配层，不复制 Popup、滚轮、键盘或焦点实现。`options` 中同级
`value` 必须唯一，确认值是从根到当前叶子的完整路径。父级变化时保留变化列以前的路径，丢弃旧后缀，
并从新分支逐级选择首个非 disabled 项；动态更新 options 时只做静默归一化，不伪造 `onSelect`。
`children: undefined` 表示路径在当前项结束；显式 `children: []` 表示存在但暂无数据的下一级，继续显示
空列并禁用确认，适合由调用方更新 options 的异步加载流程。树为空、某一级全 disabled 或显式空子级时，
该列值为 `null`。视觉上仍建议最多五级。`MeuFormCascadePicker` 与 Picker adapter 保持相同的确认提交、
取消不 dirty、错误聚焦和受控 open 契约。

```ts
type DatePrecision = "year" | "month" | "day" | "hour" | "minute" | "second";
type DateParts = {
  year: number;
  month: number; // 1–12
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
};
interface DateAdapter<TDate> {
  now(): TDate;
  fromParts(parts: DateParts): TDate | null;
  getParts(value: TDate): DateParts;
  getDaysInMonth(parts: Pick<DateParts, "year" | "month">): number;
  getDayOfWeek(value: TDate): number;
  isValid(value: TDate): boolean;
  compare(left: TDate, right: TDate): number;
  add(value: TDate, amount: number, unit: DateUnit): TDate;
  startOf(value: TDate, unit: DateUnit): TDate;
  parse(value: string, pattern: string, locale?: string): TDate | null;
  format(value: TDate, pattern: string, locale?: string): string;
}
type DatePickerProps<TDate = Date> = Omit<
  PickerProps<number>,
  | "columns"
  | "columnLabels"
  | "defaultValue"
  | "onConfirm"
  | "onSelect"
  | "value"
> & {
  adapter?: DateAdapter<TDate>;
  value?: TDate | null;
  defaultValue?: TDate | null;
  min?: TDate;
  max?: TDate;
  precision?: DatePrecision;
  minuteStep?: number;
  secondStep?: number;
  filter?: Partial<
    Record<
      DatePrecision,
      (
        value: number,
        details: { date: TDate | null; parts: DateParts },
      ) => boolean
    >
  >;
  renderLabel?: (
    precision: DatePrecision,
    value: number,
    details: unknown,
  ) => ReactNode;
  onSelect?: (
    value: TDate,
    details: PickerSelectDetails & { precision: DatePrecision },
  ) => void;
  onConfirm?: (value: TDate) => void;
};
```

`DatePicker` 通过 `DateAdapter<TDate>` 生成从年到当前 precision 的连续滚轮，默认到日；核心包不依赖
Day.js、date-fns 或特定业务时区。内置 `nativeDateAdapter` 使用宿主本地民用时间，自定义日期类型或时区
必须显式传入匹配的 adapter。未传 `min / max` 时使用首次渲染时刻前后十个自然年；边界按当前精度的
年月日时分秒前缀比较。低于 precision 的字段归一化到单位起点，毫秒始终清零；年或月变化会把 29–31 日
夹紧到目标月份末日。`minuteStep / secondStep` 夹紧到 1–59，不要求整除 60。

`filter` 只禁用对应精度的 option，`renderLabel` 只改变标签；`DateAdapter.fromParts` 返回 `null` 的非法日期
或 DST 不存在时间也必须禁用。DatePicker 复用 Picker 的 Popup、五行滚轮、listbox、滚动锁、焦点、
确认式 draft 和取消回滚。`MeuFormDatePicker` 仅在确定时写入字段，取消不触发 dirty，错误聚焦原生触发按钮。

```ts
type TimePickerPrecision = "hour" | "minute" | "second";
type TimePickerHourCycle = "h23" | "h12";
type TimePickerPeriod = "am" | "pm";
type TimePickerColumn = TimePickerPrecision | "period";
type TimeValue = Pick<DateParts, "hour" | "minute" | "second">;
type TimePickerProps = Omit<
  PickerProps<number | TimePickerPeriod>,
  | "columns"
  | "columnLabels"
  | "defaultValue"
  | "onConfirm"
  | "onSelect"
  | "renderOption"
  | "value"
> & {
  value?: TimeValue | null;
  defaultValue?: TimeValue | null;
  min?: TimeValue;
  max?: TimeValue;
  precision?: TimePickerPrecision;
  hourCycle?: TimePickerHourCycle;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  columnLabels?: Partial<Record<TimePickerColumn, string>>;
  filter?: Partial<
    Record<
      TimePickerPrecision,
      (
        value: number,
        details: {
          time: TimeValue | null;
          precision: TimePickerPrecision;
          hourCycle: TimePickerHourCycle;
        },
      ) => boolean
    >
  >;
  renderLabel?: (
    column: TimePickerColumn,
    value: number | TimePickerPeriod,
    details: unknown,
  ) => ReactNode;
  onSelect?: (
    value: TimeValue,
    details: PickerSelectDetails & { column: TimePickerColumn },
  ) => void;
  onConfirm?: (value: TimeValue) => void;
};
```

`TimePicker` 表达一天内的民用时间，不附带虚构日期、时区或日期库实例；公开值始终是 24 小时制的
`{ hour, minute, second }`。默认 precision 为 minute、hourCycle 为 h23；h12 只改变列与标签表示，确认值仍保持
0–23 小时。hour precision 把分秒归零，minute precision 把秒归零。未提供值时 draft 从 min 开始，默认边界为
00:00:00–23:59:59；min 大于 max 视为矛盾约束并禁用确认，不隐式解释为跨午夜区间。

`hourStep / minuteStep / secondStep` 分别夹紧到 1–23 / 1–59 / 1–59。边界按当前列精度的时分秒前缀比较；
`filter` 接收规范化的 24 小时值，因此在 h12 下不会泄漏展示层的 AM/PM 编码。h12 增加 period 列，切换 period
会保留显示小时并转换为对应 24 小时值，再重新归一化后续列。TimePicker 复用 Picker 的五行滚轮、listbox、
确认式 draft、取消回滚、焦点恢复、滚动锁和 safe area。`MeuFormTimePicker` 仅在确定时写入 `TimeValue | null`，
取消不触发 dirty，错误聚焦原生触发按钮。

```ts
type CalendarSelectionMode = "single" | "multiple" | "range";
type CalendarRange<TDate> = readonly [TDate, TDate];
type CalendarProps<TDate = Date> = {
  adapter?: DateAdapter<TDate>;
  selectionMode?: CalendarSelectionMode;
  value?: TDate | readonly TDate[] | CalendarRange<TDate> | null;
  defaultValue?: TDate | readonly TDate[] | CalendarRange<TDate> | null;
  month?: TDate;
  defaultMonth?: TDate;
  onMonthChange?: (
    month: TDate,
    details: {
      reason:
        "keyboard" | "next-month" | "outside-day" | "previous-month" | "today";
    },
  ) => void;
  min?: TDate;
  max?: TDate;
  disabled?: boolean;
  disabledDate?: (date: TDate, details: unknown) => boolean;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  fixedWeeks?: boolean;
  showOutsideDays?: boolean;
  renderDay?: (day: number, details: unknown) => ReactNode;
  renderLabel?: (date: TDate, details: unknown) => ReactNode;
};
```

`Calendar` 是内联月历视图，不包含 Popup、确认栏或业务快捷范围；这些组合能力由
`DateRangePicker` 提供。日期值统一归一化到 adapter 的 `startOf(day)`，核心包不绑定具体日期库或时区。
单选、多选、范围模式分别使用 `TDate | null`、`readonly TDate[]`、`readonly [TDate, TDate] | null`；
范围第一次点按产生同日范围并标记 `complete=false`，第二次点按按时间顺序完成范围，因此同日范围也可表达。

月视图默认固定六周、42 格和 48px 日期触控高度；相邻月日期可直接选择并触发月份切换。`min / max` 与
`disabledDate` 同时控制日期和月份导航。读屏结构使用 grid / row / gridcell 与原生 button，roving tabindex
支持方向键、Home / End、PageUp / PageDown 和 Shift 年跳转。`MeuFormCalendar` 直接绑定对应模式的字段值，
每次有效选择立即写入表单；验证失败聚焦当前可选日期，不引入确认式 draft。

```ts
type DateRangePickerPreset<TDate> = {
  key: string;
  label: ReactNode;
  value: CalendarRange<TDate>;
  disabled?: boolean;
};
type DateRangePickerSelectDetails<TDate> =
  | { reason: "calendar"; date: TDate; complete: boolean }
  | { reason: "preset"; presetKey: string; complete: true };
type DateRangePickerProps<TDate = Date> = {
  adapter?: DateAdapter<TDate>;
  value?: CalendarRange<TDate> | null;
  defaultValue?: CalendarRange<TDate> | null;
  open?: boolean;
  defaultOpen?: boolean;
  month?: TDate;
  defaultMonth?: TDate;
  min?: TDate;
  max?: TDate;
  disabled?: boolean;
  disabledDate?: (date: TDate, details: unknown) => boolean;
  presets?: ReadonlyArray<DateRangePickerPreset<TDate>>;
  onSelect?: (
    value: CalendarRange<TDate>,
    details: DateRangePickerSelectDetails<TDate>,
  ) => void;
  onConfirm?: (value: CalendarRange<TDate>) => void;
  onCancel?: (details: { reason: "cancel" | "mask" | "escape" }) => void;
  onOpenChange?: (
    open: boolean,
    details: {
      reason: "cancel" | "confirm" | "escape" | "mask" | "trigger";
    },
  ) => void;
  renderRangeLabel?: (
    value: CalendarRange<TDate> | null,
    details: { adapter: DateAdapter<TDate>; complete: boolean; locale: string },
  ) => ReactNode;
};
```

`DateRangePicker` 是 `Popup + Calendar(range)` 的确认式组合，不复制日期网格。打开时从已提交值初始化 draft；
首次点按产生 `[start, start]` 但保持 `complete=false` 并禁用确定，第二次点按自动排序并完成，因此同日范围也
必须二次点按。`presets` 只替换 draft，不自动确认；越界、端点禁用或显式 disabled 的快捷范围不可操作。

取消、遮罩和 Escape 丢弃 draft，确认才提交。日期范围允许跨过中间禁用日期，`disabledDate` 只约束可选端点。
Popup 负责焦点圈定、恢复、滚动锁、safe area 与模态语义；核心组件不包含表单、路由和接口逻辑。
`MeuFormDateRangePicker` 通过原生 `PickerTrigger` 绑定 `CalendarRange<TDate> | null`，确定后才写入字段，
取消不触发 dirty，校验失败聚焦触发器。

### SwipeActions / PullToRefresh / InfiniteList / Carousel

```ts
type SwipeActionsSide = "left" | "right";
type SwipeActionsActionTone =
  "neutral" | "accent" | "success" | "warning" | "danger";
type SwipeActionsAction = {
  key: React.Key;
  label: ReactNode;
  "aria-label"?: string;
  tone?: SwipeActionsActionTone;
  disabled?: boolean;
  closeOnPress?: boolean;
  onPress?: (details: {
    index: number;
    side: SwipeActionsSide;
  }) => boolean | void | Promise<boolean | void>;
};
type SwipeActionsOpenChangeDetails =
  | { reason: "swipe" | "keyboard" | "content" | "outside" | "escape" }
  | { actionKey: React.Key; reason: "action" };
type SwipeActionsProps = {
  children: ReactNode;
  leftActions?: readonly SwipeActionsAction[];
  rightActions?: readonly SwipeActionsAction[];
  openSide?: SwipeActionsSide | null;
  defaultOpenSide?: SwipeActionsSide | null;
  onOpenSideChange?: (
    side: SwipeActionsSide | null,
    details: SwipeActionsOpenChangeDetails,
  ) => void;
  onAction?: (
    action: SwipeActionsAction,
    details: { index: number; side: SwipeActionsSide },
  ) => boolean | void | Promise<boolean | void>;
  onActionError?: (error: unknown, action: SwipeActionsAction) => void;
  openThreshold?: number;
  closeOnAction?: boolean;
  closeOnOutsidePress?: boolean;
  disabled?: boolean;
  revealLeftLabel?: string;
  revealRightLabel?: string;
  leftActionsLabel?: string;
  rightActionsLabel?: string;
};
type PullToRefreshStatus =
  "idle" | "pulling" | "ready" | "refreshing" | "complete";
type PullToRefreshProps = {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  onRefreshError?: (error: unknown) => void;
  onStatusChange?: (status: PullToRefreshStatus, details: unknown) => void;
  canPull?: () => boolean;
  disabled?: boolean;
  threshold?: number;
  maxPullDistance?: number;
  resistance?: number;
  completeDelay?: number;
  actionLabel?: string;
  renderIndicator?: (
    status: PullToRefreshStatus,
    details: { distance: number; threshold: number },
  ) => ReactNode;
};
type InfiniteListStatus = "idle" | "loading" | "error" | "complete";
type InfiniteListProps = {
  loadMore: () => Promise<void>;
  hasMore: boolean;
  autoLoad?: boolean;
  disabled?: boolean;
  threshold?: number;
  loadMoreLabel?: string;
  retryLabel?: string;
  loadingContent?: ReactNode;
  errorContent?: ReactNode;
  completeContent?: ReactNode;
  onLoadError?: (error: unknown) => void;
  onStatusChange?: (status: InfiniteListStatus, details: unknown) => void;
  renderContent?: (status: InfiniteListStatus) => ReactNode;
};
type CarouselIndexChangeReason = "autoplay" | "drag" | "next" | "previous";
type CarouselItem = {
  key: React.Key;
  ariaLabel?: string;
  content: ReactNode;
};
type CarouselProps = {
  items: readonly CarouselItem[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (
    index: number,
    details: { reason: CarouselIndexChangeReason },
  ) => void;
  loop?: boolean;
  allowDrag?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  disabled?: boolean;
  gap?: number;
  indicator?: false | ((count: number, activeIndex: number) => ReactNode);
  indicatorVariant?: "dot" | "line";
  previousLabel?: string;
  nextLabel?: string;
  pauseLabel?: string;
  playLabel?: string;
};
type FloatingPanelPlacement = "bottom" | "top";
type FloatingPanelHeightChangeReason =
  "drag" | "handle" | "keyboard" | "imperative";
type FloatingPanelHeightChangeDetails = {
  index: number;
  reason: FloatingPanelHeightChangeReason;
};
type FloatingPanelRef = {
  setHeight: (height: number, options?: { immediate?: boolean }) => void;
};
type FloatingPanelProps = {
  anchors: readonly number[];
  children: ReactNode;
  height?: number;
  defaultHeight?: number;
  onHeightChange?: (
    height: number,
    details: FloatingPanelHeightChangeDetails,
  ) => void;
  placement?: FloatingPanelPlacement;
  dragFromContent?: boolean;
  disabled?: boolean;
  inertiaFactor?: number;
  handleLabel?: string;
  safeArea?: boolean;
};
type VirtualListAlign = "start" | "center" | "end" | "auto";
type VirtualListScrollBehavior = "auto" | "smooth";
type VirtualListRange = {
  visibleStartIndex: number;
  visibleEndIndex: number;
  overscanStartIndex: number;
  overscanEndIndex: number;
};
type VirtualListRef = {
  nativeElement: HTMLDivElement | null;
  scrollToIndex: (
    index: number,
    options?: {
      align?: VirtualListAlign;
      behavior?: VirtualListScrollBehavior;
    },
  ) => void;
  scrollToOffset: (
    offset: number,
    options?: { behavior?: VirtualListScrollBehavior },
  ) => void;
  measure: () => void;
};
type VirtualListProps<T> = {
  items: readonly T[];
  height: number;
  estimateSize: number | ((item: T, index: number) => number);
  getItemKey: (item: T, index: number) => React.Key;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  gap?: number;
  initialOffset?: number;
  emptyContent?: ReactNode;
  onRangeChange?: (range: VirtualListRange) => void;
};
type NumberKeyboardMode = "number" | "decimal";
type NumberKeyboardOpenChangeReason = "close-button" | "confirm" | "escape";
type NumberKeyboardExtraKey = {
  value: string;
  label: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
};
type NumberKeyboardProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (
    open: boolean,
    details: { reason: NumberKeyboardOpenChangeReason },
  ) => void;
  mode?: NumberKeyboardMode;
  title?: string;
  extraKey?: NumberKeyboardExtraKey | null;
  confirmLabel?: string | null;
  confirmDisabled?: boolean;
  disabled?: boolean;
  randomOrder?: boolean;
  deleteRepeat?: boolean;
  closeOnConfirm?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  safeArea?: boolean;
  forceMount?: boolean;
  onInput?: (
    value: string,
    details: { source: "digit" | "decimal" | "extra" },
  ) => void;
  onDelete?: (details: { repeated: boolean }) => void;
  onConfirm?: () => void;
};
type NumberKeyboardTriggerProps = {
  open: boolean;
  value?: ReactNode;
  placeholder?: ReactNode;
  status?: "default" | "error";
};
type PasscodeInputChangeSource = "native" | "keyboard" | "delete";
type PasscodeInputKeyboardOptions = Omit<
  NumberKeyboardProps,
  "open" | "defaultOpen" | "onOpenChange" | "onInput" | "onDelete" | "onConfirm"
> & {
  title?: string;
  keyboardAriaLabel?: string;
  closeOnComplete?: boolean;
  onConfirm?: (value: string) => void;
};
type PasscodeInputProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (
    value: string,
    details: { source: PasscodeInputChangeSource },
  ) => void;
  onComplete?: (value: string) => void;
  length?: number;
  mask?: boolean;
  separated?: boolean;
  caret?: boolean;
  direction?: "ltr" | "rtl";
  status?: "default" | "error";
  inputMode?: "numeric" | "text";
  keyboard?: PasscodeInputKeyboardOptions;
};
type ImageViewerControls = "full" | "minimal";
type ImageViewerOpenChangeReason = "close-button" | "escape";
type ImageViewerIndexChangeReason = "drag" | "imperative" | "next" | "previous";
type ImageViewerScaleChangeReason =
  "double-tap" | "pinch" | "reset" | "zoom-in" | "zoom-out";
type ImageViewerItem = {
  alt: string;
  key?: React.Key;
  src: string;
  srcSet?: string;
  sizes?: string;
};
type ImageViewerProps = {
  images: readonly ImageViewerItem[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (
    open: boolean,
    details: { reason: ImageViewerOpenChangeReason },
  ) => void;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (
    index: number,
    details: { reason: ImageViewerIndexChangeReason },
  ) => void;
  loop?: boolean;
  zoom?: boolean;
  maxZoom?: number;
  doubleTapZoom?: number;
  onScaleChange?: (
    scale: number,
    details: { index: number; reason: ImageViewerScaleChangeReason },
  ) => void;
  controls?: ImageViewerControls;
  showCounter?: boolean;
  renderFooter?: (item: ImageViewerItem, index: number) => ReactNode;
};
type ImageUploaderTaskStatus = "pending" | "uploading" | "error";
type ImageUploaderChangeReason = "remove" | "upload";
type ImageUploaderRejectReason =
  "accept" | "before-upload" | "max-count" | "max-size";
type ImageUploaderItem = {
  alt: string;
  key?: React.Key;
  name?: string;
  thumbnailUrl?: string;
  url: string;
};
type ImageUploaderUploadContext = {
  onProgress: (progress: number) => void;
  signal: AbortSignal;
  taskId: string;
};
type ImageUploaderTask = {
  error?: unknown;
  file: File;
  id: string;
  name: string;
  previewUrl?: string;
  progress: number;
  status: ImageUploaderTaskStatus;
};
type ImageUploaderProps = {
  value?: readonly ImageUploaderItem[];
  defaultValue?: readonly ImageUploaderItem[];
  onChange?: (
    items: ImageUploaderItem[],
    details: { item: ImageUploaderItem; reason: ImageUploaderChangeReason },
  ) => void;
  upload: (
    file: File,
    context: ImageUploaderUploadContext,
  ) => Promise<ImageUploaderItem>;
  accept?: string;
  multiple?: boolean;
  capture?: "user" | "environment" | boolean;
  maxCount?: number;
  maxSize?: number | ((file: File) => boolean);
  beforeUpload?: (
    file: File,
    files: readonly File[],
  ) => File | null | Promise<File | null>;
  onDelete?: (
    item: ImageUploaderItem,
  ) => boolean | void | Promise<boolean | void>;
  onReject?: (details: {
    accepted: readonly File[];
    files: readonly File[];
    reason: ImageUploaderRejectReason;
    rejected: readonly File[];
  }) => void;
  onUploadQueueChange?: (tasks: readonly ImageUploaderTask[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  deletable?: boolean;
  preview?: boolean;
  showFailed?: boolean;
  showUpload?: boolean;
  columns?: number;
};
```

`SwipeActions` 只负责沿水平方向移动任意内容并显露左右动作，不绑定 Cell、列表数据、路由或确认流程。
`openSide / defaultOpenSide / onOpenSideChange` 以 `left | right | null` 表达受控/非受控状态；受控调用方未提交
新值时，Web 视觉在下一帧恢复权威 side。关闭原因区分 swipe / keyboard / content / outside / escape / action。

移动超过 6px 后才锁定方向，纵向意图保持原生滚动；`openThreshold` 默认是轨道宽度的 0.35，并限制在
0.1–0.9，快速横扫可越过距离阈值。动作支持同步或异步结果，等待期间锁定全部动作；返回 `false` 或失败时
保持展开，失败交给 `onActionError`，核心组件不显示业务 Toast。隐藏动作不进入 Tab 顺序，每侧提供获得焦点
时显现的原生打开按钮，所有动作目标不小于 44px。列表还必须通过 Cell 更多菜单暴露同一动作，危险操作的
确认由 ActionMenu / Dialog 组合完成。未来 uni-app 复用 side、阈值、方向锁、动作结果与关闭原因；Web 的
Pointer Events、ResizeObserver 和 transform 留在 React 适配层。

`PullToRefresh` 只增强已有页面或滚动祖先，不创建新的滚动容器。默认检测最近可滚动祖先是否到顶，复杂宿主
可用 `canPull()` 提供平台判断。纵向下拉依次进入 pulling / ready；越过默认 64px 阈值后松手才进入
refreshing，并且同一轮只调用一次 `onRefresh`。Promise 完成后短暂显示 complete，拒绝时报告错误并复位。

视觉位移上限默认 120px，并通过 resistance 将手指距离映射到 transform；横向手势、向上移动和短下拉不
接管原生滚动。indicator 使用 live status，刷新期间公开 `aria-busy`。获得焦点时显现的 44px 原生“刷新内容”
按钮提供键盘与读屏等价路径。组件不处理请求缓存、业务 Toast 或列表空状态，未来 uni-app 实现复用状态、
阈值与 `canPull()` 契约。

`InfiniteList` 是放在列表尾部的状态与触发器，不持有列表数据或创建滚动容器。默认在尾部进入最近滚动祖先
底部 250px 范围时通过 IntersectionObserver 预加载；`autoLoad=false` 或 Observer 不可用时保留 44px 原生
“加载更多”按钮。`loadMore` 必须返回 Promise，并由同步 ref 锁阻止 Observer、手动按钮和重试入口并发调用。

加载失败进入 error 且不自动重试，只能由原生“重试”按钮再次调用同一 `loadMore`；`hasMore=false` 是唯一
complete 事实源，组件不按返回条数猜测结束。默认状态通过 live status 与 `aria-busy` 公开，视觉可由
`renderContent` 只替换状态视觉，原生加载与重试按钮始终由组件保留。请求缓存、游标、列表数据、空状态与错误 Toast 仍归调用方；
未来 uni-app 实现复用状态、阈值、并发锁和手动降级契约，Web Observer 留在 React 适配层。

`Carousel` 面向内容横幅、商品展示和引导页，默认不自动播放。它支持 `index / defaultIndex / onIndexChange`
并明确区分 drag / previous / next / autoplay 原因；受控调用方未提交新索引时，Web 视图恢复到权威值。
`loop` 使用无克隆循环，避免复制幻灯片内的 DOM id；`allowDrag=false` 只关闭拖拽，不关闭原生前后按钮。

前后按钮始终保留且触控区域不小于 44×44px；默认 `PaginationDots` 只读，可替换或关闭，不伪造成可点击
控件。自动播放启用时，暂停/播放按钮必须位于轮播内的首个 Tab 位置；焦点进入或拖拽后保持停止，hover 与
页面隐藏仅临时暂停。reduced motion 下不自动启动，只有用户显式播放后才允许以即时切换继续。自动播放时
内容 live region 为 off，停止时为 polite；失活幻灯片为 `aria-hidden` 并从 Tab 顺序移除其可聚焦后代。
Web 的拖拽、snap 与 loop 使用外置 Embla 适配，未来 uni-app 只复用索引、循环、暂停和回调契约。

`FloatingPanel` 是附着在页面顶部或底部的常驻内容面板，适合地图、行程和商品筛选等需要同时保留背景上下文的
场景。它不是模态浮层，不使用 Portal、Mask、页面滚动锁或焦点圈定；需要遮罩、关闭与焦点恢复时应使用
BottomSheet。`anchors` 使用正像素高度并归一化为 44px 到可视视口高度之间的升序唯一值；默认从最小 anchor
开始。`height / defaultHeight / onHeightChange` 提供受控与非受控状态，不存在的高度映射到最近 anchor。

React Web 适配层使用 Pointer Events 与 transform；拖拽释放后按距离和速度吸附到最近 anchor，`inertiaFactor`
默认 50。原生 44px handle 是始终可靠的拖拽入口，并支持方向键、PageUp / PageDown、Home / End、Enter /
Space。`dragFromContent=true` 时，面板尚未到最大高度可从非交互内容区继续拖动；到最大高度后内容区完全交还
原生纵向滚动，收起仍通过 handle 完成，避免 JS 手势与 iOS 滚动争抢。Top placement 的增高方向与 Bottom
相反，但 height 与 anchor 仍统一表示可见面板高度。

`setHeight()` 只请求最近 anchor，受控调用方仍是事实源；`onHeightChange` 区分 drag / handle / keyboard /
imperative，并提供归一化后的 index。disabled 只关闭拖拽和键盘调整，不隐藏内容。组件不拥有地图、列表数据、
筛选状态或业务导航；未来 uni-app 复用 anchors、height、placement、惯性和变更原因，替换 Web 手势与 DOM 样式层。

`VirtualList` 是纵向长列表的窗口化基础设施，不拥有分页、选择、树结构、请求或业务空状态。`items` 与
`getItemKey` 是数据和稳定身份的唯一事实源；`estimateSize` 可为统一像素值，也可按 item 估算。React Web
适配层使用成熟虚拟化引擎处理滚动观察、动态测量与 iOS WebKit 尺寸修正，但引擎类型不进入公开 API。

外层是带可访问名称的原生纵向滚动容器，公开 `role=list`；已挂载行使用 `role=listitem`、`aria-setsize`
和 `aria-posinset` 表达完整集合，而不是把当前 DOM 子集误报为总数。默认 overscan 为 3；范围回调分别报告
可见区与常规 overscan 边界，不把为无障碍而强制保留的离屏焦点行伪装成连续渲染范围。焦点落在某一行或其
后代时，即使程序化滚到远处也继续挂载该行，直到焦点离开列表，避免交互控件在滚动中被无声卸载。

`height` 为明确的像素视口高度，并与 `initialOffset`、`estimateSize` 共同提供确定的 SSR 首屏窗口；模块顶层
不读取 window / document。每行挂载后通过实际 DOM 尺寸校正，`measure()` 用于字体、密度或外部布局整体变化；
`scrollToIndex()` 与 `scrollToOffset()` 只提供平台中立的命令式便利入口。首版刻意只支持纵向单列，不承诺
横向、网格、瀑布流或 window scroll。未来 uni-app 复用 items、key、估算、范围和定位契约，替换 Web 引擎。

`NumberKeyboard` 是特殊数字输入场景的补充，不替代系统原生键盘，也不持有金额、密码、身份证号或表单字段值。
它只发布 digit / decimal / extra、delete 与 confirm 意图；调用方负责长度、小数位、格式、校验和提交。`open /
defaultOpen / onOpenChange` 只控制键盘可见性，并把 close-button / confirm / escape 原因返回给调用方。

Web 适配层使用非模态底部 Portal：不显示 Mask、不锁页面滚动、不圈定或主动移动焦点。鼠标按下键盘时阻止当前
输入框失焦，但所有键仍是可 Tab 到达、可由 Enter / Space 激活的原生 button；键盘容器使用带可访问名称的
`role=group`。删除键支持默认 600ms 后每 120ms 连续删除，并在一次长按后抑制额外 click；可用
`deleteRepeat=false` 关闭。所有按键目标至少 56px 高，收起按钮至少 44px，底部默认适配 Safe Area。

`mode=decimal` 默认提供小数点；`extraKey` 可替换为 X、00 等带独立 ariaLabel 的平台中立按键，显式 null 可留空。
`confirmLabel` 启用数字矩阵下方的全宽确认键，`closeOnConfirm` 默认 true。`randomOrder` 只改变每次打开时的数字视觉顺序，不应被
描述为密码学安全措施。`NumberKeyboardTrigger` 使用原生 button 展示值且不会唤起系统软键盘；
`MeuFormNumberKeyboard` 在 `form-react` 绑定 React Hook Form，负责值变换、dirty / touched、错误关联与校验焦点。
`PasscodeInput` 使用真实原生 input 作为值、系统键盘、自动填充、粘贴和可访问性的唯一事实源，视觉格只做
`aria-hidden` 镜像。默认长度为 6、默认 mask，并使用 `autocomplete=one-time-code`；mask 只改变视觉与 input
类型，不是加密。默认优先系统键盘；需要 Meu NumberKeyboard 时通过 `keyboard` 组合，仍由 caller 或表单层
持有值，Web 端不创建 Mask、滚动锁或焦点圈定。`onComplete(value)` 对每个完整值只发布一次，值再次变为
不完整后可重新完成；`separated`、caret、LTR / RTL 和 error 都是平台中立契约。

`MeuFormPasscodeInput` 在 `form-react` 绑定 React Hook Form，负责 dirty / touched、Zod 校验、错误关联和失败时
聚焦真实 input。未来 uni-app 复用值、长度、完成、方向和状态契约，替换 DOM input、自动填充与 Portal 层。
NumberKeyboard 自身继续复用事件、显示状态、长按节奏和布局契约，替换 Portal 与 DOM 事件。

`ImageViewer` 以带必填 `alt` 的 `images` 为唯一媒体集合，并用 `index / defaultIndex / onIndexChange`
统一单图与画廊。默认不循环、允许缩放，最大倍率为 3、双击倍率为 2；缩放后暂停 Carousel 拖拽，避免平移图片
与切换图片争抢手势。关闭、前后切换、缩放和重置都有至少 44×44px 的原生按钮；键盘提供 Escape、左右方向键、
加减号和 0 的等价入口。组件不通过点击图片或 Mask 关闭，以免与双击缩放冲突。

Web 端使用 Portal、thick Mask、页面滚动锁、模态焦点圈定和关闭后焦点恢复；图片加载与失败视觉复用 `Image`，
画廊索引与控制约定复用 `Carousel`。`ImageViewer` 只展示媒体，不参与字段值、dirty / touched 或校验，因此没有
`form-react` adapter。未来 uni-app 复用 images、index、loop、缩放倍率和变更原因，替换 DOM、Portal 与手势层。

`ImageUploader` 把可序列化成功值与平台上传任务明确分离。`value / defaultValue / onChange` 只保存带 url 与 alt
的 `ImageUploaderItem[]`；Web `File`、object URL、AbortSignal、进度和异常只存在于临时任务。调用方通过
`upload(file, { signal, onProgress, taskId })` 注入 transport，组件不绑定请求库、鉴权或业务响应结构。

真实 file input 是选择、capture、焦点与可访问名称的事实源；accept、maxSize、beforeUpload 与 maxCount 在上传前
统一校验，pending / uploading / error 任务支持进度、abort、失败重试和删除。成功图片复用 `Image`，预览复用
`ImageViewer`，add / delete / retry 保持至少 44×44px 原生按钮。`MeuFormImageUploader` 在 `form-react` 绑定
React Hook Form 数组值，负责 dirty / touched、schema 错误关联与失败聚焦。未来 uni-app 复用成功项、任务状态、
拒绝原因和回调语义，替换文件选择、object URL、上传取消与 DOM 焦点实现。

手势组件默认提供替代操作入口：SwipeActions 的每个动作也能从 Cell 的更多菜单执行；PullToRefresh 保持原生滚动语义；InfiniteList 以 `loadMore: () => Promise<void>` 为契约并锁定并发加载；Carousel 保留前后与暂停/播放原生按钮。当前开发验收只运行仓库内 Pixel 5 Chromium 与 iPhone 13 WebKit 隔离 H5，不接入 `hybird-meumall` 或真实业务链路；真机 Safari / Chrome 回归留到发布加固阶段。

## 受控状态范式

```tsx
const [value, setValue] = useState('')
<TextInput value={value} onChange={event => setValue(event.target.value)} />

const [sheetOpen, setSheetOpen] = useState(false)
<BottomSheet open={sheetOpen} onOpenChange={setSheetOpen} title="筛选条件" />
```

不提供隐式全局 `show()` API 作为唯一途径。若提供命令式 helper（如 `toast.show`），它必须只是一层对受控 provider 的便捷封装，并能在测试中替换。

### TreeSelect

TreeSelect 用于可搜索、大数据或需要任意展开的层级选择；固定路径逐列选择继续使用 CascadePicker。组件本体是
底部 Popup 面板，字段和表单场景复用 PickerTrigger。`value/defaultValue` 统一为节点值数组，`multiple=false`
时最多一个值；默认 `selectionMode="leaf"`，父节点只负责展开。多选采用独立勾选，不隐式联动父子节点，
并可通过 `maxCount` 限制数量。

面板使用确认式 draft：节点操作触发 `onSelect`，确定才触发 `onConfirm` 并提交，取消、Mask 和 Escape 回滚。
搜索保留命中节点的完整祖先路径但不改写展开值；非文本 label 必须提供 `textValue`。`isLeaf=false` 表示可异步
加载子节点，`loadChildren(option, { signal })` 只发布加载意图，options 仍由调用方持有。

Web 端默认使用 TanStack Virtual 窗口化可见节点，提供 tree/treeitem、aria-level、aria-posinset、
aria-setsize、方向键、Home/End、Enter/Space 和 type-ahead。单选使用 aria-selected，多选使用 aria-checked，
焦点与选择互相独立。`MeuFormTreeSelect` 在确定时绑定 React Hook Form 的 change + blur；未来 uni-app 复用
值、搜索、展开、加载和提交契约，替换 Portal、DOM 焦点、ARIA 与虚拟列表实现。
