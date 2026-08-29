// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { createRef } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PaginationDots } from "./PaginationDots";

describe("PaginationDots hydration", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("hydrates interactive controls without recoverable errors and restores the public ref", async () => {
    const onChange = vi.fn();
    const recoverableErrors: unknown[] = [];
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const ref = createRef<HTMLDivElement>();
    const serverMarkup = renderToString(
      <PaginationDots activeIndex={2} count={12} interactive aria-label="商品分页" />
    );
    const container = document.createElement("div");
    container.innerHTML = serverMarkup;
    document.body.append(container);

    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(
        container,
        <PaginationDots
          ref={ref}
          activeIndex={2}
          count={12}
          interactive
          aria-label="商品分页"
          onChange={onChange}
        />,
        { onRecoverableError: (error) => recoverableErrors.push(error) }
      );
      await Promise.resolve();
    });

    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
    expect(ref.current).toBe(container.querySelector('[role="group"]'));
    const target = container.querySelector<HTMLButtonElement>('[data-page-index="3"]');
    fireEvent.click(target!);
    expect(onChange).toHaveBeenCalledWith(3, expect.anything());
    await act(() => {
      if (root) root.unmount();
      return Promise.resolve();
    });
  });
});
