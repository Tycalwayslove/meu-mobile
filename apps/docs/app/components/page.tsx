import type { Metadata } from "next";

import { ComponentCatalog } from "../_components/ComponentCatalog";
import { componentCategories } from "../_data/components";
import type { ComponentCategoryId } from "../_data/components";

export const metadata: Metadata = {
  title: "组件",
  description: "浏览 Meu Mobile 的 React 移动端组件、交互契约与真实集成示例。"
};

export default async function ComponentsPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const matched = componentCategories.find((category) => category.id === params.category);
  const initialCategory: ComponentCategoryId | "all" = matched ? matched.id : "all";

  return (
    <main className="docs-page">
      <header>
        <p className="docs-eyebrow">Component library</p>
        <h1 className="docs-title">组件目录</h1>
        <p className="docs-intro">
          每个条目同时描述视觉状态、交互所有权、表单绑定和平台边界。搜索支持组件名、能力描述与工作区包名。
        </p>
      </header>
      <ComponentCatalog initialCategory={initialCategory} />
    </main>
  );
}
