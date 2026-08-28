import { componentStoryIds, getComponentStoryId } from "./storybook-links";

export type ComponentCategoryId =
  | "foundation"
  | "actions-feedback"
  | "data-entry"
  | "navigation"
  | "information"
  | "collections"
  | "pickers"
  | "advanced";

export type ComponentCategory = {
  description: string;
  id: ComponentCategoryId;
  index: string;
  label: string;
};

export type ComponentDoc = {
  category: ComponentCategoryId;
  description: string;
  highlights: readonly string[];
  name: string;
  packageName: "@meu/form-react" | "@meu/icons-react" | "@meu/mobile" | "@meu/primitives-react";
  priority: "P0" | "P1" | "P2";
  slug: string;
  sourcePath: string;
  sourcePathPrefixes?: readonly string[];
  storyId?: string;
  storyTitle?: string;
};

export const componentCategories: readonly ComponentCategory[] = [
  {
    id: "foundation",
    index: "01",
    label: "基础能力",
    description: "主题、布局、图标与可访问性原语，所有上层组件共享的稳定地基。"
  },
  {
    id: "actions-feedback",
    index: "02",
    label: "操作与反馈",
    description: "从按钮到浮层，覆盖动作触发、结果反馈、焦点与页面滚动边界。"
  },
  {
    id: "data-entry",
    index: "03",
    label: "信息录入",
    description: "原生语义优先的输入控件，并提供 React Hook Form 与 Zod 完整适配。"
  },
  {
    id: "navigation",
    index: "04",
    label: "导航",
    description: "页面、标签、索引和分类导航，保持内容、滚动及路由所有权清晰。"
  },
  {
    id: "information",
    index: "05",
    label: "信息展示",
    description: "用于组织状态、媒体、列表和流程信息的轻量展示组件。"
  },
  {
    id: "collections",
    index: "06",
    label: "集合与手势",
    description: "面向移动浏览器的分页、轮播、滑动操作和高密度内容容器。"
  },
  {
    id: "pickers",
    index: "07",
    label: "选择器",
    description: "确认式草稿、平台无关日期适配与一致的弹层交互模型。"
  },
  {
    id: "advanced",
    index: "08",
    label: "高级组件",
    description: "图片、树、虚拟列表与业务输入等高成本能力，明确 Web 与 uni-app 边界。"
  }
] as const;

const defaultHighlights: Record<ComponentCategoryId, readonly string[]> = {
  foundation: ["设计 Token 驱动", "SSR 安全", "Chrome 70 / iOS 13+"],
  "actions-feedback": ["原生交互语义", "焦点与滚动治理", "reduced-motion"],
  "data-entry": ["受控与非受控", "键盘与读屏", "完整表单适配"],
  navigation: ["稳定状态身份", "键盘等价路径", "路由解耦"],
  information: ["内容优先", "深色主题", "可组合插槽"],
  collections: ["触摸与键盘等价", "性能边界", "降级路径"],
  pickers: ["确认式草稿", "DateAdapter", "焦点恢复"],
  advanced: ["复杂状态契约", "本地 H5 验证", "uni-app 适配边界"]
};

function mobile(
  name: string,
  slug: string,
  category: ComponentCategoryId,
  description: string,
  options: {
    priority?: "P0" | "P1" | "P2";
    sourceName?: string;
    sourcePathPrefixes?: readonly string[];
    /** Human-readable Storybook grouping; the link itself comes from the explicit ID map. */
    storyTitle?: string;
    highlights?: readonly string[];
  } = {}
): ComponentDoc {
  const storyId = getComponentStoryId(slug);

  return {
    category,
    description,
    highlights: options.highlights || defaultHighlights[category],
    name,
    packageName: "@meu/mobile",
    priority: options.priority || "P0",
    slug,
    sourcePath: `packages/mobile/src/${options.sourceName || name}`,
    ...(options.sourcePathPrefixes ? { sourcePathPrefixes: options.sourcePathPrefixes } : {}),
    ...(storyId ? { storyId } : {}),
    ...(options.storyTitle ? { storyTitle: options.storyTitle } : {})
  };
}

