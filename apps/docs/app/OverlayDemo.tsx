"use client";

import { Button, Dialog, Mask, Popup, Space, useDialog, useToast } from "@meu/mobile";
import { useRef, useState } from "react";

export function OverlayDemo() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("等待 Dialog 操作");
  const dialog = useDialog();
  const toast = useToast();
  const popupTriggerRef = useRef<HTMLButtonElement>(null);
  const dialogTriggerRef = useRef<HTMLButtonElement>(null);

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
      <Space wrap gap={2}>
        <Button ref={popupTriggerRef} onClick={() => setPopupOpen(true)}>
          打开配送浮层
        </Button>
        <Button
          ref={dialogTriggerRef}
          tone="danger"
          variant="outline"
          onClick={() => setDialogOpen(true)}
        >
          打开删除确认
        </Button>
        <Button
          tone="neutral"
          variant="outline"
          onClick={() => {
            void dialog
              .confirm({
                title: "确认提交订单？",
                description: "确认后订单将进入履约流程。"
              })
              .then((confirmed) => setDialogMessage(confirmed ? "已确认提交" : "已取消提交"));
          }}
        >
          命令式确认
        </Button>
        <Button
          tone="neutral"
          variant="outline"
          onClick={() => toast.success({ message: "订单已保存", position: "top" })}
        >
          成功 Toast
        </Button>
        <Button
          tone="neutral"
          variant="outline"
          onClick={() => {
            toast.warning({
              action: {
                label: "撤销",
                onPress: () => setDialogMessage("已撤销库存调整")
              },
              message: "库存不足，已调整购买数量",
              position: "bottom"
            });
          }}
        >
          操作 Toast
        </Button>
      </Space>
      <output aria-live="polite">{dialogMessage}</output>
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
      <Dialog
        open={dialogOpen}
        title="删除订单？"
        description="订单及关联记录将被永久删除，此操作无法撤销。"
        returnFocusRef={dialogTriggerRef}
        actions={[
          { autoFocus: true, key: "cancel", label: "取消" },
          {
            key: "delete",
            label: "永久删除",
            tone: "danger",
            onPress: async () => {
              await new Promise<void>((resolve) => window.setTimeout(resolve, 120));
              setDialogMessage("已删除演示订单");
            }
          }
        ]}
        onOpenChange={(nextOpen) => setDialogOpen(nextOpen)}
      />
    </div>
  );
}
