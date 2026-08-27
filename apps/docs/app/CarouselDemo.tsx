"use client";

import { Carousel } from "@meu/mobile";
import { useState } from "react";

const items = [
  { key: "new", ariaLabel: "本周新品", eyebrow: "01 / NEW", title: "本周新品" },
  { key: "edit", ariaLabel: "编辑精选", eyebrow: "02 / EDIT", title: "编辑精选" },
  { key: "member", ariaLabel: "会员礼遇", eyebrow: "03 / MEMBER", title: "会员礼遇" }
] as const;

export function CarouselDemo() {
  const [index, setIndex] = useState(0);
  return (
    <div style={{ maxWidth: 680 }}>
      <Carousel
        index={index}
        items={items.map((item) => ({
          key: item.key,
          ariaLabel: item.ariaLabel,
          content: (
            <article
              style={{
                display: "grid",
                minHeight: 240,
                padding: "32px 72px",
                alignContent: "end",
                background: "var(--meu-color-surface-muted)",
                border: "1px solid var(--meu-color-border)",
                borderRadius: "var(--meu-radius-large)"
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em" }}>
                {item.eyebrow}
              </span>
              <strong style={{ marginTop: 8, fontSize: 30 }}>{item.title}</strong>
              <span style={{ marginTop: 6, color: "var(--meu-color-ink-muted)" }}>
                原生控制、拖拽和只读页码指示共同工作。
              </span>
            </article>
          )
        }))}
        loop
        onIndexChange={setIndex}
      />
      <p aria-live="polite">当前内容：{items[index]!.ariaLabel}</p>
    </div>
  );
}
