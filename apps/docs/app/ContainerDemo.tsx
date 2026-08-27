"use client";

import { Button, Card, Collapse, Image, Space, Tag } from "@meu/mobile";
import { useState } from "react";

const details = [
  {
    value: "delivery",
    title: "配送范围",
    content: "支持中国大陆大部分城市配送，偏远地区以结算页结果为准。",
    extra: "全国"
  },
  {
    value: "returns",
    title: "退换规则",
    content: "商品签收后 7 天内可申请退换，定制商品除外。"
  },
  {
    value: "invoice",
    title: "发票服务",
    content: "暂不支持纸质发票。",
    disabled: true
  }
] as const;

export function ContainerDemo() {
  const [openSections, setOpenSections] = useState<readonly string[]>(["delivery"]);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Card
        media={
          <Image
            src="/demo-media.svg"
            alt="绿色植物与商品包装插画"
            width="100%"
            height={150}
            radius="none"
          />
        }
        title={<h3 style={{ margin: 0, font: "inherit" }}>Meu 示例店铺</h3>}
        description="今日 09:00 更新"
        extra={<Tag tone="success">营业中</Tag>}
        footer={
          <Space wrap gap={2}>
            <Button size="small">查看店铺</Button>
            <Button size="small" tone="neutral" variant="outline">
              联系客服
            </Button>
          </Space>
        }
      >
        Card 只组织内容层级，具体操作保留原生 Button 或链接语义。
      </Card>
      <Collapse
        aria-label="购物帮助"
        items={details}
        value={openSections}
        onChange={setOpenSections}
        variant="card"
        accordion
      />
    </div>
  );
}
