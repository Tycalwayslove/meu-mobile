import type { Meta, StoryObj } from "@storybook/react-vite";

import { Divider } from "./Divider";

const meta = { title: "Layout/Divider", component: Divider } satisfies Meta<typeof Divider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithContent: Story = { args: { children: "订单信息" } };
export const StartAligned: Story = { args: { align: "start", children: "更多信息" } };
