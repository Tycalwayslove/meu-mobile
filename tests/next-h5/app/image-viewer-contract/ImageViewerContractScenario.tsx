"use client";

import { Button, ConfigProvider, ImageViewer } from "@meu/mobile";
import { useRef, useState } from "react";

const pixel =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='480' viewBox='0 0 320 480'%3E%3Crect width='320' height='480' fill='%23127a67'/%3E%3C/svg%3E";

const images = [
  { alt: "First product image", key: "first", src: pixel },
  { alt: "Second product image", key: "second", src: pixel },
  { alt: "Third product image", key: "third", src: pixel }
] as const;

export function ImageViewerContractScenario() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [index, setIndex] = useState(1);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("none");

  return (
    <ConfigProvider dir="rtl" locale="en-US" motion="reduced" theme="light">
      <main style={{ minHeight: "100vh", padding: 24 }}>
        <h1>ImageViewer gesture contract</h1>
        <Button ref={triggerRef} onClick={() => setOpen(true)}>
          Open RTL image viewer
        </Button>
        <output data-testid="image-viewer-index">{index}</output>
        <output data-testid="image-viewer-reason">{reason}</output>
        <ImageViewer
          index={index}
          images={images}
          open={open}
          returnFocusRef={triggerRef}
          onIndexChange={(nextIndex, details) => {
            setIndex(nextIndex);
            setReason(details.reason);
          }}
          onOpenChange={setOpen}
        />
      </main>
    </ConfigProvider>
  );
}
