import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Card } from "../Card";
import { ThemeProvider } from "../ConfigProvider";
import { waitForStory } from "../storyTestUtils";
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
  },
  play: async ({ canvasElement }) => {
    const image = canvasElement.querySelector("svg image");
    if (!image) throw new window.Error("Expected Watermark SVG image");
    image.dispatchEvent(new window.Event("error", { bubbles: true }));
    await waitForStory(() => {
      const content = canvasElement.textContent;
      return Boolean(
        !canvasElement.querySelector("svg image") && content && content.includes("Meu fallback")
      );
    }, "Watermark did not expose its text fallback after an image error");
  }
};

export const HostBoundary: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <Watermark content="Host only" style={{ width: 240 }}>
        <Card style={{ minHeight: 160, boxShadow: "0 0 0 12px rgba(23, 107, 91, 0.12)" }}>
          wrapper 与 SVG viewport 双重裁界，业务内容和水印都保持在 host 内。
        </Card>
      </Watermark>
    </div>
  )
};

function DynamicContentPreview() {
  const [revision, setRevision] = useState(1);
  return (
    <Watermark content="Meu dynamic">
      <Card style={{ minHeight: 180 }}>
        <p>业务内容版本：{revision}</p>
        <button type="button" onClick={() => setRevision((value) => value + 1)}>
          更新业务内容
        </button>
      </Card>
    </Watermark>
  );
}

export const DynamicContent: Story = {
  render: () => <DynamicContentPreview />,
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector<HTMLButtonElement>("button");
    if (button) button.click();
    await Promise.resolve();
    const content = canvasElement.textContent;
    if (!content || !content.includes("业务内容版本：2")) {
      throw new window.Error("Watermark blocked a legitimate child update");
    }
  }
};

export const LightAndDark: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      {(["light", "dark"] as const).map((theme) => (
        <ThemeProvider key={theme} theme={theme} style={{ padding: 16 }}>
          <Watermark content={`Meu ${theme}`}>
            <Card style={{ minHeight: 180 }}>主题预览</Card>
          </Watermark>
        </ThemeProvider>
      ))}
    </div>
  )
};
