import type { Meta, StoryObj } from "@storybook/react-vite";

import { Collapse } from "./Collapse";

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
export const LongContentRTL: Story = {
  render: (args) => (
    <div dir="rtl" style={{ width: 320 }}>
      <Collapse
        {...args}
        items={[
          {
            value: "shipping",
            title: "سياسة الشحن والاستلام ذات العنوان الطويل",
            extra: "تفاصيل إضافية",
            content: "محتوى طويل يلتف داخل المساحة المتاحة دون قص أو اتجاهات مادية ثابتة."
          }
        ]}
      />
    </div>
  )
};
