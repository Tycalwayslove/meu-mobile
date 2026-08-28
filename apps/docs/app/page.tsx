import { ActionMenuProvider, ConfigProvider, DialogProvider, ToastProvider } from "@meu/mobile";

import { AdvancedEntryDemo } from "./AdvancedEntryDemo";
import { CalendarDemo } from "./CalendarDemo";
import { CascadePickerDemo } from "./CascadePickerDemo";
import { CarouselDemo } from "./CarouselDemo";
import { ContainerDemo } from "./ContainerDemo";
import { DatePickerDemo } from "./DatePickerDemo";
import { DateRangePickerDemo } from "./DateRangePickerDemo";
import { DisplayDemo } from "./DisplayDemo";
import { FormDemo } from "./FormDemo";
import { FeedbackDemo } from "./FeedbackDemo";
import { FloatingPanelDemo } from "./FloatingPanelDemo";
import { InformationDemo } from "./InformationDemo";
import { InfiniteListDemo } from "./InfiniteListDemo";
import { ImageViewerDemo } from "./ImageViewerDemo";
import { ImageUploaderDemo } from "./ImageUploaderDemo";
import { IndexedNavigationDemo } from "./IndexedNavigationDemo";
import { NavigationDemo } from "./NavigationDemo";
import { NumberKeyboardDemo } from "./NumberKeyboardDemo";
import { OverlayDemo } from "./OverlayDemo";
import { PasscodeInputDemo } from "./PasscodeInputDemo";
import { PickerDemo } from "./PickerDemo";
import { PullToRefreshDemo } from "./PullToRefreshDemo";
import { SelectionDemo } from "./SelectionDemo";
import { SwipeActionsDemo } from "./SwipeActionsDemo";
import { TimePickerDemo } from "./TimePickerDemo";
import { TreeSelectDemo } from "./TreeSelectDemo";
import { VirtualListDemo } from "./VirtualListDemo";
import { WatermarkDemo } from "./WatermarkDemo";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <ConfigProvider theme="system">
      <main className={styles.shell}>
        <p className={styles.eyebrow}>Meu Mobile / Engineering Preview</p>
        <h1 className={styles.title}>安静、可靠的移动组件。</h1>
        <p className={styles.intro}>
          这个站点同时是正式文档入口和 Next.js 集成测试。组件在这里经过
          SSR、hydration、主题和表单绑定验证。
        </p>
        <section className={styles.grid}>
          <article className={styles.card}>
            <h2>单一 token 源</h2>
            <p>颜色、空间、圆角、字体和动效都由 meu-design 生成。</p>
          </article>
          <article className={styles.card}>
            <h2>真实移动边界</h2>
            <p>面向 Next H5、App WebView、安全区和旧 Android 运行环境。</p>
          </article>
        </section>
        <section className={styles.formSection}>
          <h2>表单集成验证</h2>
          <FormDemo />
        </section>
        <section className={styles.formSection}>
          <h2>选择控件与布尔值绑定</h2>
          <SelectionDemo />
        </section>
        <section className={styles.formSection}>
          <h2>数值、评分与卡片选择绑定</h2>
          <AdvancedEntryDemo />
        </section>
        <section className={styles.formSection}>
          <h2>滚轮选择器与确认式表单绑定</h2>
          <PickerDemo />
        </section>
        <section className={styles.formSection}>
          <h2>级联路径选择与确认式表单绑定</h2>
          <CascadePickerDemo />
        </section>
        <section className={styles.formSection}>
          <h2>日期时间选择与 DateAdapter 表单绑定</h2>
          <DatePickerDemo />
        </section>
        <section className={styles.formSection}>
          <h2>日期范围草稿与确认式表单绑定</h2>
          <DateRangePickerDemo />
        </section>
        <section className={styles.formSection}>
          <h2>平台无关时间选择与确认式表单绑定</h2>
          <TimePickerDemo />
        </section>
        <section className={styles.formSection}>
          <h2>平台无关日历与即时表单绑定</h2>
          <CalendarDemo />
        </section>
        <section className={styles.formSection}>
          <h2>下拉刷新与键盘等价操作</h2>
          <PullToRefreshDemo />
        </section>
        <section className={styles.formSection}>
          <h2>无限列表、并发锁与手动降级</h2>
          <InfiniteListDemo />
        </section>
        <section className={styles.formSection}>
          <h2>内容轮播、原生控制与无障碍暂停</h2>
          <CarouselDemo />
        </section>
        <section className={styles.formSection}>
          <h2>全屏图片预览、缩放与画廊导航</h2>
          <ImageViewerDemo />
        </section>
        <section className={styles.formSection}>
          <h2>图片上传任务、失败重试与完整表单绑定</h2>
          <ImageUploaderDemo />
        </section>
        <section className={styles.formSection}>
          <h2>可搜索层级选择、虚拟化与确认式表单绑定</h2>
          <TreeSelectDemo />
        </section>
        <section className={styles.formSection}>
          <h2>列表滑动操作与常驻等价入口</h2>
          <SwipeActionsDemo />
        </section>
        <section className={styles.formSection}>
          <h2>页面内常驻浮动面板与原生滚动接管</h2>
          <FloatingPanelDemo />
        </section>
        <section className={styles.formSection}>
          <h2>一万条动态高度数据与可访问窗口化</h2>
          <VirtualListDemo />
        </section>
        <section className={styles.formSection}>
          <h2>数字键盘、外置值与完整表单绑定</h2>
          <NumberKeyboardDemo />
        </section>
        <section className={styles.formSection}>
          <h2>验证码分格、原生输入与完整表单绑定</h2>
          <PasscodeInputDemo />
        </section>
        <section className={styles.formSection}>
          <h2>内容水印、图片回退与误删恢复</h2>
          <WatermarkDemo />
        </section>
        <section className={styles.formSection}>
          <h2>信息行与分组列表</h2>
          <InformationDemo />
        </section>
        <section className={styles.formSection}>
          <h2>标签、徽标与媒体展示</h2>
          <DisplayDemo />
        </section>
        <section className={styles.formSection}>
          <h2>卡片与折叠内容</h2>
          <ContainerDemo />
        </section>
        <section className={styles.formSection}>
          <h2>页面导航、标签与流程状态</h2>
          <NavigationDemo />
        </section>
        <section className={styles.formSection}>
          <h2>索引列表与侧边分类导航</h2>
          <IndexedNavigationDemo />
        </section>
        <section className={styles.formSection}>
          <h2>加载、空状态与流程结果</h2>
          <FeedbackDemo />
        </section>
        <section className={styles.formSection}>
          <h2>遮罩、基础浮层、BottomSheet、ActionMenu、Popover、Dialog 与 Toast</h2>
          <ToastProvider>
            <DialogProvider>
              <ActionMenuProvider>
                <OverlayDemo />
              </ActionMenuProvider>
            </DialogProvider>
          </ToastProvider>
        </section>
      </main>
    </ConfigProvider>
  );
}
