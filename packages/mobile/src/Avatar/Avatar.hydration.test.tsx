// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { createRef } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Avatar } from "./Avatar";

describe("Avatar hydration", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("hydrates loading markup without recovery errors and preserves refs and fallback state", async () => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(false);
    const recoverableErrors: unknown[] = [];
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const rootRef = createRef<HTMLSpanElement>();
    const imageRef = createRef<HTMLImageElement>();
    const serverElement = (
      <Avatar src="/avatar.jpg" alt="Ada Lovelace" initials="AL" loading="lazy" />
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(serverElement);
    document.body.append(container);

    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(
        container,
        <Avatar
          ref={rootRef}
          imageRef={imageRef}
          src="/avatar.jpg"
          alt="Ada Lovelace"
          initials="AL"
          loading="lazy"
        />,
        { onRecoverableError: (error) => recoverableErrors.push(error) }
      );
      await Promise.resolve();
    });

    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
    expect(rootRef.current).toBe(container.querySelector('[data-meu-component="avatar"]'));
    expect(imageRef.current).toBe(container.querySelector("img"));

    fireEvent.error(imageRef.current!);
    const failedImage = container.querySelector('[data-state="error"]');
    const namedFallback = container.querySelector('[role="img"]');
    expect(failedImage && failedImage.textContent).toContain("AL");
    expect(namedFallback && namedFallback.getAttribute("aria-label")).toBe("Ada Lovelace");
    expect(imageRef.current).toBeNull();

    await act(() => {
      if (root) root.unmount();
      return Promise.resolve();
    });
  });
});
