import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../Button";
import { Popup } from "./Popup";
import type { PopupProps } from "./types";

function PopupPreview(props: PopupProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开 Popup</Button>
      <Popup {...props} open={open} onOpenChange={(nextOpen) => setOpen(nextOpen)} />
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

export const Bottom: Story = {};
export const Top: Story = { args: { position: "top" } };
export const Left: Story = { args: { position: "left" } };
export const Right: Story = { args: { position: "right" } };
