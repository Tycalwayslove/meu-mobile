"use client";

import { Button, Mask, Popup, Space } from "@meu/mobile";
import { useRef, useState } from "react";

export function OverlayDemo() {
  const [popupOpen, setPopupOpen] = useState(false);
  const popupTriggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div
        style={{
          position: "relative",
          minHeight: 128,
          overflow: "hidden",
          background: "var(--meu-color-subtle)",
          borderRadius: "var(--meu-radius-surface)"
        }}
      >
        <Mask
          container={null}
          lockScroll={false}
          opacity="thin"
          style={{ position: "absolute", zIndex: 0 }}
        >
          <span style={{ color: "white", fontSize: 14, fontWeight: 600 }}>Mask 预览</span>
        </Mask>
      </div>
      <Button
        ref={popupTriggerRef}
        style={{ justifySelf: "start" }}
        onClick={() => setPopupOpen(true)}
      >
        打开配送浮层
      </Button>
      <Popup
        aria-label="配送方式"
        open={popupOpen}
        closeOnMaskClick
        showCloseButton
        returnFocusRef={popupTriggerRef}
        onOpenChange={setPopupOpen}
      >
        <div style={{ display: "grid", gap: 16, padding: "56px 24px 24px" }}>
          <h3 style={{ margin: 0 }}>配送方式</h3>
          <p style={{ margin: 0, color: "var(--meu-color-muted)", lineHeight: 1.6 }}>
            Popup 只负责浮层结构和交互边界，业务选择逻辑由调用方维护。
          </p>
          <Space wrap gap={2}>
            <Button size="small" onClick={() => setPopupOpen(false)}>
              确认配送
            </Button>
            <Button
              size="small"
              variant="outline"
              tone="neutral"
              onClick={() => setPopupOpen(false)}
            >
              取消
            </Button>
          </Space>
        </div>
      </Popup>
    </div>
  );
}
