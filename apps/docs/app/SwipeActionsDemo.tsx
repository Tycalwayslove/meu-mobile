"use client";

import { ActionMenu, Button, Cell, SwipeActions } from "@meu/mobile";
import { useState } from "react";

export function SwipeActionsDemo() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState("等待订单操作");
  const runAction = (key: "archive" | "delete") => {
    setMessage(key === "archive" ? "已归档订单" : "已删除订单");
  };

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 520 }}>
      <SwipeActions
        leftActions={[
          { key: "pin", label: "置顶", tone: "accent", onPress: () => setMessage("已置顶订单") }
        ]}
        rightActions={[
          { key: "archive", label: "归档", onPress: () => runAction("archive") },
          {
            key: "delete",
            label: "删除",
            tone: "danger",
            onPress: async () => {
              await new Promise<void>((resolve) => window.setTimeout(resolve, 500));
              runAction("delete");
            }
          }
        ]}
      >
        <Cell
          title="订单 MEU-0828"
          description="向右置顶，向左显示归档与删除"
          suffix={
            <Button size="small" variant="text" tone="neutral" onClick={() => setMenuOpen(true)}>
              更多操作
            </Button>
          }
        />
      </SwipeActions>
      <output aria-live="polite">{message}</output>
      <ActionMenu
        open={menuOpen}
        title="订单操作"
        description="与滑动轨道等价的常驻入口"
        actions={[
          { key: "archive", label: "归档", onPress: () => runAction("archive") },
          { key: "delete", label: "删除", tone: "danger", onPress: () => runAction("delete") }
        ]}
        onOpenChange={setMenuOpen}
      />
    </div>
  );
}
