// @vitest-environment jsdom
import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ImageUploader } from "./ImageUploader";

describe("ImageUploader hydration", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("reuses completed-item and native-input markup without starting transport", async () => {
    const upload = vi.fn();
    const recoverableErrors: unknown[] = [];
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const element = (
      <ImageUploader
        aria-label="商品图片"
        value={[{ alt: "商品正面", key: "front", url: "/front.jpg" }]}
        upload={upload}
      />
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    const serverGroup = container.querySelector('[data-meu-component="image-uploader"]');
    const serverInput = container.querySelector('input[type="file"]');

    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, element, {
        onRecoverableError: (error) => recoverableErrors.push(error)
      });
      await Promise.resolve();
    });

    expect(container.querySelector('[data-meu-component="image-uploader"]')).toBe(serverGroup);
    expect(container.querySelector('input[type="file"]')).toBe(serverInput);
    const hydratedInput = container.querySelector('input[type="file"]');
    expect(hydratedInput && hydratedInput.getAttribute("accept")).toBe("image/*");
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();

    await act(() => {
      if (root) root.unmount();
      return Promise.resolve();
    });
  });
});
