// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Selector } from "./Selector";

const roots: Array<ReturnType<typeof hydrateRoot>> = [];

afterEach(async () => {
  await act(() => {
    for (const root of roots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  vi.restoreAllMocks();
});

describe("Selector hydration", () => {
  it("preserves native inputs, selection, and FormData without recoverable errors", async () => {
    const onChange = vi.fn();
    const element = (
      <form>
        <Selector
          aria-label="配送方式"
          defaultValue={["delivery"]}
          name="shipping"
          options={[
            { label: "配送", value: "delivery" },
            { label: "自提", value: "pickup" }
          ]}
          onChange={onChange}
        />
      </form>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    const serverPickup = container.querySelector<HTMLInputElement>('input[value="pickup"]');
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

    const pickup = container.querySelector<HTMLInputElement>('input[value="pickup"]');
    expect(pickup).toBe(serverPickup);
    fireEvent.click(pickup!);
    expect(onChange).toHaveBeenCalledWith(
      ["pickup"],
      [expect.objectContaining({ value: "pickup" })],
      expect.objectContaining({ source: "option" })
    );
    expect(new FormData(container.querySelector("form")!).get("shipping")).toBe("pickup");
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
    container.remove();
  });
});
