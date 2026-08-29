// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Rate } from "./Rate";

const roots: Array<ReturnType<typeof hydrateRoot>> = [];

afterEach(async () => {
  await act(() => {
    for (const root of roots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  vi.restoreAllMocks();
});

describe("Rate hydration", () => {
  it("preserves interactive and read-only form nodes without recoverable errors", async () => {
    const onChange = vi.fn();
    const element = (
      <form>
        <Rate aria-label="评分" defaultValue={2.5} allowHalf name="rating" onChange={onChange} />
        <Rate aria-label="历史评分" value={4} name="previousRating" readOnly />
      </form>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    const serverSlider = container.querySelector<HTMLInputElement>('input[type="range"]');
    const serverHidden = container.querySelector<HTMLInputElement>('input[name="previousRating"]');
    const recoverableErrors: unknown[] = [];
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await act(async () => {
      roots.push(
        hydrateRoot(container, element, {
          onRecoverableError: (error) => recoverableErrors.push(error)
        })
      );
      await Promise.resolve();
    });

    const slider = container.querySelector<HTMLInputElement>('input[type="range"]');
    const hidden = container.querySelector<HTMLInputElement>('input[name="previousRating"]');
    expect(slider).toBe(serverSlider);
    expect(hidden).toBe(serverHidden);
    fireEvent.change(slider!, { target: { value: "3.5" } });
    expect(onChange).toHaveBeenCalledWith(3.5);
    expect(new FormData(container.querySelector("form")!).get("previousRating")).toBe("4");
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
    container.remove();
  });
});
