# 真机与模拟器验收记录

## 目的

本文件是 V2 发布候选的设备验收事实源。自动化的移动 Chromium/WebKit、SSR、hydration、axe 和静态兼容扫描不能替代真实 Safari、WKWebView、Chrome、Android WebView、VoiceOver 与 TalkBack。

只有实际执行并填写完整环境与结果的记录才算证据。Xcode Simulator、Playwright WebKit 和桌面 Safari 必须分别标注，不能写成“iOS 真机已通过”。

## 支持矩阵

| 档位     | 环境                                                     | 发布要求                                         |
| -------- | -------------------------------------------------------- | ------------------------------------------------ |
| 完整支持 | iOS / iPadOS 15+ Safari 与 WKWebView                     | 至少一台当前主版本和一台支持下限附近真机通过     |
| 完整支持 | Android Chrome / WebView 89+                             | 至少一台当前主版本和一台支持下限附近真机通过     |
| 观察档   | iOS 13–14、Chromium / WebView 79–88                      | 抽测核心流程；失败必须记录降级，不阻断完整支持档 |
| 开发证据 | Playwright Chromium/WebKit、Xcode Simulator、桌面 Safari | 可提前发现问题，但不提升为真机通过               |

## 当前可复查状态

- 移动 Chromium/WebKit 隔离 Next H5：84/84 通过，逐用例断言 0 `pageerror`、0 `console.error`。
- Storybook：374 个 Story × 7 场景，共 2,618 个组合通过。
- 官网：68 个组件页 × Light/Dark，共 136 个 axe WCAG A/AA、主题恢复与页面运行时场景通过。
- 客户端静态兼容扫描：202 个 production 构建文件通过 Chrome 70 / iOS 13 语法和选择器基线；该结果不代替真实旧 WebView 运行时抽测。
- 当前开发机安装了 iOS 18.3 与 18.6 Simulator；尚未把模拟器目视结果登记为真机证据。
- Android SDK/ADB 可用，但尚无已配置 AVD；Android 真机与 Emulator 均未登记。
- VoiceOver、TalkBack、WKWebView 宿主、旧 WebView 和弱网/内存记录：待补。

## 每次验收必须记录

| 字段     | 填写要求                                                  |
| -------- | --------------------------------------------------------- |
| 日期     | `YYYY-MM-DD`                                              |
| 执行人   | 可追踪姓名或账号                                          |
| 设备     | 型号；明确真机或 Simulator/Emulator                       |
| 系统     | 完整 OS 版本与 build                                      |
| 容器     | Safari/Chrome 版本，或 App/WKWebView/Android WebView 版本 |
| 辅助技术 | VoiceOver/TalkBack 版本与是否开启；未测写 `not tested`    |
| 构建     | commit SHA；本地 production、预览或正式环境 URL           |
| 网络     | 正常、离线、慢 3G、自定义延迟/丢包                        |
| 范围     | 下方场景 ID 与涉及组件                                    |
| 结果     | pass/fail/blocked；失败必须附 issue、截图或录屏           |

## 核心场景

### D-01 基础显示与输入

- Light/Dark/system 主题首屏无闪烁；安全区、横竖屏、200% 字号不遮挡内容。
- TextInput、TextArea、SearchField、Stepper、PasscodeInput 覆盖中文/英文键盘、拼音 IME、粘贴、自动填充、光标与清除。
- Checkbox、Radio、Switch、Selector、SegmentedControl、Slider、Rate 可触摸并可通过外接键盘完成。

### D-02 表单生命周期

- 原生提交、RHF adapter、dirty/touched、同步/异步校验、服务端错误、reset、disabled/readOnly。
- Picker、日期时间、TreeSelect、图片上传与验证码只提交业务值，不泄漏临时对象或 UI 草稿。
- 软键盘打开、关闭、旋转和页面回退后焦点与滚动位置正确。

### D-03 Overlay 与焦点

- Popup、Dialog、BottomSheet、ImageViewer、ActionMenu：滚动锁、焦点圈、Escape/返回键、嵌套关闭和卸载清理。
- Popover、Toast、NumberKeyboard：非模态时不锁页面、不误设 focus trap；触摸后原输入焦点策略符合文档。
- VoiceOver/TalkBack 逐项确认名称、角色、状态、错误与 live region；关闭后焦点回到触发点。

### D-04 手势与滚动

- PullToRefresh、SwipeActions、Carousel、BottomSheet、FloatingPanel、IndexList、ImageViewer 在页面纵向滚动、边缘返回、多指、pointer cancel 和旋转下不误触。
- 所有手势功能都有按钮或键盘替代；`prefers-reduced-motion` 下无依赖动画才能完成的操作。
- 连续操作 60 秒后无明显掉帧、失控位移、重复回调或页面无法滚动。

### D-05 集合、图片与弱网

- VirtualList 10,000 行与 TreeSelect 1,500 节点滚动、搜索、焦点和回收稳定。
- InfiniteList 在重复触底、失败重试、离线恢复时不重复请求、不跳页。
- Image、Avatar、ImageViewer、ImageUploader 覆盖慢图、失败、取消、重试、后台恢复与大图内存；object URL 和请求在删除/卸载后释放。

### D-06 兼容与降级

- WKWebView/Android WebView 宿主分别验证 safe-area、visualViewport、body scroll lock、Portal container、返回键与路由。
- 缺少 Pointer Events、ResizeObserver、IntersectionObserver 或 flex gap 时，按单组件留存文档执行替代路径或确认观察档限制。
- 观察档失败只允许已记录的视觉/手势降级；内容、表单值和替代操作不得丢失。

## 验收记录

| 日期 | 执行人 | 设备/系统 | 容器/辅助技术 | 构建 | 场景 | 结果    | 证据/问题                |
| ---- | ------ | --------- | ------------- | ---- | ---- | ------- | ------------------------ |
| —    | —      | —         | —             | —    | —    | pending | 尚未执行真机发布候选验收 |

## 商用状态规则

组件从 `verification` 升为 `commercial` 前，必须满足：

1. 与该组件相关的核心场景在至少一台 iOS 真机和一台 Android 真机通过。
2. 读屏相关组件具有 VoiceOver 与 TalkBack 记录；纯装饰组件也要验证不进入错误的可访问性树。
3. 高风险手势/Overlay/输入组件在真实 WebView 宿主中通过对应场景。
4. 所有失败已有修复并复验，或在支持矩阵与组件留存文档中明确降级。
5. 最终集中执行 Chromatic 视觉审批和 Vercel 官网发布；开发期不重复部署。

跨设备、性能、法务、视觉与发布的最终签字统一记录在 [`RELEASE_ACCEPTANCE.md`](./RELEASE_ACCEPTANCE.md)。