export const componentDocs: readonly ComponentDoc[] = [
  mobile("ConfigProvider", "config-provider", "foundation", "统一主题、语言与 Portal 容器配置。", {
    sourceName: "ConfigProvider",
    storyTitle: "Foundation/ConfigProvider"
  }),
  mobile(
    "ThemeProvider",
    "theme-provider",
    "foundation",
    "ConfigProvider 的主题语义别名，支持 light、dark 与 system。",
    {
      sourceName: "ConfigProvider",
      storyTitle: "Foundation/ThemeProvider"
    }
  ),
  {
    category: "foundation",
    description: "将浮层安全渲染到调用方或全局容器，并兼容 SSR。",
    highlights: defaultHighlights.foundation,
    name: "Portal",
    packageName: "@meu/primitives-react",
    priority: "P0",
    slug: "portal",
    sourcePath: "packages/primitives-react/src/Portal",
    sourcePathPrefixes: [
      "packages/primitives-react/src/useBodyScrollLock",
      "packages/primitives-react/src/useFocusTrap"
    ],
    storyId: componentStoryIds.portal,
    storyTitle: "Foundation/Portal"
  },
  mobile("SafeArea", "safe-area", "foundation", "读取系统安全区并提供可组合的边缘留白。", {
    storyTitle: "Layout/SafeArea"
  }),
  {
    category: "foundation",
    description: "Meu 命名 SVG 图标的 React 渲染层，统一尺寸、描边与许可来源。",
    highlights: ["Meu 语义命名", "Lucide ISC + Feather MIT", "currentColor"],
    name: "Icon",
    packageName: "@meu/icons-react",
    priority: "P0",
    slug: "icon",
    sourcePath: "packages/icons-react/src/MeuIcon",
    storyId: componentStoryIds.icon,
    storyTitle: "Foundation/Icon"
  },
  mobile("Space", "space", "foundation", "按设计空间 Token 排布同级内容。", {
    storyTitle: "Layout/Space"
  }),
  mobile("Divider", "divider", "foundation", "表达内容层级分隔，不制造交互语义。", {
    storyTitle: "Layout/Divider"
  }),
  {
    category: "foundation",
    description: "在视觉上隐藏文本，同时保留读屏与键盘可访问内容。",
    highlights: defaultHighlights.foundation,
    name: "VisuallyHidden",
    packageName: "@meu/primitives-react",
    priority: "P0",
    slug: "visually-hidden",
    sourcePath: "packages/primitives-react/src/VisuallyHidden",
    storyId: componentStoryIds["visually-hidden"],
    storyTitle: "Foundation/VisuallyHidden"
  },

  mobile(
    "Button",
    "button",
    "actions-feedback",
    "承载主要、次要和危险动作，包含 loading 与禁用锁。",
    {
      storyTitle: "Actions/Button"
    }
  ),
  mobile(
    "IconButton",
    "icon-button",
    "actions-feedback",
    "只显示图标的原生按钮，强制提供可访问名称。",
    {
      storyTitle: "Actions/IconButton"
    }
  ),
  mobile("Mask", "mask", "actions-feedback", "浮层遮罩与点击关闭意图，不单独持有业务状态。", {
    storyTitle: "Feedback/Mask"
  }),
  mobile("Popup", "popup", "actions-feedback", "Portal、Mask、滚动锁和焦点治理的通用浮层基础。", {
    sourceName: "Popup",
    sourcePathPrefixes: ["packages/mobile/src/overlayTypes"],
    storyTitle: "Feedback/Popup"
  }),
  mobile("Toast", "toast", "actions-feedback", "非阻塞消息队列，支持命令式与 Provider 作用域。", {
    storyTitle: "Feedback/Toast"
  }),
  mobile(
    "Dialog",
    "dialog",
    "actions-feedback",
    "模态确认与信息对话框，完整管理焦点恢复和动作状态。",
    {
      storyTitle: "Feedback/Dialog"
    }
  ),
  mobile(
    "BottomSheet",
    "bottom-sheet",
    "actions-feedback",
    "移动端底部模态面板，支持拖拽关闭与安全区。",
    {
      storyTitle: "Feedback/BottomSheet"
    }
  ),
  mobile(
    "ActionMenu",
    "action-menu",
    "actions-feedback",
    "移动动作菜单，支持危险动作确认与命令式调用。",
    {
      storyTitle: "Feedback/ActionMenu"
    }
  ),
  mobile("Popover", "popover", "actions-feedback", "锚定元素的非模态浮层，不锁定页面滚动。", {
    storyTitle: "Feedback/Popover"
  }),
  mobile("Progress", "progress", "actions-feedback", "确定与不确定进度的读屏语义和多尺寸视觉。", {
    storyTitle: "Feedback/Progress"
  }),
  mobile(
    "Skeleton",
    "skeleton",
    "actions-feedback",
    "与内容形状一致的加载占位，并响应 reduced-motion。",
    {
      storyTitle: "Feedback/Skeleton"
    }
  ),
  mobile("Empty", "empty", "actions-feedback", "说明空状态原因并提供明确的下一步。", {
    storyTitle: "Feedback/Empty"
  }),
  mobile("Result", "result", "actions-feedback", "集中表达成功、等待、警告与失败结果。", {
    storyTitle: "Feedback/Result"
  }),

  mobile("Field", "field", "data-entry", "统一 label、说明、必填和错误关联的字段容器。", {
    storyTitle: "Forms/Field"
  }),
  {
    category: "data-entry",
    description: "React Hook Form + Zod 的完整表单作用域、错误映射和首次错误聚焦。",
    highlights: ["React Hook Form", "Zod", "嵌套与数组字段"],
    name: "Form",
    packageName: "@meu/form-react",
    priority: "P0",
    slug: "form",
    sourcePath: "packages/form-react/src/MeuForm",
    sourcePathPrefixes: ["packages/form-react/src/"],
    storyId: componentStoryIds.form,
    storyTitle: "Forms/FormTextInput"
  },
  mobile("TextInput", "text-input", "data-entry", "原生单行输入，支持清除、状态与 Field 关联。", {
    storyTitle: "Forms/TextInput"
  }),
  mobile("TextArea", "text-area", "data-entry", "计数、自动高度和长度限制明确的多行输入。", {
    storyTitle: "Forms/TextArea"
  }),
  mobile(
    "SearchField",
    "search-field",
    "data-entry",
    "保留 search 原生语义的输入、提交与清除组合。",
    {
      storyTitle: "Forms/SearchField"
    }
  ),
  mobile("Checkbox", "checkbox", "data-entry", "布尔与多选数组输入，使用真实 checkbox。", {
    storyTitle: "Forms/Checkbox"
  }),
  mobile(
    "RadioGroup",
    "radio-group",
    "data-entry",
    "互斥选择与方向键导航，使用真实 radio group。",
    {
      sourceName: "Radio",
      storyTitle: "Forms/Radio"
    }
  ),
  mobile("Switch", "switch", "data-entry", "即时布尔设置，保留原生输入事实源。", {
    storyTitle: "Forms/Switch"
  }),
  mobile("Stepper", "stepper", "data-entry", "带边界和步长归一化的数值增减输入。", {
    storyTitle: "Data Entry/Stepper"
  }),
  mobile("Slider", "slider", "data-entry", "支持键盘、触摸和 marks 的范围输入。", {
    storyTitle: "Data Entry/Slider"
  }),
  mobile("Rate", "rate", "data-entry", "可读写的评分输入，提供完整键盘路径。", {
    storyTitle: "Data Entry/Rate"
  }),
  mobile("Selector", "selector", "data-entry", "以卡片或标签形式完成单选、多选。", {
    storyTitle: "Data Entry/Selector"
  }),

  mobile("NavBar", "nav-bar", "navigation", "移动页面标题与原生返回动作插槽。", {
    storyTitle: "Navigation/NavBar"
  }),
  mobile("Tabs", "tabs", "navigation", "水平标签与面板关联，支持自动或手动激活。", {
    storyTitle: "Navigation/Tabs"
  }),
  mobile(
    "SegmentedControl",
    "segmented-control",
    "navigation",
    "紧凑同层级视图切换，保持 radio 语义。",
    {
      storyTitle: "Navigation/SegmentedControl"
    }
  ),
  mobile("TabBar", "tab-bar", "navigation", "底部主导航，支持链接、按钮、徽标与安全区。", {
    storyTitle: "Navigation/TabBar"
  }),
  mobile(
    "IndexList",
    "index-list",
    "navigation",
    "在组件自己的有界视口内按稳定索引快速定位分组。",
    {
      storyTitle: "Navigation/IndexList",
      highlights: ["44×44 索引目标", "roving tab stop", "scrollTo 命令"]
    }
  ),
  mobile("SideNav", "side-nav", "navigation", "垂直分类导航，可选择由组件或调用方持有内容。", {
    storyTitle: "Navigation/SideNav",
    highlights: ["vertical tabs", "navigation 模式", "104×52 目标"]
  }),

  mobile("Cell", "cell", "information", "列表中的原生按钮、链接或只读信息行。", {
    sourceName: "List",
    storyTitle: "Information/Cell & List"
  }),
  mobile("List", "list", "information", "为 Cell 提供分组、卡片、分隔线与列表语义。", {
    storyTitle: "Information/Cell & List"
  }),
  mobile("Card", "card", "information", "通过 header、content、footer 插槽组织相关内容。", {
    storyTitle: "Information/Card"
  }),
  mobile("Tag", "tag", "information", "表达短状态与分类，不替代按钮。", {
    storyTitle: "Information/Tag"
  }),
  mobile("Badge", "badge", "information", "在内容旁表达数量或提醒状态。", {
    storyTitle: "Information/Badge"
  }),
  mobile("Avatar", "avatar", "information", "图片、文字与加载失败回退统一的身份展示。", {
    storyTitle: "Information/Avatar"
  }),
  mobile("Image", "image", "information", "明确 loading、error、fallback 与适配方式的媒体组件。", {
    storyTitle: "Information/Image"
  }),
  mobile("Collapse", "collapse", "information", "原生按钮控制的可折叠内容组。", {
    storyTitle: "Information/Collapse"
  }),
  mobile("Ellipsis", "ellipsis", "information", "按容器宽度折叠长文本，并提供展开与收起路径。", {
    storyTitle: "Information/Ellipsis"
  }),
  mobile("Steps", "steps", "information", "只读有序流程状态，支持水平与垂直布局。", {
    storyTitle: "Information/Steps"
  }),
  mobile("PaginationDots", "pagination-dots", "information", "只读页码进度，不伪造点击目标。", {
    storyTitle: "Navigation/PaginationDots"
  }),

  mobile("PullToRefresh", "pull-to-refresh", "collections", "不接管滚动容器的下拉刷新状态机。", {
    priority: "P1",
    storyTitle: "Gesture/PullToRefresh"
  }),
  mobile("InfiniteList", "infinite-list", "collections", "自动观察与手动加载并存的分页触发器。", {
    priority: "P1",
    storyTitle: "Collections/InfiniteList"
  }),
  mobile("Carousel", "carousel", "collections", "拖拽、自动播放和原生控制并存的内容轮播。", {
    priority: "P1",
    storyTitle: "Gesture/Carousel"
  }),
  mobile("SwipeActions", "swipe-actions", "collections", "横向手势操作与常驻键盘菜单入口。", {
    priority: "P1",
    storyTitle: "Gesture/SwipeActions"
  }),
  mobile("FloatingPanel", "floating-panel", "collections", "页面内非模态浮动面板与内容滚动交接。", {
    priority: "P1",
    storyTitle: "Gesture/FloatingPanel"
  }),

  mobile("Picker", "picker", "pickers", "列式滚轮选择与确认式草稿模型。", {
    priority: "P1",
    storyTitle: "Data Entry/Picker"
  }),
  mobile("CascadePicker", "cascade-picker", "pickers", "父级变化后重建合法路径的级联滚轮。", {
    priority: "P1",
    storyTitle: "Data Entry/CascadePicker"
  }),
  mobile("DatePicker", "date-picker", "pickers", "通过 DateAdapter 组合年月日与时间精度。", {
    priority: "P1",
    storyTitle: "Data Entry/DatePicker"
  }),
  mobile("Calendar", "calendar", "pickers", "平台无关的单选、多选与日期范围日历。", {
    priority: "P1",
    storyTitle: "Data Entry/Calendar"
  }),
  mobile(
    "DateRangePicker",
    "date-range-picker",
    "pickers",
    "保持不完整日期范围草稿，确认后再提交。",
    {
      priority: "P1",
      storyTitle: "Data Entry/DateRangePicker"
    }
  ),
  mobile("TimePicker", "time-picker", "pickers", "支持 12/24 小时制与秒精度的时间选择。", {
    priority: "P1",
    storyTitle: "Data Entry/TimePicker"
  }),

  mobile("ImageViewer", "image-viewer", "advanced", "全屏图片画廊、缩放、焦点隔离与恢复。", {
    priority: "P2",
    storyTitle: "Feedback/ImageViewer"
  }),
  mobile(
    "ImageUploader",
    "image-uploader",
    "advanced",
    "将可序列化成功值与上传任务、重试及取消分离。",
    {
      priority: "P2",
      storyTitle: "Data Entry/ImageUploader"
    }
  ),
  mobile("NumberKeyboard", "number-keyboard", "advanced", "不持有业务值的非模态数字键盘。", {
    priority: "P2",
    storyTitle: "Data Entry/NumberKeyboard"
  }),
  mobile(
    "PasscodeInput",
    "passcode-input",
    "advanced",
    "以一个真实 input 驱动验证码视觉格与自动填充。",
    {
      priority: "P2",
      storyTitle: "Data Entry/PasscodeInput"
    }
  ),
  mobile("TreeSelect", "tree-select", "advanced", "可搜索、异步和虚拟化的层级选择面板。", {
    priority: "P2",
    storyTitle: "Data Entry/TreeSelect"
  }),
  mobile(
    "VirtualList",
    "virtual-list",
    "advanced",
    "支持动态行高和命令式定位的万条数据窗口化列表。",
    {
      priority: "P2",
      storyTitle: "Collections/VirtualList"
    }
  ),
  mobile("Watermark", "watermark", "advanced", "同构 SVG 平铺与弱篡改恢复的来源标识。", {
    priority: "P2",
    storyTitle: "Display/Watermark"
  })
] as const;

export function getCategory(id: ComponentCategoryId) {
  return componentCategories.find((category) => category.id === id);
}

export function getComponentDoc(slug: string) {
  return componentDocs.find((component) => component.slug === slug);
}

export function getComponentsByCategory(categoryId: ComponentCategoryId) {
  return componentDocs.filter((component) => component.category === categoryId);
}

export function getAdjacentComponents(slug: string) {
  const index = componentDocs.findIndex((component) => component.slug === slug);
  return {
    previous: index > 0 ? componentDocs[index - 1] : undefined,
    next: index >= 0 && index < componentDocs.length - 1 ? componentDocs[index + 1] : undefined
  };
}
