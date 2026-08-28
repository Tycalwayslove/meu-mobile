// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { ImageUploader } from "./ImageUploader";
import type { ImageUploaderItem, ImageUploaderRef, ImageUploaderUploadContext } from "./types";

const existingItem: ImageUploaderItem = {
  alt: "商品正面",
  key: "front",
  name: "front.jpg",
  url: "/front.jpg"
};

function choose(files: File[]) {
  const input = screen.getByLabelText<HTMLInputElement>("添加图片");
  fireEvent.change(input, { target: { files } });
}

beforeEach(() => {
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn((file: File) => `blob:${file.name}`),
    revokeObjectURL: vi.fn()
  });
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: false,
      media: "",
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn()
    }))
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      disconnect() {}
      observe() {}
      takeRecords() {
        return [];
      }
      unobserve() {}
    }
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      disconnect() {}
      observe() {}
      unobserve() {}
    }
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ImageUploader", () => {
  it("server-renders without browser globals", () => {
    expect(
      renderToString(
        <ImageUploader value={[existingItem]} upload={vi.fn()} aria-label="商品图片" />
      )
    ).toContain('data-meu-component="image-uploader"');
  });

  it("uses the native file input, reports progress and publishes successful serializable items", async () => {
    let uploadContext: ImageUploaderUploadContext | undefined;
    let finishUpload: ((item: ImageUploaderItem) => void) | undefined;
    const upload = vi.fn(
      (_file: File, context: ImageUploaderUploadContext) =>
        new Promise<ImageUploaderItem>((resolve) => {
          uploadContext = context;
          finishUpload = resolve;
        })
    );
    const onChange = vi.fn();
    const onUploadQueueChange = vi.fn();
    render(
      <ImageUploader
        upload={upload}
        onChange={onChange}
        onUploadQueueChange={onUploadQueueChange}
      />
    );

    const file = new File(["photo"], "product.jpg", { type: "image/jpeg" });
    choose([file]);
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
    expect(uploadContext && uploadContext.signal.aborted).toBe(false);
    act(() => {
      if (!uploadContext) throw new Error("Expected upload context");
      uploadContext.onProgress(64);
    });
    await waitFor(() => expect(screen.getByText("64%")).toBeTruthy());
    expect(onUploadQueueChange).toHaveBeenCalledWith([
      expect.objectContaining({ file, name: "product.jpg", progress: 64, status: "uploading" })
    ]);

    const uploaded = { alt: "商品图", key: "uploaded", url: "/uploaded.jpg" };
    act(() => {
      if (!finishUpload) throw new Error("Expected upload resolver");
      finishUpload(uploaded);
    });
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(onChange).toHaveBeenCalledWith([uploaded], { item: uploaded, reason: "upload" });
    expect(screen.getByRole("button", { name: "商品图，预览" })).toBeTruthy();
  });

  it("validates accept, max size, beforeUpload and max count before transport", async () => {
    const upload = vi
      .fn<(_: File, context: ImageUploaderUploadContext) => Promise<ImageUploaderItem>>()
      .mockResolvedValue({ alt: "图片", url: "/image.jpg" });
    const onReject = vi.fn();
    const onCountExceed = vi.fn();
    render(
      <ImageUploader
        value={[existingItem]}
        upload={upload}
        multiple
        accept="image/jpeg"
        maxSize={5}
        maxCount={2}
        beforeUpload={(file) => (file.name === "skip.jpg" ? null : file)}
        onReject={onReject}
        onCountExceed={onCountExceed}
      />
    );

    const wrongType = new File(["x"], "wrong.png", { type: "image/png" });
    const tooLarge = new File(["123456"], "large.jpg", { type: "image/jpeg" });
    const skipped = new File(["x"], "skip.jpg", { type: "image/jpeg" });
    const first = new File(["x"], "first.jpg", { type: "image/jpeg" });
    const excess = new File(["x"], "excess.jpg", { type: "image/jpeg" });
    choose([wrongType, tooLarge, skipped, first, excess]);

    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
    const uploadCall = upload.mock.calls[0];
    if (!uploadCall) throw new Error("Expected one upload call");
    expect(uploadCall[0]).toBe(first);
    expect(typeof uploadCall[1].taskId).toBe("string");
    expect(onReject).toHaveBeenCalledWith(expect.objectContaining({ reason: "accept" }));
    expect(onReject).toHaveBeenCalledWith(expect.objectContaining({ reason: "max-size" }));
    expect(onReject).toHaveBeenCalledWith(expect.objectContaining({ reason: "before-upload" }));
    expect(onReject).toHaveBeenCalledWith(expect.objectContaining({ reason: "max-count" }));
    expect(onCountExceed).toHaveBeenCalledWith(1);
  });

  it("keeps a controlled value authoritative, supports delete veto and opens ImageViewer", async () => {
    const onChange = vi.fn();
    const onPreview = vi.fn();
    const onDelete = vi.fn().mockResolvedValue(false);
    const { rerender } = render(
      <ImageUploader
        value={[existingItem]}
        upload={vi.fn()}
        onChange={onChange}
        onDelete={onDelete}
        onPreview={onPreview}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "商品正面，预览" }));
    expect(onPreview).toHaveBeenCalledWith(existingItem, 0);
    expect(screen.getByRole("dialog", { name: "图片预览" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "关闭图片预览" }));

    fireEvent.click(screen.getByRole("button", { name: "删除 商品正面" }));
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith(existingItem));
    expect(onChange).not.toHaveBeenCalled();

    onDelete.mockResolvedValue(true);
    fireEvent.click(screen.getByRole("button", { name: "删除 商品正面" }));
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith([], { item: existingItem, reason: "remove" })
    );
    expect(screen.getByRole("button", { name: "商品正面，预览" })).toBeTruthy();
    rerender(<ImageUploader value={[]} upload={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "商品正面，预览" })).toBeNull();
  });

  it("retains failed tasks for retry and exposes a focusable native input through ref", async () => {
    const ref = createRef<ImageUploaderRef>();
    const uploaded = { alt: "重试成功", url: "/retry.jpg" };
    const upload = vi
      .fn<(_: File, context: ImageUploaderUploadContext) => Promise<ImageUploaderItem>>()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(uploaded);
    const onChange = vi.fn();
    render(<ImageUploader ref={ref} upload={upload} onChange={onChange} />);

    choose([new File(["x"], "retry.jpg", { type: "image/jpeg" })]);
    const retry = await screen.findByRole("button", { name: "重试" });
    expect(ref.current && ref.current.input).toBe(screen.getByLabelText("添加图片"));
    fireEvent.click(retry);
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith([uploaded], { item: uploaded, reason: "upload" })
    );
  });

  it("aborts an in-flight upload when its task is removed", async () => {
    let context: ImageUploaderUploadContext | undefined;
    const upload = vi.fn(
      (_file: File, uploadContext: ImageUploaderUploadContext) =>
        new Promise<ImageUploaderItem>(() => {
          context = uploadContext;
        })
    );
    render(<ImageUploader upload={upload} />);
    choose([new File(["x"], "cancel.jpg", { type: "image/jpeg" })]);
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button", { name: "删除 cancel.jpg" }));
    expect(context && context.signal.aborted).toBe(true);
  });

  it("inherits Field semantics and disables mutation in read-only mode", () => {
    render(
      <Field label="商品图片" description="最多上传一张" error="请上传商品图片" required>
        <ImageUploader value={[existingItem]} upload={vi.fn()} readOnly />
      </Field>
    );
    const input = screen.getByLabelText<HTMLInputElement>(/商品图片/);
    expect(input.disabled).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toContain("description");
    expect(input.getAttribute("aria-describedby")).toContain("error");
    expect(screen.queryByRole("button", { name: "删除 商品正面" })).toBeNull();
  });
});
