// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { NumberKeyboard } from "./NumberKeyboard";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];
const containers: HTMLElement[] = [];

afterEach(async () => {
  await act(() => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  for (const container of containers.splice(0)) container.remove();
  vi.restoreAllMocks();
});

describe("NumberKeyboard hydration", () => {
  it("hydrates an initially open portal without changing provider or key semantics", async () => {
    const onInput = vi.fn();
    const element = (
      <ConfigProvider dir="rtl" locale="en-US" motion="reduced" theme="dark">
        <NumberKeyboard open title="Amount keyboard" onInput={onInput} />
      </ConfigProvider>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    containers.push(container);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(container.querySelector('[data-meu-component="number-keyboard"]')).toBeTruthy();
    await act(async () => {
      mountedRoots.push(hydrateRoot(container, element));
      await Promise.resolve();
    });

    const layer = document.body.querySelector('[data-meu-overlay-layer="number-keyboard"]');
    const group = document.body.querySelector('[data-meu-component="number-keyboard"]');
    expect(layer && layer.parentElement).toBe(document.body);
    expect(layer ? layer.getAttribute("dir") : null).toBe("rtl");
    expect(layer ? layer.getAttribute("data-meu-motion") : null).toBe("reduced");
    expect(group ? group.getAttribute("aria-labelledby") : null).toBeTruthy();
    const digit = group ? group.querySelector<HTMLButtonElement>('[data-key="1"]') : null;
    if (!digit) throw new Error("Expected the hydrated digit key");
    fireEvent.click(digit);
    expect(onInput).toHaveBeenCalledWith("1", { source: "digit" });
    expect(consoleError).not.toHaveBeenCalled();
  });
});
