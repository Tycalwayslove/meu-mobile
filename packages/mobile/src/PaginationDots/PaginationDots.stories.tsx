import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { PaginationDots } from "./PaginationDots";

const meta = {
  title: "Navigation/PaginationDots",
  component: PaginationDots,
  args: { activeIndex: 1, count: 5 }
} satisfies Meta<typeof PaginationDots>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dots: Story = {};
export const Lines: Story = { args: { variant: "line" } };
export const Vertical: Story = { args: { direction: "vertical", variant: "line" } };
export const Compressed: Story = { args: { activeIndex: 24, count: 50 } };

function InteractiveDemo() {
  const [activeIndex, setActiveIndex] = useState(2);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <PaginationDots
        aria-label="商品分页"
        activeIndex={activeIndex}
        count={12}
        interactive
        onChange={(index) => setActiveIndex(index)}
      />
      <output aria-live="polite">当前第 {activeIndex + 1} 页</output>
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
  play: async ({ canvasElement }) => {
    const target = canvasElement.querySelector<HTMLButtonElement>('button[aria-label*="第 4 页"]');
    if (!target) throw new window.Error("Expected an interactive page button");
    target.click();
    await Promise.resolve();
    const output = canvasElement.querySelector("output");
    if (!output || output.textContent !== "当前第 4 页" || target.tabIndex !== 0) {
      throw new window.Error("Expected controlled pagination to publish and render page 4");
    }
  }
};
export const Disabled: Story = {
  args: { activeIndex: 2, count: 12, interactive: true, disabled: true }
};
export const RTL: Story = {
  render: () => (
    <div dir="rtl" style={{ display: "grid", justifyItems: "start", gap: 8 }}>
      <span id="rtl-pagination-title">RTL 商品分页</span>
      <PaginationDots
        aria-labelledby="rtl-pagination-title"
        activeIndex={2}
        count={10}
        interactive
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const current = canvasElement.querySelector<HTMLButtonElement>('[data-page-index="2"]');
    const nextVisualLeft = canvasElement.querySelector<HTMLButtonElement>('[data-page-index="3"]');
    if (!current || !nextVisualLeft) throw new window.Error("Expected RTL page buttons");
    current.focus();
    current.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "ArrowLeft" }));
    await Promise.resolve();
    if (document.activeElement !== nextVisualLeft) {
      throw new window.Error("Expected ArrowLeft to follow the inherited RTL direction");
    }
  }
};
