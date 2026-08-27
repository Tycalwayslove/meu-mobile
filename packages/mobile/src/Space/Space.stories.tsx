import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../Button";
import { Space } from "./Space";

const meta = { title: "Layout/Space", component: Space } satisfies Meta<typeof Space>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <Space>
      <Button>保存</Button>
      <Button variant="outline">取消</Button>
    </Space>
  )
};
export const Vertical: Story = {
  render: () => (
    <Space direction="vertical" align="stretch">
      <Button>主要操作</Button>
      <Button variant="outline">次要操作</Button>
    </Space>
  )
};
