import type { Meta, StoryObj } from "@storybook/react-vite";

import { VirtualList } from "./VirtualList";

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
