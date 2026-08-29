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
    const html = renderToString(
      <ImageUploader
        value={[existingItem]}
        upload={vi.fn()}
        aria-label="商品图片"
        aria-invalid="spelling"
      />
    );
    expect(html).toContain('data-meu-component="image-uploader"');
    expect(html).toContain('aria-invalid="spelling"');
    expect(html.match(/aria-invalid=/g)).toHaveLength(1);
  });

  it("keeps native aria-invalid tokens on the uploader group", () => {
    const upload = vi.fn();
    const { rerender } = render(
      <ImageUploader upload={upload} aria-label="商品图片" aria-invalid={false} />
    );
    const group = screen.getByRole("group", { name: "商品图片" });
    const input = group.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) throw new Error("Expected native file input");
    expect(group.getAttribute("aria-invalid")).toBe("false");
    expect(input.getAttribute("aria-invalid")).toBeNull();

    rerender(<ImageUploader upload={upload} aria-label="商品图片" aria-invalid="grammar" />);
    expect(group.getAttribute("aria-invalid")).toBe("grammar");
    expect(group.getAttribute("data-state")).toBe("error");

    rerender(<ImageUploader upload={upload} aria-label="商品图片" aria-invalid="spelling" />);
    expect(group.getAttribute("aria-invalid")).toBe("spelling");

    rerender(
      <ImageUploader upload={upload} aria-label="商品图片" aria-invalid="grammar" status="error" />
    );
    expect(group.getAttribute("aria-invalid")).toBe("true");
    expect(group.querySelectorAll("[aria-invalid]")).toHaveLength(0);
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

  it("reserves max-count capacity across concurrent asynchronous preprocessing", async () => {
    const preprocessing = new Map<string, (file: File) => void>();
    const beforeUpload = vi.fn(
      (file: File) =>
        new Promise<File>((resolve) => {
          preprocessing.set(file.name, resolve);
        })
    );
    const upload = vi
      .fn<(_: File, context: ImageUploaderUploadContext) => Promise<ImageUploaderItem>>()
      .mockImplementation(() => new Promise(() => {}));
    const onCountExceed = vi.fn();
    const onReject = vi.fn();
    render(
      <ImageUploader
        upload={upload}
        beforeUpload={beforeUpload}
        maxCount={1}
        onCountExceed={onCountExceed}
        onReject={onReject}
      />
    );

    const first = new File(["a"], "first.jpg", { type: "image/jpeg" });
    const second = new File(["b"], "second.jpg", { type: "image/jpeg" });
    choose([first]);
    choose([second]);
    await waitFor(() => expect(beforeUpload).toHaveBeenCalledTimes(2));

    await act(async () => {
      const finishFirst = preprocessing.get("first.jpg");
      const finishSecond = preprocessing.get("second.jpg");
      if (!finishFirst || !finishSecond) throw new Error("Expected preprocessing resolvers");
      finishFirst(first);
      finishSecond(second);
      await Promise.resolve();
    });

    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
    const uploadCall = upload.mock.calls[0];
    if (!uploadCall) throw new Error("Expected one upload call");
    expect(uploadCall[0]).toBe(first);
    expect(onCountExceed).toHaveBeenCalledWith(1);
    expect(onReject).toHaveBeenCalledWith(
      expect.objectContaining({ reason: "max-count", rejected: [second] })
    );
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
    render(<ImageUploader ref={ref} upload={upload} onChange={onChange} maxCount={1} />);

    choose([new File(["x"], "retry.jpg", { type: "image/jpeg" })]);
    const retry = await screen.findByRole("button", { name: "重试" });
    expect(ref.current && ref.current.input).toBe(screen.getByLabelText("添加图片"));
    expect(ref.current && ref.current.input && ref.current.input.disabled).toBe(true);
    expect(screen.queryByRole("button", { name: "添加图片" })).toBeNull();
    fireEvent.click(retry);
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith([uploaded], { item: uploaded, reason: "upload" })
    );
  });

  it("blocks a failed-task retry when controlled items already exceed its reserved capacity", async () => {
    const file = new File(["x"], "retry.jpg", { type: "image/jpeg" });
    const upload = vi
      .fn<(_: File, context: ImageUploaderUploadContext) => Promise<ImageUploaderItem>>()
      .mockRejectedValue(new Error("network"));
    const onCountExceed = vi.fn();
    const onReject = vi.fn();
    const { rerender } = render(
      <ImageUploader
        value={[]}
        upload={upload}
        maxCount={1}
        onCountExceed={onCountExceed}
        onReject={onReject}
      />
    );

    choose([file]);
    const retry = await screen.findByRole("button", { name: "重试" });
    rerender(
      <ImageUploader
        value={[existingItem]}
        upload={upload}
        maxCount={1}
        onCountExceed={onCountExceed}
        onReject={onReject}
      />
    );
    fireEvent.click(retry);

    expect(upload).toHaveBeenCalledTimes(1);
    expect(onCountExceed).toHaveBeenCalledWith(1);
    expect(onReject).toHaveBeenCalledWith({
      accepted: [],
      files: [file],
      reason: "max-count",
      rejected: [file]
    });
  });

  it("reports rejected preprocessing and contains rejected deletion hooks", async () => {
    const file = new File(["x"], "rejected.jpg", { type: "image/jpeg" });
    const upload = vi.fn();
    const onChange = vi.fn();
    const onReject = vi.fn();
    const onDelete = vi.fn().mockRejectedValue(new Error("delete failed"));
    render(
      <ImageUploader
        defaultValue={[existingItem]}
        upload={upload}
        beforeUpload={() => Promise.reject(new Error("preprocessing failed"))}
        onChange={onChange}
        onDelete={onDelete}
        onReject={onReject}
      />
    );

    choose([file]);
    await waitFor(() =>
      expect(onReject).toHaveBeenCalledWith({
        accepted: [],
        files: [file],
        reason: "before-upload",
        rejected: [file]
      })
    );
    expect(upload).not.toHaveBeenCalled();

    const remove = screen.getByRole("button", { name: "删除 商品正面" });
    fireEvent.click(remove);
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith(existingItem));
    await waitFor(() => expect(remove).toHaveProperty("disabled", false));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "商品正面，预览" })).toBeTruthy();
  });

  it("does not start or publish asynchronous hook work after unmount", async () => {
    let finishPreprocessing: ((file: File) => void) | undefined;
    const file = new File(["x"], "pending.jpg", { type: "image/jpeg" });
    const upload = vi.fn();
    const onReject = vi.fn();
    const first = render(
      <ImageUploader
        upload={upload}
        beforeUpload={() =>
          new Promise<File>((resolve) => {
            finishPreprocessing = resolve;
          })
        }
        onReject={onReject}
      />
    );
    choose([file]);
    await waitFor(() => expect(finishPreprocessing).toBeTruthy());
    first.unmount();
    await act(async () => {
      if (!finishPreprocessing) throw new Error("Expected preprocessing resolver");
      finishPreprocessing(file);
      await Promise.resolve();
    });
    expect(upload).not.toHaveBeenCalled();
    expect(onReject).not.toHaveBeenCalled();

    let rejectDelete: ((error: Error) => void) | undefined;
    const onChange = vi.fn();
    const second = render(
      <ImageUploader
        defaultValue={[existingItem]}
        upload={vi.fn()}
        onChange={onChange}
        onDelete={() =>
          new Promise<void>((_resolve, reject) => {
            rejectDelete = reject;
          })
        }
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "删除 商品正面" }));
    await waitFor(() => expect(rejectDelete).toBeTruthy());
    second.unmount();
    await act(async () => {
      if (!rejectDelete) throw new Error("Expected delete rejecter");
      rejectDelete(new Error("late delete rejection"));
      await Promise.resolve();
    });
    expect(onChange).not.toHaveBeenCalled();
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
        <ImageUploader value={[existingItem]} upload={vi.fn()} readOnly aria-invalid="grammar" />
      </Field>
    );
    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) throw new Error("Expected native file input");
    expect(input.disabled).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBeNull();
    expect(input.getAttribute("aria-describedby")).toContain("description");
    expect(input.getAttribute("aria-describedby")).toContain("error");
    expect(screen.queryByRole("button", { name: "删除 商品正面" })).toBeNull();
    const group = screen.getByRole("group", { name: /商品图片/ });
    expect(group.getAttribute("data-state")).toBe("error");
    expect(group.getAttribute("aria-invalid")).toBe("true");
    expect(group.querySelectorAll("[aria-invalid]")).toHaveLength(0);
  });

  it("exposes task progress semantics and locks an asynchronous delete", async () => {
    let uploadContext: ImageUploaderUploadContext | undefined;
    const upload = vi.fn(
      (_file: File, context: ImageUploaderUploadContext) =>
        new Promise<ImageUploaderItem>(() => {
          uploadContext = context;
        })
    );
    let approveDelete: (() => void) | undefined;
    const onDelete = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          approveDelete = resolve;
        })
    );
    render(
      <ImageUploader
        aria-label="商品图片"
        defaultValue={[existingItem]}
        upload={upload}
        onDelete={onDelete}
      />
    );

    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) throw new Error("Expected native file input");
    fireEvent.change(input, {
      target: { files: [new File(["x"], "progress.jpg", { type: "image/jpeg" })] }
    });
    await waitFor(() => expect(uploadContext).toBeTruthy());
    act(() => {
      if (uploadContext) uploadContext.onProgress(42);
    });
    const progress = await screen.findByRole("progressbar", { name: "progress.jpg" });
    expect(progress.getAttribute("aria-valuenow")).toBe("42");

    const remove = screen.getByRole("button", { name: "删除 商品正面" });
    fireEvent.click(remove);
    await waitFor(() => expect(remove).toHaveProperty("disabled", true));
    fireEvent.click(remove);
    expect(onDelete).toHaveBeenCalledTimes(1);
    await act(async () => {
      if (approveDelete) approveDelete();
      await Promise.resolve();
    });
    await waitFor(() => expect(screen.queryByRole("button", { name: "删除 商品正面" })).toBeNull());
  });
});
