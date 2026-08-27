import { ConfigProvider } from "@meu/mobile";

import { AdvancedEntryDemo } from "./AdvancedEntryDemo";
import { ContainerDemo } from "./ContainerDemo";
import { DisplayDemo } from "./DisplayDemo";
import { FormDemo } from "./FormDemo";
import { InformationDemo } from "./InformationDemo";
import { NavigationDemo } from "./NavigationDemo";
import { SelectionDemo } from "./SelectionDemo";
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
      </main>
    </ConfigProvider>
  );
}
