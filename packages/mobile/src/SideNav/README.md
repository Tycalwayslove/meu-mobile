# SideNav

用于在较窄移动页面中垂直切换同层级分类。它支持两种组合：items 带 `content` 时渲染完整 vertical tabs；
不带 content 时只渲染导航按钮，由调用方持有内容区。

## 契约

- `value` / `defaultValue` / `onChange` 遵守受控与非受控约定；默认选择第一个可用项。
- 上下方向键、Home / End 跳过 disabled 项并循环；默认自动激活，延迟内容可选 manual 模式。
- 有 content 时使用 vertical tablist / tab / tabpanel，并默认保留非活动面板状态。
- 无 content 时使用 navigation 与原生 button，当前项设置 `aria-current="page"`。
- item 可附带短 badge；交互目标至少 104×52px，焦点样式不依赖颜色变化。
- 组件不调用路由、不内置 sticky/fixed，也不进入 form-react。

## 边界

值模型、禁用规则和键盘状态机可跨端复用；DOM tabpanel、焦点移动和 ARIA 属于 React H5 适配层。
未来 uni-app 应复用 items/value/onChange 契约，替换为平台导航与无障碍桥接。
