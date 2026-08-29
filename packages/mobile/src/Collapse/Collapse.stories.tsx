import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../Button";
import { ConfigProvider } from "../ConfigProvider";
import { Collapse } from "./Collapse";
import type { CollapseItem } from "./types";

const items = [
  { value: "delivery", title: "配送范围", content: "支持中国大陆大部分城市配送。" },
  { value: "returns", title: "退换规则", content: "签收后 7 天内可申请退换。" },
  { value: "invoice", title: "发票服务", content: "暂不支持纸质发票。", disabled: true }
] as const;

const meta = {
  title: "Information/Collapse",
  component: Collapse,
  args: { items, defaultValue: ["delivery"], variant: "card" }
} satisfies Meta<typeof Collapse>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledDynamicExample() {
  const [value, setValue] = useState<readonly string[]>(["delivery"]);
  const [visibleItems, setVisibleItems] = useState<readonly CollapseItem[]>(items);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Collapse
        accordion
        items={visibleItems}
        value={value}
        onChange={(nextValue) => setValue(nextValue)}
      />
      <Button
        variant="outline"
        onClick={() =>
          setVisibleItems((current) =>
            current.some((item) => item.value === "returns")
              ? current.filter((item) => item.value !== "returns")
              : items
          )
        }
      >
        切换退换规则
      </Button>
    </div>
  );
}

export const Multiple: Story = {};
export const Accordion: Story = {
  args: { accordion: true },
  play: async ({ canvasElement }) => {
    const buttons = canvasElement.querySelectorAll<HTMLButtonElement>("button");
    const second = buttons.item(1);
    second.click();
    await Promise.resolve();
    if (buttons.item(0).getAttribute("aria-expanded") !== "false") {
      throw new window.Error("Accordion did not collapse the previous item");
    }
    if (second.getAttribute("aria-expanded") !== "true") {
      throw new window.Error("Accordion did not expand the requested item");
    }
  }
};
export const Plain: Story = { args: { variant: "plain" } };
export const KeyboardNavigation: Story = {
  args: { defaultValue: [], headingLevel: 3 },
  play: async ({ canvasElement }) => {
    const buttons = canvasElement.querySelectorAll<HTMLButtonElement>(
      "[data-meu-collapse-trigger]"
    );
    const first = buttons.item(0);
    const second = buttons.item(1);
    first.focus();
    first.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "ArrowDown" }));
    await Promise.resolve();
    if (canvasElement.ownerDocument.activeElement !== second) {
      throw new window.Error("ArrowDown did not focus the next enabled disclosure");
    }
    if (first.getAttribute("aria-expanded") !== "false") {
      throw new window.Error("Header focus navigation changed disclosure state");
    }
  }
};
export const ControlledDynamic: Story = {
  render: () => <ControlledDynamicExample />
};
export const Nested: Story = {
  args: {
    defaultValue: ["delivery"],
    items: [
      {
        value: "delivery",
        title: "配送方式",
        content: (
          <Collapse
            headingLevel={4}
            aria-label="配送方式详情"
            items={[
              { value: "express", title: "快递配送", content: "预计 2 至 4 个工作日送达。" },
              { value: "pickup", title: "到店自取", content: "商品备齐后发送取货通知。" }
            ]}
          />
        )
      },
      items[1]
    ]
  }
};
export const LongContentRTL: Story = {
  render: (args) => (
    <ConfigProvider dir="rtl">
      <div style={{ width: 320, maxWidth: "100%" }}>
        <Collapse
          {...args}
          defaultValue={["shipping"]}
          items={[
            {
              value: "shipping",
              title: "سياسة الشحن والاستلام ذات العنوان الطويل الذي يلتف على أكثر من سطر",
              extra: "تفاصيل إضافية طويلة",
              content:
                "محتوى طويل يلتف داخل المساحة المتاحة دون قص أو اتجاهات مادية ثابتة، مع دعم تكبير النص والرموز المختلفة مثل １２３ ومرحبا."
            }
          ]}
        />
      </div>
    </ConfigProvider>
  )
};
export const ReducedMotion: Story = {
  render: (args) => (
    <ConfigProvider motion="reduced">
      <Collapse {...args} />
    </ConfigProvider>
  )
};
