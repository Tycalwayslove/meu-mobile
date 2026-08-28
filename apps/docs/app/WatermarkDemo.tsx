"use client";

import { Button, Card, Watermark } from "@meu/mobile";
import { useState } from "react";

export function WatermarkDemo() {
  const [message, setMessage] = useState("水印未发生 DOM 变更");

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Watermark
        content={["Meu Mobile", "内部资料"]}
        onRemove={() => setMessage("检测到水印 DOM 变更并已恢复")}
      >
        <Card style={{ minHeight: 260 }}>
          <h3 style={{ marginTop: 0 }}>订单凭证</h3>
          <p>订单号：MEU-20260828-001</p>
          <p>水印不会阻断内容选择、链接或原生按钮。</p>
          <Button variant="outline" tone="neutral" onClick={() => setMessage("凭证操作可用")}>
            查看履约记录
          </Button>
        </Card>
      </Watermark>
      <output aria-live="polite" style={{ color: "var(--meu-color-muted)", fontSize: 12 }}>
        {message}
      </output>
      <p style={{ margin: 0, color: "var(--meu-color-muted)", lineHeight: 1.6 }}>
        Watermark 只用于版权提示和泄露追踪，不替代鉴权、脱敏、访问审计或防截图能力。
      </p>
    </div>
  );
}
