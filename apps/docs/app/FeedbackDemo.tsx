"use client";

import { Button, Empty, Progress, Result, Skeleton, Space } from "@meu/mobile";
import { useState } from "react";

export function FeedbackDemo() {
  const [progress, setProgress] = useState(64);

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "grid", gap: 12 }}>
        <Progress label="资料上传" value={progress} showValue />
        <Button
          size="small"
          variant="outline"
          tone="neutral"
          style={{ justifySelf: "start" }}
          onClick={() => setProgress((current) => (current >= 100 ? 16 : current + 12))}
        >
          {progress >= 100 ? "重新演示" : "推进上传"}
        </Button>
      </div>
      <div aria-label="订单摘要加载中" aria-busy="true" style={{ display: "grid", gap: 12 }}>
        <Skeleton variant="rectangle" height={96} animated />
        <Skeleton lines={3} lineWidths={["100%", "84%", "56%"]} animated />
      </div>
      <Empty
        title="没有待处理订单"
        description="当前筛选条件下没有可处理的订单。"
        action={
          <Button size="small" variant="outline" tone="neutral">
            清除筛选
          </Button>
        }
      />
      <Result
        status="success"
        title="订单提交成功"
        description="订单已进入履约流程，可继续查看订单详情。"
        actions={
          <Space wrap gap={2}>
            <Button size="small">查看订单</Button>
            <Button size="small" variant="outline" tone="neutral">
              返回首页
            </Button>
          </Space>
        }
      />
    </div>
  );
}
