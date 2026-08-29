# Carousel

面向 H5 内容轮播、引导页与商品展示的可控轮播组件。Web 手势和无缝循环由 MIT 许可的 Embla 8.6.0 驱动，Meu 负责 API、主题与无障碍边界。

```tsx
<Carousel
  items={banners.map((banner) => ({
    key: banner.id,
    ariaLabel: banner.title,
    content: <Banner {...banner} />
  }))}
  loop
/>
```

- 支持 `index / defaultIndex / onIndexChange`，变更原因区分 `drag / next / previous / autoplay`。
- 前后原生按钮始终存在，默认只读 PaginationDots 可替换或关闭；不把点指示器伪装成点击控件。
- `loop` 由引擎实现无缝循环；`allowDrag=false` 只关闭拖拽，前后按钮与受控索引仍可用。
- 自动播放默认关闭；启用后在顶部居中提供原生暂停/播放按钮，与两侧导航保持独立的 44×44 触控区；焦点进入或手动拖拽时停止，悬停期间暂停。
- `prefers-reduced-motion` 下不会自动播放；用户显式点击播放后才允许继续，并使用即时切换。
- 轮播容器与每张内容采用 carousel / slide roledescription；独立 status 组合页名、可见页和总页数，自动播放时为 off，静止时为 polite。
- 非活动页设置 `aria-hidden`，并保存/移除其可聚焦后代的 tabindex，避免读屏或键盘进入屏外内容。
- items 缩短时，受控与非受控索引都会收敛；非受控 items 再扩容不会复活旧索引，初始空列表仍会在首批内容到达时应用 `defaultIndex`。
- track 保留纵向滚动和 pinch zoom；Embla 负责横向 drag、多指退出和 touch cancel，目标 WebView 与真机仍须验证。
- 组件不读取路由、请求或业务埋点；未来 uni-app 复用索引、循环、自动播放与暂停契约，Embla 仅属于 React Web 适配层。
- 控件覆盖在 slide 上方；业务内容需要为顶部播放控制预留 56px、为两侧导航预留至少 64px，并在 200% 字体下复核换行。
