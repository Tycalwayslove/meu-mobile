"use client";

import { MeuIconSearch } from "@meu/icons-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { componentCategories, componentDocs } from "../_data/components";
import type { ComponentCategoryId } from "../_data/components";

export function ComponentCatalog({
  initialCategory = "all"
}: {
  initialCategory?: ComponentCategoryId | "all";
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ComponentCategoryId | "all">(initialCategory);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target;
      if (
        event.key !== "/" ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }
      event.preventDefault();
      if (searchRef.current) searchRef.current.focus();
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visible = useMemo(
    () =>
      componentDocs.filter((component) => {
        if (category !== "all" && component.category !== category) return false;
        if (!normalizedQuery) return true;
        return `${component.name} ${component.slug} ${component.description} ${component.packageName}`
          .toLocaleLowerCase()
          .includes(normalizedQuery);
      }),
    [category, normalizedQuery]
  );

  return (
    <div className="catalog" id="catalog">
      <div className="catalog__toolbar">
        <label className="catalog__search">
          <MeuIconSearch size={18} aria-hidden="true" />
          <span className="visually-hidden">搜索组件</span>
          <input
            ref={searchRef}
            type="search"
            value={query}
            placeholder="搜索组件、能力或包名"
            onChange={(event) => setQuery(event.target.value)}
          />
          <kbd>/</kbd>
        </label>
        <div className="catalog__filters" aria-label="组件分类">
          <button
            type="button"
            aria-pressed={category === "all"}
            onClick={() => setCategory("all")}
          >
            全部
          </button>
          {componentCategories.map((item) => (
            <button
              type="button"
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
              key={item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <p className="catalog__count" aria-live="polite">
        {visible.length} / {componentDocs.length} 个组件
      </p>
      {visible.length > 0 ? (
        <div className="catalog__grid">
          {visible.map((component, index) => (
            <Link
              className="component-card"
              href={`/components/${component.slug}`}
              key={component.slug}
            >
              <span className="component-card__index">{String(index + 1).padStart(2, "0")}</span>
              <span className="component-card__content">
                <strong>{component.name}</strong>
                <span>{component.description}</span>
              </span>
              <span className="component-card__meta">
                {component.priority}
                <span aria-hidden="true">↗</span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="catalog__empty">
          <strong>没有匹配的组件</strong>
          <p>换一个名称，或清除当前分类筛选。</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("all");
              if (searchRef.current) searchRef.current.focus();
            }}
          >
            清除筛选
          </button>
        </div>
      )}
    </div>
  );
}
