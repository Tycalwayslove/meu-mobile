import { Portal } from "@meu/primitives-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { createContext, useCallback, useContext, useRef, useState } from "react";

const CrossDocumentContext = createContext("missing-provider");

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

function CrossDocumentValue() {
  return <span data-provider-value>{useContext(CrossDocumentContext)}</span>;
}

function CrossDocumentDemo() {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [logicalClicks, setLogicalClicks] = useState(0);
  const initializeFrame = useCallback((frame: HTMLIFrameElement | null) => {
    const frameDocument = frame ? frame.contentDocument : null;
    if (!frameDocument) return;
    if (!frameDocument.getElementById("portal-target")) {
      frameDocument.open();
      frameDocument.write(
        '<!doctype html><html lang="zh-CN"><body><h1>跨 Document Portal</h1><main id="portal-target"></main></body></html>'
      );
      frameDocument.close();
    }
    setContainer(frameDocument.getElementById("portal-target"));
  }, []);

  return (
    <CrossDocumentContext.Provider value="provider-preserved">
      {/* The handler proves React's logical Portal path; this section is not an interactive surface. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <section onClick={() => setLogicalClicks((count) => count + 1)}>
        <p style={{ color: "var(--meu-color-muted)", margin: "0 0 12px" }}>
          下方按钮由当前 React 树渲染到真实 iframe Document；Context 与 React 事件仍沿逻辑树连接。
        </p>
        <iframe
          ref={initializeFrame}
          style={{ border: "1px dashed var(--meu-color-border)", minHeight: 96, width: "100%" }}
          title="跨 Document Portal 目标"
        />
        <output data-logical-clicks>逻辑树点击：{logicalClicks}</output>
        <Portal container={container}>
          <button data-cross-document-action type="button">
            <CrossDocumentValue />
          </button>
        </Portal>
      </section>
    </CrossDocumentContext.Provider>
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

export const CrossDocument: Story = {
  render: () => <CrossDocumentDemo />,
  play: async ({ canvasElement }) => {
    const frame = canvasElement.querySelector<HTMLIFrameElement>(
      'iframe[title="跨 Document Portal 目标"]'
    );
    if (!frame) throw new window.Error("Expected the Portal iframe");

    const deadline = window.performance.now() + 2_000;
    let action: HTMLButtonElement | null = null;
    while (!action) {
      const frameDocument = frame.contentDocument;
      action = frameDocument
        ? frameDocument.querySelector<HTMLButtonElement>("[data-cross-document-action]")
        : null;
      if (action) break;
      if (window.performance.now() >= deadline) {
        throw new window.Error("Expected Portal content in the iframe document");
      }
      await new Promise<void>((resolve) => window.setTimeout(resolve, 16));
    }

    const providerValue = action.querySelector("[data-provider-value]");
    if (
      action.ownerDocument !== frame.contentDocument ||
      !providerValue ||
      providerValue.textContent !== "provider-preserved"
    ) {
      throw new window.Error("Expected iframe ownership and preserved Provider context");
    }
    action.click();
    await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
    const logicalClicks = canvasElement.querySelector("[data-logical-clicks]");
    if (!logicalClicks || logicalClicks.textContent !== "逻辑树点击：1") {
      throw new window.Error("Expected the iframe click to bubble through the logical React tree");
    }
  }
};
