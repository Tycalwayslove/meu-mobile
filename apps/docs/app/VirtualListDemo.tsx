"use client";

import { Button, VirtualList } from "@meu/mobile";
import type { VirtualListRange, VirtualListRef } from "@meu/mobile";
import { useRef, useState } from "react";

type DemoOrder = {
  description: string;
  id: string;
};

const orders: DemoOrder[] = Array.from({ length: 10_000 }, (_, index) => ({
  description:
    index % 9 === 0
      ? "动态高度订单：配送说明可能换行，挂载后会使用真实 DOM 高度校正。"
      : `预计 ${15 + (index % 35)} 分钟送达`,
  id: `MEU-${String(index + 1).padStart(5, "0")}`
}));

export function VirtualListDemo() {
  const listRef = useRef<VirtualListRef>(null);
  const [range, setRange] = useState<VirtualListRange | null>(null);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Button
          size="small"
          variant="outline"
          onClick={() => {
            const list = listRef.current;
            if (list) list.scrollToIndex(0);
          }}
        >
          回到顶部
        </Button>
        <Button
          size="small"
          variant="outline"
          onClick={() => {
            const list = listRef.current;
            if (list) list.scrollToIndex(4_999, { align: "center" });
          }}
        >
          跳到中段
        </Button>
        <Button
          size="small"
          variant="outline"
          onClick={() => {
            const list = listRef.current;
            if (list) list.scrollToIndex(9_999, { align: "end" });
          }}
        >
          跳到末尾
        </Button>
      </div>
      <VirtualList
        ref={listRef}
        aria-label="一万条示例订单"
        estimateSize={(order) => (order.description.length > 28 ? 76 : 56)}
        getItemKey={(order) => order.id}
        height={420}
        items={orders}
        onRangeChange={setRange}
        overscan={4}
        renderItem={(order, index) => (
          <div
            style={{
              minHeight: index % 9 === 0 ? 76 : 56,
              boxSizing: "border-box",
              padding: "10px 16px",
              background: "var(--meu-color-surface)",
              borderBottom: "1px solid var(--meu-color-border)"
            }}
          >
            <strong style={{ display: "block" }}>订单 {order.id}</strong>
            <span style={{ color: "var(--meu-color-muted)", fontSize: 13 }}>
              {order.description}
            </span>
          </div>
        )}
      />
      <output aria-live="polite" style={{ color: "var(--meu-color-muted)", fontSize: 13 }}>
        {range
          ? `当前可见：${range.visibleStartIndex + 1}–${range.visibleEndIndex + 1} / 10,000`
          : "正在计算可见范围"}
      </output>
    </div>
  );
}
