"use client";

import { Avatar, Badge, Ellipsis, Image, Space, Tag } from "@meu/mobile";
import { useState } from "react";

const description =
  "信息展示组件保持足够原子：标签表达短状态，徽标表达数量与提醒，头像和图片共享加载回退机制，长文本则按容器宽度折叠。";

type DisplayDemoProps = {
  focus?: "avatar" | "badge" | "ellipsis" | "image" | "tag";
};

export function DisplayDemo({ focus }: DisplayDemoProps = {}) {
  const [action, setAction] = useState("尚未筛选");

  const tags = (
    <Space wrap gap={2}>
      <Tag tone="accent" variant="solid">
        新品
      </Tag>
      <Tag tone="success">已上架</Tag>
      <Tag tone="warning" variant="outline">
        库存偏低
      </Tag>
      <Tag tone="danger" rounded onClick={() => setAction("仅查看待处理商品")}>
        待处理
      </Tag>
    </Space>
  );
  const avatars = (
    <Space align="center" gap={4}>
      <Avatar src="/demo-avatar.svg" alt="Meu 示例店铺" size="large" />
      <Avatar src="" alt="林夏" />
    </Space>
  );
  const badges = (
    <Space align="center" gap={4}>
      <Badge content={128} max={99} bordered>
        <Avatar src="/demo-avatar.svg" alt="Meu 示例店铺" size="large" />
      </Badge>
      <Badge dot tone="success" label="店铺在线">
        <Avatar src="" alt="林夏" />
      </Badge>
    </Space>
  );
  const image = (
    <Image
      src="/demo-media.svg"
      alt="绿色植物与商品包装插画"
      width="100%"
      height={180}
      radius="surface"
      loading="lazy"
    />
  );
  const ellipsis = <Ellipsis content={description} rows={2} />;

  if (focus === "avatar") return avatars;
  if (focus === "badge") return badges;
  if (focus === "image") return image;
  if (focus === "ellipsis") return ellipsis;
  if (focus === "tag") {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        {tags}
        <output aria-live="polite">{action}</output>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {tags}
      <output aria-live="polite" style={{ color: "var(--meu-color-muted)", fontSize: 12 }}>
        {action}
      </output>
      {badges}
      {image}
      {ellipsis}
    </div>
  );
}
