"use client";

import { Button, ImageViewer } from "@meu/mobile";
import { useRef, useState } from "react";

const images = [
  {
    alt: "绿色植物与商品包装",
    key: "product-front",
    src: "/demo-media.svg"
  },
  {
    alt: "商品包装侧面细节",
    key: "product-side",
    src: "/demo-media.svg"
  },
  {
    alt: "商品包装使用场景",
    key: "product-scene",
    src: "/demo-media.svg"
  }
] as const;

export function ImageViewerDemo() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <div style={{ display: "grid", justifyItems: "start", gap: 12 }}>
      <Button ref={triggerRef} onClick={() => setOpen(true)}>
        预览商品图片
      </Button>
      <p aria-live="polite" style={{ margin: 0 }}>
        当前图片：{index + 1} / {images.length}
      </p>
      <ImageViewer
        aria-label="商品图片预览"
        images={images}
        index={index}
        open={open}
        returnFocusRef={triggerRef}
        renderFooter={(item) => item.alt}
        onIndexChange={setIndex}
        onOpenChange={setOpen}
      />
    </div>
  );
}
