import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { ThemeProvider } from "../ConfigProvider";
import { ImageUploader } from "./ImageUploader";
import type { ImageUploaderItem, ImageUploaderUploadContext } from "./types";

function demoImage(label: string, background: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480"><rect width="480" height="480" rx="48" fill="${background}"/><circle cx="240" cy="190" r="80" fill="#ffffff" opacity=".74"/><path d="M100 390 210 270l70 70 54-56 66 106Z" fill="#ffffff" opacity=".86"/><text x="240" y="448" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="24">${label}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const initialItems: ImageUploaderItem[] = [
  { alt: "商品正面", key: "front", name: "front.jpg", url: demoImage("Front", "#176B5B") },
  { alt: "商品侧面", key: "side", name: "side.jpg", url: demoImage("Side", "#A45C13") }
];

async function simulateUpload(file: File, context: ImageUploaderUploadContext) {
  context.onProgress(32);
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, 600);
    context.signal.addEventListener("abort", () => {
      window.clearTimeout(timer);
      reject(new DOMException("Upload aborted", "AbortError"));
    });
  });
  context.onProgress(82);
  await new Promise<void>((resolve) => window.setTimeout(resolve, 300));
  if (file.name.toLowerCase().includes("fail")) throw new Error("Story upload failure");
  return {
    alt: file.name,
    key: `${file.name}-${file.lastModified}`,
    name: file.name,
    url: demoImage(file.name, "#287A52")
  };
}

function ControlledPreview({ readOnly = false }: { readOnly?: boolean }) {
  const [items, setItems] = useState(initialItems);
  const [message, setMessage] = useState("选择图片开始本地模拟上传");
  return (
    <div style={{ display: "grid", gap: 12, width: "min(100%, 420px)" }}>
      <ImageUploader
        aria-label="商品图片"
        value={items}
        upload={simulateUpload}
        multiple
        maxCount={6}
        readOnly={readOnly}
        onChange={(nextItems, details) => {
          setItems(nextItems);
          setMessage(`${details.reason === "upload" ? "上传完成" : "已删除"}：${details.item.alt}`);
        }}
        onReject={(details) =>
          setMessage(`已拒绝 ${details.rejected.length} 个文件：${details.reason}`)
        }
      />
      <output aria-live="polite">{message}</output>
    </div>
  );
}

const meta = {
  title: "Data Entry/ImageUploader",
  component: ImageUploader,
  args: { upload: simulateUpload },
  parameters: { layout: "padded" }
} satisfies Meta<typeof ImageUploader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = { render: () => <ControlledPreview /> };

export const Empty: Story = {
  args: { "aria-label": "空图片列表", defaultValue: [], columns: 4 }
};

export const Full: Story = {
  args: {
    "aria-label": "已满图片列表",
    value: initialItems,
    maxCount: 2
  }
};

export const ReadOnly: Story = { render: () => <ControlledPreview readOnly /> };

export const ValidationError: Story = {
  args: {
    "aria-label": "错误图片列表",
    value: initialItems,
    status: "error"
  }
};

export const Interaction: Story = {
  render: () => <ControlledPreview />,
  play: async ({ canvasElement }) => {
    const preview = canvasElement.querySelector<HTMLButtonElement>("button[aria-label$='预览']");
    if (!preview) throw new window.Error("Expected an image preview button");
    preview.click();
    await Promise.resolve();
    const close = document.querySelector<HTMLButtonElement>("button[aria-label='关闭图片预览']");
    if (!close) throw new window.Error("ImageViewer did not open from ImageUploader");
    close.click();
  }
};

export const LightAndDark: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      {(["light", "dark"] as const).map((theme) => (
        <ThemeProvider key={theme} theme={theme} style={{ padding: 16 }}>
          <ImageUploader
            aria-label={`${theme} 商品图片`}
            value={initialItems}
            upload={simulateUpload}
            maxCount={3}
          />
        </ThemeProvider>
      ))}
    </div>
  )
};
