import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../Button";
import { waitForStory } from "../storyTestUtils";
import { Popup } from "./Popup";
import type { PopupProps } from "./types";

function PopupPreview(props: PopupProps) {
  const [open, setOpen] = useState(false);
  const [lastChange, setLastChange] = useState("尚未关闭");
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开 Popup</Button>
      <span hidden data-popup-change>
        {lastChange}
      </span>
      <Popup
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

const popupContent = (
  <div style={{ display: "grid", gap: 16, padding: 24 }}>
    <h3 style={{ margin: 0 }}>配送方式</h3>
    <p style={{ margin: 0 }}>请选择适合当前订单的配送方式。</p>
    <Button>确认配送</Button>
  </div>
);

const meta = {
  title: "Feedback/Popup",
  component: Popup,
  args: {
    "aria-label": "配送方式",
    children: popupContent,
    closeOnMaskClick: true,
    showCloseButton: true
  },
  render: (args) => <PopupPreview {...args} />
} satisfies Meta<typeof Popup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bottom: Story = {
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLButtonElement>("button");
    if (!trigger) throw new window.Error("Expected Popup trigger");

    trigger.click();
    const body = canvasElement.ownerDocument.body;
    await waitForStory(
      () => body.querySelector('[role="dialog"][aria-label="配送方式"]') !== null,
      "Popup did not open in its portal"
    );
    const dialog = body.querySelector<HTMLElement>('[role="dialog"][aria-label="配送方式"]');
    const close = body.querySelector<HTMLButtonElement>('button[aria-label="关闭"]');
    if (!dialog || !close) throw new window.Error("Popup did not open in its portal");
    if (dialog.getAttribute("aria-modal") !== "true") {
      throw new window.Error("Popup did not expose modal dialog semantics");
    }
    await waitForStory(
      () => canvasElement.ownerDocument.activeElement === close,
      "Popup did not move focus into the dialog"
    );

    close.click();
    const change = canvasElement.querySelector<HTMLElement>("[data-popup-change]");
    await waitForStory(
      () =>
        Boolean(change && change.textContent === "关闭:close-button") &&
        canvasElement.ownerDocument.activeElement === trigger,
      "Popup did not report its close callback and restore trigger focus"
    );
  }
};
export const Top: Story = { args: { position: "top" } };
export const Left: Story = { args: { position: "left" } };
export const Right: Story = { args: { position: "right" } };
