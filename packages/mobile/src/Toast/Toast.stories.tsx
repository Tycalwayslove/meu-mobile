import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../Button";
import { Space } from "../Space";
import { waitForStory } from "../storyTestUtils";
import { Toast } from "./Toast";
import { ToastProvider, useToast } from "./ToastProvider";
import type { ToastProps } from "./types";

function ToastPreview(props: ToastProps) {
  const [open, setOpen] = useState(false);
  const [lastChange, setLastChange] = useState("尚未关闭");
  return (
    <>
      <Button onClick={() => setOpen(true)}>显示 Toast</Button>
      <output hidden data-toast-change>
        {lastChange}
      </output>
      <Toast
        {...props}
        open={open}
        onOpenChange={(nextOpen, details) => {
          setOpen(nextOpen);
          setLastChange(`${nextOpen ? "打开" : "关闭"}:${details.reason}`);
          if (props.onOpenChange) props.onOpenChange(nextOpen, details);
        }}
      />
    </>
  );
}

function ProviderPreview() {
  const toast = useToast();
  const [closeReasons, setCloseReasons] = useState<string[]>([]);
  const trackClose = (label: string) => (details: { reason: string }) => {
    setCloseReasons((current) => [...current, `${label}:${details.reason}`]);
  };
  return (
    <div>
      <Space wrap gap={2}>
        <Button
          onClick={() =>
            toast.show({
              duration: 0,
              id: "sync",
              message: "正在同步",
              onClose: trackClose("sync"),
              position: "top"
            })
          }
        >
          显示同步
        </Button>
        <Button
          tone="neutral"
          variant="outline"
          onClick={() =>
            toast.success({ duration: 0, id: "sync", message: "同步完成", position: "top" })
          }
        >
          同 ID 替换
        </Button>
        <Button
          tone="neutral"
          variant="outline"
          onClick={() =>
            toast.warning({
              action: { label: "撤销" },
              duration: 0,
              message: "库存不足，已调整购买数量",
              onClose: trackClose("stock"),
              position: "bottom"
            })
          }
        >
          加入第二条
        </Button>
        <Button tone="danger" variant="outline" onClick={toast.clear}>
          清空队列
        </Button>
      </Space>
      <output hidden data-toast-close-reasons>
        {closeReasons.join(",")}
      </output>
    </div>
  );
}

function AnnouncementThrottlePreview() {
  const toast = useToast();
  return (
    <Space wrap gap={2}>
      <Button onClick={() => toast.show({ duration: 0, id: "upload", message: "上传 0%" })}>
        开始上传
      </Button>
      <Button
        tone="neutral"
        variant="outline"
        onClick={() => toast.show({ duration: 0, id: "upload", message: "上传 25%" })}
      >
        更新 25%
      </Button>
      <Button
        tone="neutral"
        variant="outline"
        onClick={() => toast.show({ duration: 0, id: "upload", message: "上传 75%" })}
      >
        更新 75%
      </Button>
      <Button
        tone="danger"
        variant="outline"
        onClick={() => toast.danger({ duration: 0, id: "upload", message: "上传失败，请检查网络" })}
      >
        升级错误
      </Button>
      <Button
        tone="neutral"
        variant="outline"
        onClick={() => toast.warning({ duration: 0, id: "upload", message: "正在重新连接" })}
      >
        更新警告
      </Button>
    </Space>
  );
}

