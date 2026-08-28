import { Badge, Button, Cell, List, Progress, Tag } from "@meu/mobile";
import Link from "next/link";

import { componentCategories, componentDocs, getComponentsByCategory } from "./_data/components";
import styles from "./page.module.css";

const metrics = [
  { label: "文档组件", value: String(componentDocs.length).padStart(2, "0") },
  { label: "表单适配", value: "完整" },
  { label: "主题模式", value: "03" }
] as const;

export default function HomePage() {
  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>React components for mobile commerce</p>
          <h1>
            安静、可靠的
            <br />
            移动端组件。
          </h1>
          <p className={styles.lead}>
            面向 Next.js H5 的生产级组件系统。设计 Token、表单绑定、无障碍与旧 WebView
            兼容从第一天起就是同一套契约。
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryLink} href="/getting-started">
              开始使用 <span aria-hidden="true">→</span>
            </Link>
            <Link className={styles.secondaryLink} href="/components">
              浏览组件
            </Link>
          </div>
          <dl className={styles.metrics}>
            {metrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>{metric.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={styles.heroVisual} aria-label="Meu Mobile 组件预览">
          <div className={styles.phone}>
            <div className={styles.phoneStatus} aria-hidden="true">
              <span>9:41</span>
              <span>● ● ▰</span>
            </div>
            <div className={styles.phoneHeader}>
              <span>今日订单</span>
              <Badge content={3}>
                <span className={styles.avatar}>M</span>
              </Badge>
            </div>
            <div className={styles.phoneBody}>
              <div className={styles.orderSummary}>
                <span>待处理金额</span>
                <strong>¥ 12,680</strong>
                <Progress value={72} label="今日目标" showValue />
              </div>
              <List mode="card" header="最新动态">
                <Cell title="新订单 #0828" description="2 分钟前" extra="¥ 268" />
                <Cell
                  title="库存提醒"
                  description="城市随行杯"
                  extra={<Tag tone="warning">12 件</Tag>}
                />
                <Cell
                  title="资料审核"
                  description="品牌信息已通过"
                  extra={<Tag tone="success">完成</Tag>}
                />
              </List>
              <Button block>处理今日订单</Button>
            </div>
          </div>
          <span className={styles.visualNote}>真实组件 · Light / Dark · SSR</span>
        </div>
      </section>

      <section className={styles.principles} aria-labelledby="principles-title">
        <div className={styles.sectionLead}>
          <p>System principles</p>
          <h2 id="principles-title">把隐性约定，变成可验证的产品能力。</h2>
        </div>
        <div className={styles.principleGrid}>
          <article>
            <span>01</span>
            <h3>一套视觉事实源</h3>
            <p>Figma 变量与代码 Token 对齐，所有颜色、空间、圆角和动效均可追踪。</p>
          </article>
          <article>
            <span>02</span>
            <h3>完整表单链路</h3>
            <p>组件原生支持受控与非受控，并提供 React Hook Form、Zod 与错误聚焦机制。</p>
          </article>
          <article>
            <span>03</span>
            <h3>真实移动边界</h3>
            <p>围绕触摸、键盘、安全区、SSR 和旧 Android WebView 设计，而不是桌面组件缩小版。</p>
          </article>
        </div>
      </section>

      <section className={styles.catalogPreview} aria-labelledby="catalog-title">
        <div className={styles.catalogHeader}>
          <div>
            <p>Component index</p>
            <h2 id="catalog-title">从基础原语到复杂业务输入。</h2>
          </div>
          <Link href="/components">查看全部 {componentDocs.length} 个组件 →</Link>
        </div>
        <div className={styles.categoryGrid}>
          {componentCategories.map((category) => {
            const count = getComponentsByCategory(category.id).length;
            return (
              <Link href={`/components?category=${category.id}`} key={category.id}>
                <span>{category.index}</span>
                <h3>{category.label}</h3>
                <p>{category.description}</p>
                <small>{count} components</small>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.workflow}>
        <p>Design → Contract → Code → Proof</p>
        <h2>每个组件都经过同一条可审计链路。</h2>
        <ol>
          <li>
            <strong>Figma</strong>
            <span>变体、Token 与交互说明</span>
          </li>
          <li>
            <strong>TypeScript</strong>
            <span>稳定 API 与平台边界</span>
          </li>
          <li>
            <strong>Storybook</strong>
            <span>独立状态与视觉回归</span>
          </li>
          <li>
            <strong>Next H5</strong>
            <span>SSR、主题与表单集成</span>
          </li>
        </ol>
      </section>

      <section className={styles.cta}>
        <p>Meu Mobile / private workspace</p>
        <h2>先在真实产品里建立信任，再决定何时公开发布。</h2>
        <div>
          <Link className={styles.primaryLink} href="/getting-started">
            查看接入方式
          </Link>
          <Link className={styles.secondaryLink} href="/lab">
            打开组件实验室
          </Link>
        </div>
      </section>
    </main>
  );
}
