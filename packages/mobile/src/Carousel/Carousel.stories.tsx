import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { ConfigProvider } from "../ConfigProvider";
import { waitForStory } from "../storyTestUtils";
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
        background: "var(--meu-color-subtle)",
        border: "1px solid var(--meu-color-border)",
        borderRadius: "var(--meu-radius-surface)"
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em" }}>{eyebrow}</span>
      <strong style={{ marginTop: 8, fontSize: 32, lineHeight: 1.1 }}>{title}</strong>
      <span style={{ marginTop: 8, color: "var(--meu-color-muted)" }}>{detail}</span>
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

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const carousel = canvasElement.querySelector<HTMLElement>('[data-meu-component="carousel"]');
    const next = canvasElement.querySelector<HTMLButtonElement>('button[aria-label="下一张"]');
    if (!carousel || !next) throw new window.Error("Expected Carousel controls");
    if (carousel.getAttribute("data-index") !== "0") {
      throw new window.Error("Expected Carousel to start on the first slide");
    }

    next.click();
    await waitForStory(
      () => carousel.getAttribute("data-index") === "1",
      "Expected Carousel to advance to the second slide"
    );
    const activeSlide = carousel.querySelector<HTMLElement>(
      '[data-meu-carousel-slide][data-active="true"]'
    );
    if (
      !activeSlide ||
      activeSlide.getAttribute("aria-label") !== "城市散步系列" ||
      activeSlide.hasAttribute("aria-hidden")
    ) {
      throw new window.Error("Expected Carousel to expose the new active slide");
    }
  }
};

export const LoopingAutoplay: Story = {
  args: { autoplay: true, autoplayInterval: 3000, loop: true }
};

export const AccessibleAutoplayPause: Story = {
  args: { autoplay: true, autoplayInterval: 3000, loop: true },
  play: async ({ canvasElement }) => {
    const pause = canvasElement.querySelector<HTMLButtonElement>(
      '[data-meu-carousel-rotation][aria-label="暂停轮播"]'
    );
    const status = canvasElement.querySelector<HTMLElement>("[data-meu-carousel-status]");
    if (!pause || !status) throw new window.Error("Expected Carousel pause control and status");

    pause.focus();
    await waitForStory(
      () => pause.getAttribute("aria-label") === "暂停轮播",
      "Focus changed the pending pause action"
    );
    pause.click();
    await waitForStory(
      () => pause.getAttribute("aria-label") === "播放轮播",
      "Expected Carousel to remain paused after activation"
    );
    if (status.getAttribute("aria-live") !== "polite") {
      throw new window.Error("Paused Carousel status was not announced politely");
    }
  }
};

export const Controlled: Story = {
  render: () => <ControlledPreview />
};

export const Disabled: Story = {
  args: { defaultIndex: 1, disabled: true }
};

export const RtlAndLongContent: Story = {
  render: () => (
    <ConfigProvider dir="rtl">
      <div style={{ maxWidth: 640 }}>
        <Carousel
          aria-label="المحتوى المميز"
          items={[
            {
              key: "long",
              ariaLabel: "مجموعة ذات عنوان طويل",
              content: (
                <PreviewSlide
                  eyebrow="01 / RTL"
                  title="عنوان طويل يلتف عند تكبير النص"
                  detail="نص وصفي طويل للتحقق من اتجاه الكتابة والتفاف المحتوى دون فقد أزرار التنقل."
                />
              )
            },
            { key: "member", ariaLabel: "مزايا الأعضاء", content: previewItems[2]!.content }
          ]}
        />
      </div>
    </ConfigProvider>
  ),
  play: ({ canvasElement }) => {
    const carousel = canvasElement.querySelector<HTMLElement>('[data-meu-component="carousel"]');
    if (!carousel) throw new window.Error("Expected RTL Carousel");
    if (getComputedStyle(carousel).direction !== "rtl") {
      throw new window.Error("Carousel did not inherit RTL direction");
    }
    if (carousel.scrollWidth > carousel.clientWidth + 1) {
      throw new window.Error("Carousel overflowed horizontally with long RTL content");
    }

    const controls = Array.from(carousel.querySelectorAll<HTMLButtonElement>("button"));
    if (controls.length !== 2) throw new window.Error("Expected previous and next controls");
    for (const control of controls) {
      const rect = control.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        throw new window.Error("Carousel navigation control is below the 44px touch target");
      }
    }
    const [firstControl, secondControl] = controls;
    if (firstControl && secondControl) {
      const firstRect = firstControl.getBoundingClientRect();
      const secondRect = secondControl.getBoundingClientRect();
      const overlaps =
        firstRect.left < secondRect.right &&
        firstRect.right > secondRect.left &&
        firstRect.top < secondRect.bottom &&
        firstRect.bottom > secondRect.top;
      if (overlaps) throw new window.Error("Carousel navigation controls overlap");
    }

    const activeSlide = carousel.querySelector<HTMLElement>(
      '[data-meu-carousel-slide][data-active="true"]'
    );
    if (!activeSlide || activeSlide.scrollWidth > activeSlide.clientWidth + 1) {
      throw new window.Error("Carousel active RTL slide did not wrap within its viewport");
    }
  }
};
