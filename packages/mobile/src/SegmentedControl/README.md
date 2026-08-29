# SegmentedControl

2–5 项互斥状态的移动切换控件。默认 `radiogroup` 模式使用真实 radio，支持
Field、FormData、required 与 reset；`tabs` 模式使用真实 tablist/tab，支持关联 panel、
roving focus、方向键和 RTL。两种模式共享受控/非受控状态、动态选项焦点恢复、滑动指示器、
44 px 触控目标、reduced motion、forced colors、SSR 与 hydration 契约。

公开契约、状态、键盘、兼容边界与 V2 维护记录见 [SegmentedControl.docs.mdx](./SegmentedControl.docs.mdx)。
