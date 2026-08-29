import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemeProvider } from "../ConfigProvider";
import { waitForStory } from "../storyTestUtils";
import { Avatar } from "./Avatar";

const meta = {
  title: "Information/Avatar",
  component: Avatar,
  args: {
    alt: "林夏",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300"
  },
  parameters: {
    docs: {
      description: {
        component: "固定尺寸身份头像，覆盖加载、成功、失败和空源回退；Avatar 本身不提供交互语义。"
      }
    }
  }
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ImageAvatar: Story = {};
export const Initial: Story = { args: { src: "", alt: "林夏" } };
export const ExplicitInitials: Story = { args: { initials: "LX", src: "" } };
export const Rounded: Story = { args: { shape: "rounded", size: "large" } };
export const SizesAndShapes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
      <Avatar src="" alt="小号圆形头像" initials="S" size="small" />
      <Avatar src="" alt="中号圆角头像" initials="M" shape="rounded" />
      <Avatar src="" alt="大号方形头像" initials="L" shape="square" size="large" />
      <Avatar src="" alt="自定义尺寸头像" initials="72" size={72} />
    </div>
  )
};
export const FocalPointAndResponsiveSource: Story = {
  args: {
    objectPosition: "50% 25%",
    loading: "lazy",
    sizes: "(max-width: 480px) 44px, 56px",
    srcSet:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=88 88w, https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=112 112w"
  },
  play: ({ canvasElement }) => {
    const image = canvasElement.querySelector<HTMLImageElement>("img");
    if (!image) throw new window.Error("Expected responsive Avatar image");
    if (image.sizes !== "(max-width: 480px) 44px, 56px" || !image.srcset.includes("88w")) {
      throw new window.Error("Avatar did not forward responsive image hints");
    }
  }
};
export const CustomFallback: Story = {
  args: {
    src: "",
    alt: "Meu 商店",
    fallback: <span aria-hidden="true">店</span>,
    shape: "rounded"
  }
};
export const ImageFailure: Story = {
  args: { initials: "LX", src: "/missing-avatar.jpg" },
  play: async ({ canvasElement }) => {
    const image = canvasElement.querySelector<HTMLImageElement>("img");
    if (!image) throw new window.Error("Expected Avatar image");
    image.dispatchEvent(new window.Event("error", { bubbles: true }));
    await waitForStory(() => {
      const failedImage = canvasElement.querySelector<HTMLElement>('[data-state="error"]');
      return Boolean(
        failedImage &&
        failedImage.getAttribute("aria-label") === "林夏" &&
        failedImage.textContent &&
        failedImage.textContent.includes("LX")
      );
    }, "Avatar did not expose its named initials fallback");
  }
};
export const RtlAndDecorative: Story = {
  render: () => (
    <div dir="rtl" style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Avatar src="" alt="ليلى" initials="لي" />
      <Avatar src="" alt="" fallback={<span aria-hidden="true">店</span>} shape="rounded" />
      <span>ملف المستخدم</span>
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
          <Avatar src="" alt={`${theme} 林夏`} initials="LX" />
        </ThemeProvider>
      ))}
    </div>
  )
};