const meta = {
  title: "Feedback/Toast",
  component: Toast,
  args: {
    message: "订单信息已更新",
    tone: "neutral"
  },
  render: (args) => <ToastPreview {...args} />
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};
export const Success: Story = { args: { message: "订单已保存", tone: "success" } };
export const WarningWithAction: Story = {
  args: {
    action: { label: "撤销" },
    duration: 0,
    message: "库存不足，已调整购买数量",
    position: "bottom",
    tone: "warning"
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLButtonElement>("button");
    if (!trigger) throw new window.Error("Expected Toast trigger");
    trigger.click();

    const body = canvasElement.ownerDocument.body;
    await waitForStory(
      () => body.querySelector('[data-meu-overlay-layer="toast"]') !== null,
      "Toast did not open in its portal"
    );
    const layer = body.querySelector<HTMLElement>('[data-meu-overlay-layer="toast"]');
    if (!layer) throw new window.Error("Toast did not open in its portal");
    const toast = layer.querySelector<HTMLElement>('[data-meu-component="toast"]');
    const announcement = layer.querySelector<HTMLElement>('[role="alert"]');
    const action = layer.querySelector<HTMLButtonElement>("button");
    if (!toast || !announcement || !action) throw new window.Error("Toast content was incomplete");
    if (
      layer.getAttribute("data-position") !== "bottom" ||
      toast.getAttribute("data-tone") !== "warning" ||
      announcement.getAttribute("aria-live") !== "assertive" ||
      announcement.textContent !== "库存不足，已调整购买数量"
    ) {
      throw new window.Error("Toast did not expose its warning announcement contract");
    }

    action.focus();
    if (canvasElement.ownerDocument.activeElement !== action) {
      throw new window.Error("Toast action did not accept focus");
    }
    action.click();

    const change = canvasElement.querySelector<HTMLOutputElement>("[data-toast-change]");
    await waitForStory(
      () =>
        Boolean(change && change.textContent === "关闭:action") &&
        layer.getAttribute("aria-hidden") === "true",
      "Toast action did not publish its close callback and hide the announcement"
    );
  }
};
export const Danger: Story = { args: { message: "支付失败，请稍后重试", tone: "danger" } };
export const ProviderQueue: Story = {
  render: () => (
    <ToastProvider maxToasts={4}>
      <ProviderPreview />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const buttons = Array.from(canvasElement.querySelectorAll<HTMLButtonElement>("button"));
    const show = buttons.find((button) => button.textContent === "显示同步");
    const replace = buttons.find((button) => button.textContent === "同 ID 替换");
    const enqueue = buttons.find((button) => button.textContent === "加入第二条");
    const clear = buttons.find((button) => button.textContent === "清空队列");
    if (!show || !replace || !enqueue || !clear) {
      throw new window.Error("Expected ToastProvider queue controls");
    }
    const body = canvasElement.ownerDocument.body;

    show.click();
    await waitForStory(() => {
      const status = body.querySelector('[role="status"]');
      return status !== null && status.textContent === "正在同步";
    }, "Expected first provider Toast");
    replace.click();
    await waitForStory(() => {
      const status = body.querySelector('[role="status"]');
      return status !== null && status.textContent === "同步完成";
    }, "Expected same-id Toast replacement");
    enqueue.click();
    if (body.querySelectorAll('[data-meu-component="toast"]').length !== 1) {
      throw new window.Error("ToastProvider rendered more than its FIFO head");
    }
    clear.click();
    const reasons = canvasElement.querySelector<HTMLOutputElement>("[data-toast-close-reasons]");
    await waitForStory(
      () =>
        body.querySelector('[role="status"], [role="alert"]') === null &&
        reasons !== null &&
        reasons.textContent === "sync:clear,stock:clear",
      "Expected clear to close active and queued Toasts exactly once"
    );
  }
};

export const ProviderAnnouncementThrottle: Story = {
  render: () => (
    <ToastProvider>
      <AnnouncementThrottlePreview />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const buttons = Array.from(canvasElement.querySelectorAll<HTMLButtonElement>("button"));
    const start = buttons.find((button) => button.textContent === "开始上传");
    const update25 = buttons.find((button) => button.textContent === "更新 25%");
    const update75 = buttons.find((button) => button.textContent === "更新 75%");
    const danger = buttons.find((button) => button.textContent === "升级错误");
    const warning = buttons.find((button) => button.textContent === "更新警告");
    if (!start || !update25 || !update75 || !danger || !warning) {
      throw new window.Error("Expected Toast announcement controls");
    }
    const body = canvasElement.ownerDocument.body;
    const hasText = (selector: string, expected: string) => {
      const element = body.querySelector(selector);
      return element !== null && element.textContent === expected;
    };

    start.click();
    await waitForStory(
      () => hasText('[role="status"]', "上传 0%"),
      "Expected initial polite announcement"
    );

    update25.click();
    update75.click();
    const visibleMessage = body.querySelector<HTMLElement>("[data-meu-toast-message]");
    const pendingStatus = body.querySelector<HTMLElement>('[role="status"]');
    if (
      visibleMessage === null ||
      visibleMessage.textContent !== "上传 75%" ||
      pendingStatus === null ||
      pendingStatus.textContent !== ""
    ) {
      throw new window.Error("Rapid replacements did not update visually and prime the announcer");
    }
    await waitForStory(
      () => hasText('[role="status"]', "上传 75%"),
      "Expected coalesced latest progress announcement"
    );

    danger.click();
    await waitForStory(
      () => hasText('[role="alert"]', "上传失败，请检查网络"),
      "Expected urgent escalation to announce immediately"
    );

    warning.click();
    const pendingAlert = body.querySelector<HTMLElement>('[role="alert"]');
    const latestVisibleMessage = body.querySelector<HTMLElement>("[data-meu-toast-message]");
    if (
      latestVisibleMessage === null ||
      latestVisibleMessage.textContent !== "正在重新连接" ||
      pendingAlert === null ||
      pendingAlert.textContent !== ""
    ) {
      throw new window.Error("Assertive replacement did not enter the coalescing window");
    }
    await waitForStory(
      () => hasText('[role="alert"]', "正在重新连接"),
      "Expected the latest assertive replacement after the coalescing window"
    );
  }
};
