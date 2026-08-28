import Link from "next/link";

import { componentCategories, getComponentsByCategory } from "../_data/components";

export function ComponentSidebar({ currentSlug }: { currentSlug?: string }) {
  return (
    <aside className="component-sidebar" aria-label="组件目录">
      <Link className="component-sidebar__all" href="/components">
        全部组件
        <span aria-hidden="true">↗</span>
      </Link>
      {componentCategories.map((category) => (
        <section key={category.id}>
          <h2>{category.label}</h2>
          <nav aria-label={category.label}>
            {getComponentsByCategory(category.id).map((component) => (
              <Link
                href={`/components/${component.slug}`}
                aria-current={component.slug === currentSlug ? "page" : undefined}
                key={component.slug}
              >
                {component.name}
              </Link>
            ))}
          </nav>
        </section>
      ))}
    </aside>
  );
}
