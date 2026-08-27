import type { Meta, StoryObj } from "@storybook/react-vite";

import { SafeArea } from "./SafeArea";

const meta = { title: "Layout/SafeArea", component: SafeArea } satisfies Meta<typeof SafeArea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Bottom: Story = {
  render: () => (
    <div style={{ background: "var(--meu-color-subtle)" }}>
      <SafeArea />
    </div>
  )
};
export const Top: Story = {
  render: () => (
    <div style={{ background: "var(--meu-color-subtle)" }}>
      <SafeArea position="top" />
    </div>
  )
};
