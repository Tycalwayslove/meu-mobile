import type { Meta, StoryObj } from "@storybook/react-vite";

import { Skeleton } from "./Skeleton";

const meta = {
  title: "Feedback/Skeleton",
  component: Skeleton,
  args: { animated: false }
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Paragraph: Story = { args: { lines: 4, lineWidths: ["100%", "100%", "88%", "64%"] } };
export const AnimatedParagraph: Story = { args: { animated: true, lines: 3 } };
export const Rectangle: Story = { args: { height: 144, variant: "rectangle" } };
export const Circle: Story = { args: { height: 56, variant: "circle", width: 56 } };
export const StableMediaRatio: Story = {
  args: { animated: true, aspectRatio: "16 / 9", height: "auto", variant: "rectangle" }
};
export const ComposedCard: Story = {
  render: () => (
    <div
      role="status"
      aria-busy="true"
      aria-label="正在加载商品"
      style={{ display: "grid", gap: 12, width: 280 }}
    >
      <Skeleton animated aspectRatio="4 / 3" height="auto" variant="rectangle" />
      <div style={{ display: "flex", gap: 12 }}>
        <Skeleton animated height={44} variant="circle" width={44} />
        <Skeleton animated lines={2} lineWidths={["100%", "62%"]} />
      </div>
    </div>
  ),
  play: ({ canvasElement }) => {
    const status = canvasElement.querySelector<HTMLElement>(
      '[role="status"][aria-label="正在加载商品"]'
    );
    const skeletons = canvasElement.querySelectorAll<HTMLElement>(
      '[data-meu-component="skeleton"]'
    );
    if (!status || status.getAttribute("aria-busy") !== "true") {
      throw new window.Error("Skeleton composition did not expose its loading boundary");
    }
    if (skeletons.length !== 3) {
      throw new window.Error("Skeleton composition did not render all placeholder groups");
    }
    skeletons.forEach((skeleton) => {
      if (skeleton.getAttribute("aria-hidden") !== "true") {
        throw new window.Error("A decorative Skeleton leaked into the accessibility tree");
      }
    });
    if (
      skeletons.item(0).getAttribute("data-variant") !== "rectangle" ||
      skeletons.item(1).getAttribute("data-variant") !== "circle" ||
      skeletons.item(2).querySelectorAll("span").length !== 2
    ) {
      throw new window.Error("Skeleton composition lost its media, avatar, or text geometry");
    }
  }
};
