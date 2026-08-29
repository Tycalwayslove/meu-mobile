import { Portal } from "@meu/primitives-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useCallback, useRef, useState } from "react";

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

function LazyRefContainerDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const getContainer = useCallback(() => containerRef.current, []);

  return (
    <section>
      <p style={{ color: "var(--meu-color-muted)", margin: "0 0 12px" }}>
        惰性 resolver 可以读取同次提交才挂载的目标 ref。
      </p>
      <div
        ref={containerRef}
        aria-label="惰性 Portal 目标容器"
        role="region"
        style={{
          border: "1px dashed var(--meu-color-border)",
          borderRadius: "var(--meu-radius-surface)",
          minHeight: 112,
          padding: 16
        }}
      />
      <Portal container={getContainer}>
        <div
          style={{
            background: "var(--meu-color-subtle)",
            borderRadius: "var(--meu-radius-control)",
            color: "var(--meu-color-accent)",
            fontWeight: 700,
            padding: 16
          }}
        >
          同次提交后已移动到 ref 容器
        </div>
      </Portal>
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
  render: () => <CustomContainerDemo />,
  play: async ({ canvasElement }) => {
    const target = canvasElement.querySelector<HTMLElement>('[role="region"]');
    const content = canvasElement.querySelector<HTMLElement>('[role="region"] > div');
    await Promise.resolve();
    if (!target || !content) throw new window.Error("Expected Portal target and content");
    if (
      content.parentElement !== target ||
      content.textContent !== "Portal 内容已挂载到自定义容器"
    ) {
      throw new window.Error("Expected Portal content inside the custom target");
    }
  }
};

export const LazyRefContainer: Story = {
  render: () => <LazyRefContainerDemo />,
  play: async ({ canvasElement }) => {
    const target = canvasElement.querySelector<HTMLElement>('[role="region"]');
    await Promise.resolve();
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
    const content = target ? target.firstElementChild : null;
    if (!target || !content || content.parentElement !== target) {
      throw new window.Error("Expected lazy Portal content inside the ref-backed target");
    }
  }
};
