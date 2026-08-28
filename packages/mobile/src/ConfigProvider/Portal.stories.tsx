import { Portal } from "@meu/primitives-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

function CustomContainerDemo() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <section>
      <p style={{ color: "var(--meu-color-muted)", margin: "0 0 12px" }}>
        下方绿色内容由 Portal 渲染，但 DOM 实际位于虚线目标容器中。
      </p>
      <div
        ref={setContainer}
        aria-label="Portal 目标容器"
        role="region"
        style={{
          border: "1px dashed var(--meu-color-border)",
          borderRadius: "var(--meu-radius-surface)",
          minHeight: 112,
          padding: 16
        }}
      />
      {container ? (
        <Portal container={container}>
          <div
            style={{
              background: "var(--meu-color-subtle)",
              borderRadius: "var(--meu-radius-control)",
              color: "var(--meu-color-accent)",
              fontWeight: 700,
              padding: 16
            }}
          >
            Portal 内容已挂载到自定义容器
          </div>
        </Portal>
      ) : null}
    </section>
  );
}

const meta = {
  title: "Foundation/Portal",
  component: Portal,
  args: { children: null }
} satisfies Meta<typeof Portal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CustomContainer: Story = {
  render: () => <CustomContainerDemo />
};
