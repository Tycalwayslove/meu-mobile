import type { Meta, StoryObj } from "@storybook/react-vite";

import { Card } from "../Card";
import { Watermark } from "./Watermark";

const meuMark =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 40'%3E%3Ctext x='48' y='27' text-anchor='middle' font-family='sans-serif' font-size='22' font-weight='700' fill='%23176B5B'%3EMEU%3C/text%3E%3C/svg%3E";

const meta = {
  title: "Display/Watermark",
  component: Watermark,
  parameters: { layout: "padded" },
  args: {
    content: "Meu Mobile",
    children: (
      <Card style={{ minHeight: 280 }}>
        <h3 style={{ marginTop: 0 }}>订单凭证</h3>
        <p>订单号：MEU-20260828-001</p>
        <p>水印只用于版权提示与泄露追踪，不应当作防截图或访问控制。</p>
      </Card>
    )
  }
} satisfies Meta<typeof Watermark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {};

export const Multiline: Story = {
  args: { content: ["Meu Mobile", "内部资料"], rotate: -18 }
};

export const Compact: Story = {
  args: { content: "MEU-20260828", gap: [48, 48], height: 40, width: 104 }
};

export const ImageWithFallback: Story = {
  args: {
    content: "Meu fallback",
    image: meuMark,
    opacity: 0.12,
    width: 56,
    height: 56
  }
};
