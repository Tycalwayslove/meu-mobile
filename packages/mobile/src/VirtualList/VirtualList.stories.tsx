import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import { VirtualList } from "./VirtualList";
import type { VirtualListRange, VirtualListRef } from "./types";

type Order = {
  description: string;
  id: string;
  title: string;
};

const orders: Order[] = Array.from({ length: 10_000 }, (_, index) => ({
  description:
    index % 7 === 0
      ? "这是一条动态高度说明，用来验证真实内容换行后的测量与滚动锚定。"
      : `预计 ${12 + (index % 40)} 分钟送达`,
  id: `MEU-${String(index + 1).padStart(5, "0")}`,
  title: `订单 ${index + 1}`
}));

function OrderRow({ order }: { order: Order }) {
  return (
    <div
      style={{
        minHeight: 56,
        boxSizing: "border-box",
        padding: "12px 16px",
        background: "var(--meu-color-surface)",
        borderBottom: "1px solid var(--meu-color-border)"
      }}
    >
      <strong style={{ display: "block", lineHeight: "20px" }}>{order.title}</strong>
      <span style={{ color: "var(--meu-color-muted)", fontSize: 13, lineHeight: "20px" }}>
        {order.id} · {order.description}
      </span>
    </div>
  );
}

function JumpScenario() {
  const listRef = useRef<VirtualListRef>(null);
  const [range, setRange] = useState<VirtualListRange | null>(null);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <button
        type="button"
        style={{ minHeight: 44 }}
        onClick={() => {
          if (listRef.current) listRef.current.scrollToIndex(9_000, { align: "start" });
        }}
      >
        跳至第 9,001 条
      </button>
      <output aria-live="polite">
        {range ? `${range.visibleStartIndex + 1}–${range.visibleEndIndex + 1}` : "正在测量"}
      </output>
      <VirtualList
        ref={listRef}
        aria-label="可定位订单"
        estimateSize={(order) => (order.description.length > 24 ? 76 : 56)}
        getItemKey={(order) => order.id}
        height={420}
        items={orders}
        onRangeChange={setRange}
        overscan={4}
        renderItem={(order) => <OrderRow order={order} />}
      />
    </div>
  );
}

function EditableRowsScenario() {
  const editableOrders = orders.slice(0, 500);
  const [notes, setNotes] = useState<Record<string, string>>({});
  return (
    <VirtualList
      aria-label="可编辑订单备注"
      estimateSize={72}
      getItemKey={(order) => order.id}
      height={420}
      items={editableOrders}
      renderItem={(order) => (
        <label
          style={{
            alignItems: "center",
            borderBottom: "1px solid var(--meu-color-border)",
            display: "grid",
            gap: 8,
            gridTemplateColumns: "minmax(7rem, auto) minmax(0, 1fr)",
            minHeight: 72,
            padding: "8px 12px"
          }}
        >
          <span>{order.title}</span>
          <input
            aria-label={`${order.title}备注`}
            value={notes[order.id] || ""}
            onChange={(event) =>
              setNotes((current) => ({ ...current, [order.id]: event.currentTarget.value }))
            }
            placeholder="状态由上层表单保存"
            style={{ boxSizing: "border-box", minHeight: 44, minWidth: 0, width: "100%" }}
          />
        </label>
      )}
    />
  );
}

