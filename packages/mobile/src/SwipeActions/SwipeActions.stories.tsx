import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { ActionMenu } from "../ActionMenu";
import { Button } from "../Button";
import { ConfigProvider } from "../ConfigProvider";
import { Cell } from "../List";
import { SwipeActions } from "./SwipeActions";
import type { SwipeActionsAction, SwipeActionsSide } from "./types";

function SwipeActionsPreview({
  controlled = false,
  disabled = false
}: {
  controlled?: boolean;
  disabled?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSide, setOpenSide] = useState<SwipeActionsSide | null>(null);
  const [message, setMessage] = useState("等待操作");
  const actions: SwipeActionsAction[] = [
    { key: "archive", label: "归档", onPress: () => setMessage("已归档订单") },
    {
      key: "delete",
      label: "删除",
      tone: "danger",
      onPress: async () => {
        await new Promise<void>((resolve) => window.setTimeout(resolve, 500));
        setMessage("已删除订单");
      }
    }
  ];

  return (
    <div style={{ display: "grid", gap: 16, width: "min(100%, 420px)" }}>
      <SwipeActions
        disabled={disabled}
        leftActions={[
          { key: "pin", label: "置顶", tone: "accent", onPress: () => setMessage("已置顶订单") }
        ]}
        rightActions={actions}
        {...(controlled ? { openSide, onOpenSideChange: setOpenSide } : {})}
      >
        <Cell
          title="订单 MEU-0828"
          description="标准配送 · 等待商家发货"
          suffix={
            <Button
              size="small"
              variant="text"
              tone="neutral"
              disabled={disabled}
              onClick={() => setMenuOpen(true)}
            >
              更多操作
            </Button>
          }
        />
      </SwipeActions>
      {controlled ? (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button size="small" variant="outline" tone="neutral" onClick={() => setOpenSide("left")}>
            打开左侧
          </Button>
          <Button
            size="small"
            variant="outline"
            tone="neutral"
            onClick={() => setOpenSide("right")}
          >
            打开右侧
          </Button>
          <Button size="small" variant="outline" tone="neutral" onClick={() => setOpenSide(null)}>
            关闭
          </Button>
        </div>
      ) : null}
      <output aria-live="polite">{message}</output>
      <ActionMenu
        open={menuOpen}
        title="订单操作"
        description="滑动动作始终保留这个等价入口"
        actions={actions.map((action) => ({
          key: String(action.key),
          label: action.label,
          tone: action.tone === "danger" ? "danger" : "neutral",
          onPress: () => (action.onPress ? action.onPress({ index: 0, side: "right" }) : undefined)
        }))}
        onOpenChange={setMenuOpen}
      />
    </div>
  );
}

const meta = {
  title: "Gesture/SwipeActions",
  component: SwipeActions,
  parameters: { layout: "padded" },
  args: {
    children: <Cell title="可滑动内容" />,
    rightActions: [
      { key: "archive", label: "归档" },
      { key: "delete", label: "删除", tone: "danger" }
    ]
  },
  argTypes: {
    children: { control: false },
    leftActions: { control: false },
    onAction: { control: false },
    onOpenSideChange: { control: false },
    rightActions: { control: false }
  }
} satisfies Meta<typeof SwipeActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <SwipeActionsPreview />,
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>('[data-meu-component="swipe-actions"]');
    const reveal = Array.from(canvasElement.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => button.textContent === "显示右侧操作"
    );
    if (!root || !reveal) throw new window.Error("Expected SwipeActions reveal control");
    reveal.click();
    await Promise.resolve();
    if (root.getAttribute("data-open-side") !== "right") {
      throw new window.Error("SwipeActions did not reveal the right rail");
    }
  }
};

export const Controlled: Story = { render: () => <SwipeActionsPreview controlled /> };

export const Disabled: Story = { render: () => <SwipeActionsPreview disabled /> };

export const LeftAndRight: Story = {
  args: {
    leftActions: [{ key: "pin", label: "置顶", tone: "accent" }]
  }
};

export const RTLPhysicalSides: Story = {
  render: () => (
    <div dir="rtl" style={{ width: "min(100%, 420px)" }}>
      <SwipeActions
        leftActions={[{ key: "pin", label: "تثبيت", tone: "accent" }]}
        rightActions={[{ key: "delete", label: "حذف", tone: "danger" }]}
      >
        <Cell title="طلب" description="اليسار واليمين اتجاهان ماديان" />
      </SwipeActions>
    </div>
  )
};

export const LongLocalizedActions: Story = {
  render: () => (
    <ConfigProvider dir="rtl" locale="en-US" motion="reduced">
      <div style={{ width: "min(100%, 390px)" }}>
        <SwipeActions
          defaultOpenSide="right"
          leftActions={[{ key: "pin", label: "Pin for later", tone: "accent" }]}
          rightActions={[
            { key: "archive", label: "Archive order" },
            {
              "aria-label": "Delete order permanently",
              key: "delete",
              label: <span aria-hidden="true">Delete permanently</span>,
              tone: "danger"
            }
          ]}
          leftActionsLabel="Actions on the physical left"
          rightActionsLabel="Actions on the physical right"
          revealLeftLabel="Show actions on the physical left"
          revealRightLabel="Show actions on the physical right"
        >
          <Cell
            title="Order MEU-0828 with a localized delivery description"
            description="Physical left and right do not change meaning in right-to-left layouts"
          />
        </SwipeActions>
      </div>
    </ConfigProvider>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>('[data-meu-component="swipe-actions"]');
    if (!root) throw new window.Error("Expected SwipeActions root");
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    if (root.getAttribute("dir") !== "rtl") {
      throw new window.Error("Expected the configured RTL direction");
    }
    if (root.getAttribute("data-open-side") !== "right") {
      throw new window.Error("Expected the physical-right action rail to be open");
    }
    const group = root.querySelector<HTMLElement>('[data-meu-swipe-actions-group="right"]');
    if (!group || group.getAttribute("aria-label") !== "Actions on the physical right") {
      throw new window.Error("Expected the localized right-rail name");
    }
    const buttons = Array.from(group.querySelectorAll<HTMLButtonElement>("button"));
    if (
      buttons.length !== 2 ||
      buttons.some((button) => button.getBoundingClientRect().height < 44)
    ) {
      throw new window.Error("Expected two action targets of at least 44px");
    }
    const danger = buttons[1];
    if (!danger || danger.getAttribute("aria-label") !== "Delete order permanently") {
      throw new window.Error("Expected the rich danger label to retain an accessible name");
    }
  }
};
