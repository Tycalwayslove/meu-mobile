import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Carousel } from "./Carousel";
import type { CarouselItem } from "./types";

const previewItems: readonly CarouselItem[] = [
  {
    key: "quiet-morning",
    ariaLabel: "安静早晨系列",
    content: (
      <PreviewSlide eyebrow="01 / NEW" title="安静早晨" detail="轻柔材质，适合慢下来的周末。" />
    )
  },
  {
    key: "city-walk",
    ariaLabel: "城市散步系列",
    content: (
      <PreviewSlide eyebrow="02 / EDIT" title="城市散步" detail="为日常移动保留轻盈和秩序。" />
    )
  },
  {
    key: "member",
    ariaLabel: "会员礼遇",
    content: <PreviewSlide eyebrow="03 / MEMBER" title="会员礼遇" detail="本周积分兑换现已开放。" />
  }
];

function PreviewSlide({
  detail,
  eyebrow,
  title
}: {
  detail: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <article
      style={{
        display: "grid",
        minHeight: 260,
        padding: "32px 72px",
        alignContent: "end",
        color: "var(--meu-color-ink)",
        background: "var(--meu-color-surface-muted)",
        border: "1px solid var(--meu-color-border)",
        borderRadius: "var(--meu-radius-large)"
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em" }}>{eyebrow}</span>
      <strong style={{ marginTop: 8, fontSize: 32, lineHeight: 1.1 }}>{title}</strong>
      <span style={{ marginTop: 8, color: "var(--meu-color-ink-muted)" }}>{detail}</span>
    </article>
  );
}

function ControlledPreview() {
  const [index, setIndex] = useState(0);
  return (
    <div style={{ maxWidth: 640 }}>
      <Carousel index={index} items={previewItems} loop onIndexChange={setIndex} />
      <p aria-live="polite" style={{ marginBottom: 0 }}>
        当前内容：{previewItems[index]!.ariaLabel}
      </p>
    </div>
  );
}

const meta = {
  title: "Gesture/Carousel",
  component: Carousel,
  parameters: { layout: "padded" },
  args: { items: previewItems },
  argTypes: {
    indicator: { control: false },
    items: { control: false },
    onIndexChange: { control: false }
  },
  render: (args) => (
    <div style={{ maxWidth: 640 }}>
      <Carousel {...args} />
    </div>
  )
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LoopingAutoplay: Story = {
  args: { autoplay: true, autoplayInterval: 3000, loop: true }
};

export const Controlled: Story = {
  render: () => <ControlledPreview />
};

export const Disabled: Story = {
  args: { defaultIndex: 1, disabled: true }
};