const meta = {
  title: "Collections/VirtualList",
  component: VirtualList<Order>,
  parameters: { layout: "padded" }
} satisfies Meta<typeof VirtualList<Order>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TenThousandRows: Story = {
  args: {
    "aria-label": "一万条订单",
    estimateSize: (order) => (order.description.length > 24 ? 76 : 56),
    getItemKey: (order) => order.id,
    height: 480,
    items: orders,
    overscan: 4,
    renderItem: (order) => <OrderRow order={order} />
  },
  play: async ({ canvasElement }) => {
    const list = canvasElement.querySelector<HTMLElement>('[role="list"][aria-label="一万条订单"]');
    if (!list) throw new window.Error("Expected named VirtualList");
    const rows = list.querySelectorAll<HTMLElement>('[role="listitem"]');
    const renderedCount = Number(list.getAttribute("data-rendered-count"));
    if (
      !Number.isInteger(renderedCount) ||
      renderedCount < 1 ||
      renderedCount >= orders.length ||
      rows.length !== renderedCount
    ) {
      throw new window.Error("VirtualList did not render a bounded visible window");
    }
    const first = rows.item(0);
    if (
      first.getAttribute("aria-posinset") !== "1" ||
      first.getAttribute("aria-setsize") !== String(orders.length) ||
      first.getAttribute("data-meu-virtual-index") !== "0" ||
      !(first.textContent || "").includes("订单 1")
    ) {
      throw new window.Error("VirtualList did not expose full-collection row semantics");
    }
    list.focus();
    await Promise.resolve();
    if (canvasElement.ownerDocument.activeElement !== list) {
      throw new window.Error("VirtualList did not accept keyboard focus");
    }
  }
};

export const InitialMiddle: Story = {
  args: {
    "aria-label": "从中段开始的订单",
    estimateSize: (order) => (order.description.length > 24 ? 76 : 56),
    getItemKey: (order) => order.id,
    height: 480,
    initialOffset: 56 * 4_500,
    items: orders,
    overscan: 4,
    renderItem: (order) => <OrderRow order={order} />
  }
};

export const ImperativeJump: Story = {
  args: {
    "aria-label": "可定位订单",
    estimateSize: 56,
    getItemKey: (order) => order.id,
    height: 420,
    items: orders,
    renderItem: (order) => <OrderRow order={order} />
  },
  render: () => <JumpScenario />,
  play: async ({ canvasElement }) => {
    const button = Array.from(canvasElement.querySelectorAll<HTMLButtonElement>("button")).find(
      (candidate) => candidate.textContent === "跳至第 9,001 条"
    );
    if (!button) throw new window.Error("Expected imperative jump control");
    button.click();
    let target: Element | null = null;
    for (let attempt = 0; attempt < 30 && !target; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 16));
      target = canvasElement.querySelector('[data-meu-virtual-index="9000"]');
    }
    if (!target || !(target.textContent || "").includes("订单 9001")) {
      throw new window.Error("VirtualList did not complete the imperative far jump");
    }
    const list = canvasElement.querySelector<HTMLElement>('[data-meu-component="virtual-list"]');
    if (!list || Number(list.getAttribute("data-rendered-count")) >= 30) {
      throw new window.Error("VirtualList exceeded the bounded window after a far jump");
    }
  }
};

export const EditableRows: Story = {
  args: {
    "aria-label": "可编辑订单备注",
    estimateSize: 72,
    getItemKey: (order) => order.id,
    height: 420,
    items: orders.slice(0, 500),
    renderItem: (order) => <OrderRow order={order} />
  },
  render: () => <EditableRowsScenario />
};

export const RtlLongLocalizedContent: Story = {
  args: {
    "aria-label": "طلبات طويلة باللغة العربية",
    estimateSize: 88,
    getItemKey: (order) => order.id,
    height: 420,
    items: orders.slice(0, 240).map((order, index) => ({
      ...order,
      description:
        index % 3 === 0
          ? "تفاصيل طلب طويلة قابلة للالتفاف لاختبار اتجاه الكتابة والتكبير دون قص المحتوى أو توسيع الصفحة أفقياً."
          : "موعد التسليم المتوقع خلال عشرين دقيقة"
    })),
    overscan: 5,
    renderItem: (order) => <OrderRow order={order} />
  },
  render: (args) => (
    <div dir="rtl" lang="ar" style={{ fontSize: "1.25rem", maxWidth: 390 }}>
      <VirtualList {...args} />
    </div>
  )
};

export const Empty: Story = {
  args: {
    "aria-label": "空订单列表",
    emptyContent: "当前筛选条件下没有订单",
    estimateSize: 56,
    getItemKey: (order) => order.id,
    height: 240,
    items: [],
    renderItem: (order) => <OrderRow order={order} />
  }
};
