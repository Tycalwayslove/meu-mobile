import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import { Button } from "../Button";
import { ImageViewer } from "./ImageViewer";

const images = [
  {
    alt: "森林中的绿色植物",
    key: "forest",
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200"
  },
  {
    alt: "海边岩石与浪花",
    key: "coast",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200"
  },
  {
    alt: "远山与湖面",
    key: "lake",
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200"
  }
] as const;

function Preview({ minimal = false, single = false }: { minimal?: boolean; single?: boolean }) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const resolvedImages = single ? images.slice(0, 1) : images;

  return (
    <>
      <Button ref={triggerRef} onClick={() => setOpen(true)}>
        打开图片预览
      </Button>
      <ImageViewer
        open={open}
        images={resolvedImages}
        index={index}
        controls={minimal ? "minimal" : "full"}
        returnFocusRef={triggerRef}
        renderFooter={(item) => item.alt}
        onIndexChange={setIndex}
        onOpenChange={setOpen}
      />
    </>
  );
}

const meta = {
  title: "Feedback/ImageViewer",
  component: ImageViewer,
  parameters: { layout: "padded" }
} satisfies Meta<typeof ImageViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gallery: Story = { args: { images }, render: () => <Preview /> };

export const Single: Story = { args: { images }, render: () => <Preview single /> };

export const MinimalControls: Story = { args: { images }, render: () => <Preview minimal /> };

export const Empty: Story = {
  args: { open: true, images: [], emptyContent: "当前商品没有更多图片" }
};

export const Error: Story = {
  args: {
    open: true,
    images: [{ alt: "加载失败的商品图", src: "/missing-image.jpg" }]
  }
};
