import type { Meta, StoryObj } from "@storybook/react-vite";

import { ConfigProvider, ThemeProvider } from "../ConfigProvider";
import { waitForStory } from "../storyTestUtils";
import { Image } from "./Image";

const landscape =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23dce8d5'/%3E%3Cpath d='M0 350 190 170l130 120 130-150 350 310H0Z' fill='%2367845d'/%3E%3Ccircle cx='650' cy='105' r='46' fill='%23f3c96b'/%3E%3C/svg%3E";

const meta = {
  title: "Information/Image",
  component: Image,
  args: {
    alt: "山谷中的绿色植物",
    width: 280,
    height: 160,
    radius: "surface",
    src: landscape
  }
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {};
export const PlaceholderToLoaded: Story = {
  args: { placeholder: "图片加载中…" },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>('[data-meu-component="image"]');
    const image = canvasElement.querySelector("img");
    if (!root || !image) throw new window.Error("Expected Image loading markup");
    if (root.getAttribute("data-state") === "loading") {
      image.dispatchEvent(new window.Event("load", { bubbles: true }));
    }
    await waitForStory(
      () => root.getAttribute("data-state") === "loaded",
      "Image did not enter loaded state"
    );
  }
};
export const Fallback: Story = {
  args: { src: "/missing-image.jpg", alt: "图片加载失败", fallback: "暂时无法显示图片" },
  play: async ({ canvasElement }) => {
    const image = canvasElement.querySelector("img");
    if (!image) throw new window.Error("Expected Image img element");
    image.dispatchEvent(new window.Event("error", { bubbles: true }));
    await waitForStory(() => {
      const root = canvasElement.querySelector<HTMLElement>('[data-meu-component="image"]');
      const content = canvasElement.textContent;
      return Boolean(
        root &&
        root.getAttribute("data-state") === "error" &&
        content &&
        content.includes("暂时无法显示图片")
      );
    }, "Image did not expose its fallback after an error");
  }
};
export const Lazy: Story = { args: { loading: "lazy" } };
export const FallbackSource: Story = {
  args: {
    src: "/missing-primary-image.jpg",
    fallbackSrc: landscape,
    alt: "使用备用来源的山谷插画",
    placeholder: "正在切换备用来源…"
  },
  play: async ({ canvasElement }) => {
    const primary = canvasElement.querySelector("img");
    if (!primary) throw new window.Error("Expected primary Image element");
    const initialRoot = canvasElement.querySelector<HTMLElement>('[data-meu-component="image"]');
    if (initialRoot && initialRoot.getAttribute("data-source") === "primary") {
      primary.dispatchEvent(new window.Event("error", { bubbles: true }));
    }
    await waitForStory(() => {
      const root = canvasElement.querySelector<HTMLElement>('[data-meu-component="image"]');
      return Boolean(root && root.getAttribute("data-source") === "fallback");
    }, "Image did not switch to fallbackSrc");
    const fallback = canvasElement.querySelector("img");
    if (!fallback) throw new window.Error("Expected fallback Image element");
    fallback.dispatchEvent(new window.Event("load", { bubbles: true }));
    await waitForStory(() => {
      const root = canvasElement.querySelector<HTMLElement>('[data-meu-component="image"]');
      return Boolean(root && root.getAttribute("data-state") === "loaded");
    }, "Fallback source did not load");
  }
};
export const ResponsiveCrop: Story = {
  render: () => (
    <div style={{ width: "min(100%, 420px)" }}>
      <Image
        src={landscape}
        srcSet={`${landscape} 480w, ${landscape} 960w`}
        sizes="(max-width: 480px) 100vw, 420px"
        alt="响应式裁切的山谷插画"
        width="100%"
        aspectRatio="4 / 3"
        fit="cover"
        position="70% center"
        loading="lazy"
        radius="surface"
      />
    </div>
  )
};
export const LightAndDark: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      {(["light", "dark"] as const).map((theme) => (
        <ThemeProvider
          key={theme}
          theme={theme}
          style={{ background: "var(--meu-color-surface)", padding: 16 }}
        >
          <Image src="" alt={`${theme} 图片不可用`} width={280} height={160} radius="surface" />
        </ThemeProvider>
      ))}
    </div>
  )
};
export const RtlLongFallback: Story = {
  render: () => (
    <div dir="rtl" lang="ar" style={{ width: 220 }}>
      <Image
        src=""
        alt="صورة المنتج غير متاحة"
        fallback="تعذر تحميل صورة المنتج MEU-2026-SUPER-LONG-UNBROKEN-IDENTIFIER، يرجى المحاولة لاحقًا"
        width="100%"
        height={120}
        radius="surface"
      />
    </div>
  ),
  play: ({ canvasElement }) => {
    const boundary = canvasElement.querySelector<HTMLElement>('[dir="rtl"]');
    const root = canvasElement.querySelector<HTMLElement>('[data-meu-component="image"]');
    if (
      !boundary ||
      boundary.lang !== "ar" ||
      !root ||
      root.getAttribute("data-state") !== "error" ||
      !root.textContent ||
      !root.textContent.includes("MEU-2026-SUPER-LONG-UNBROKEN-IDENTIFIER")
    ) {
      throw new window.Error("Expected the localized RTL long fallback");
    }
  }
};
export const ReducedMotion: Story = {
  render: () => (
    <ConfigProvider motion="reduced">
      <Image
        src={landscape}
        alt="关闭淡入动画的山谷插画"
        width={280}
        height={160}
        placeholder="图片加载中…"
        radius="surface"
      />
    </ConfigProvider>
  ),
  play: async ({ canvasElement }) => {
    const provider = canvasElement.querySelector<HTMLElement>('[data-meu-motion="reduced"]');
    const root = canvasElement.querySelector<HTMLElement>('[data-meu-component="image"]');
    const image = canvasElement.querySelector<HTMLImageElement>("img");
    if (!provider || !root || !image) {
      throw new window.Error("Expected reduced-motion Image markup");
    }
    if (root.getAttribute("data-state") === "loading") {
      image.dispatchEvent(new window.Event("load", { bubbles: true }));
    }
    await waitForStory(
      () => root.getAttribute("data-state") === "loaded",
      "Reduced-motion Image did not enter loaded state"
    );
    if (window.getComputedStyle(image).transitionDuration !== "0s") {
      throw new window.Error("Reduced-motion Image retained an opacity transition");
    }
  }
};
