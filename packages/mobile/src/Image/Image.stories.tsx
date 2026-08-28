import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemeProvider } from "../ConfigProvider";
import { waitForStory } from "../storyTestUtils";
import { Image } from "./Image";

const meta = {
  title: "Information/Image",
  component: Image,
  args: {
    alt: "山谷中的绿色植物",
    width: 280,
    height: 160,
    radius: "surface",
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800"
  }
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {};
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
export const LightAndDark: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      {(["light", "dark"] as const).map((theme) => (
        <ThemeProvider key={theme} theme={theme} style={{ padding: 16 }}>
          <Image src="" alt={`${theme} 图片不可用`} width={280} height={160} radius="surface" />
        </ThemeProvider>
      ))}
    </div>
  )
};
