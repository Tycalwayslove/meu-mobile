import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemeProvider } from "../ConfigProvider";
import { Avatar } from "./Avatar";

const meta = {
  title: "Information/Avatar",
  component: Avatar,
  args: {
    alt: "林夏",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300"
  }
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ImageAvatar: Story = {};
export const Initial: Story = { args: { src: "", alt: "林夏" } };
export const ExplicitInitials: Story = { args: { initials: "LX", src: "" } };
export const Rounded: Story = { args: { shape: "rounded", size: "large" } };
export const ImageFailure: Story = {
  args: { initials: "LX", src: "/missing-avatar.jpg" },
  play: async ({ canvasElement }) => {
    const image = canvasElement.querySelector<HTMLImageElement>("img");
    if (!image) throw new window.Error("Expected Avatar image");
    image.dispatchEvent(new window.Event("error"));
    await Promise.resolve();
    const textContent = canvasElement.textContent;
    if (!textContent || !textContent.includes("LX")) {
      throw new window.Error("Avatar did not retain its initials fallback");
    }
  }
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
