import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../Button";
import { ThemeProvider } from "../ConfigProvider";
import { Tag } from "../Tag";
import { Card } from "./Card";

const meta = {
  title: "Information/Card",
  component: Card,
  args: {
    children: "展示商品、订单或账户等一组相关信息。",
    description: "刚刚更新",
    extra: <Tag tone="success">营业中</Tag>,
    title: "Meu 示例店铺"
  }
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Outlined: Story = {
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector<HTMLElement>('[data-meu-component="card"]');
    await Promise.resolve();
    if (!card) throw new window.Error("Expected the Card boundary");
    if (card.getAttribute("data-variant") !== "outlined" || card.hasAttribute("role")) {
      throw new window.Error("Expected a non-interactive outlined Card");
    }
    if (
      !card.querySelector("[data-meu-card-header]") ||
      !card.querySelector("[data-meu-card-body]")
    ) {
      throw new window.Error("Expected Card header and body regions");
    }
  }
};
export const Filled: Story = { args: { variant: "filled" } };
export const Elevated: Story = { args: { variant: "elevated" } };
export const WithFooter: Story = {
  args: { footer: <Button size="small">查看详情</Button> }
};
export const WithMediaAndActions: Story = {
  args: {
    footer: (
      <>
        <Button size="small" variant="outline">
          稍后处理
        </Button>
        <Button size="small">查看详情</Button>
      </>
    ),
    footerLayout: "actions",
    media: (
      <div
        role="img"
        aria-label="店铺封面占位"
        style={{ width: "100%", height: "100%", background: "var(--meu-color-subtle)" }}
      />
    ),
    mediaAspectRatio: "16 / 9"
  }
};
export const LightAndDark: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      {(["light", "dark"] as const).map((theme) => (
        <ThemeProvider
          key={theme}
          theme={theme}
          style={{ background: "var(--meu-color-surface)", padding: 16 }}
        >
          <Card title={`${theme} 卡片`} description="独立操作区" footer={<Button>查看</Button>}>
            内容区域不承担整卡点击。
          </Card>
        </ThemeProvider>
      ))}
    </div>
  )
};

export const NarrowRtlContent: Story = {
  render: () => (
    <div dir="rtl" style={{ width: 260, maxWidth: "100%" }}>
      <Card
        title="عنوان طويل للغاية لاختبار التفاف النص داخل بطاقة ضيقة"
        description="وصف يوضح أن النص غير المنفصل لا يوسّع سطح البطاقة"
        extra={<Tag tone="warning">قيد المراجعة الطويلة</Tag>}
        footer={
          <>
            <Button size="small" variant="outline">
              لاحقًا
            </Button>
            <Button size="small">عرض</Button>
          </>
        }
        footerLayout="actions"
      >
        VeryLongUnbrokenBusinessIdentifier012345678901234567890
      </Card>
    </div>
  )
};
