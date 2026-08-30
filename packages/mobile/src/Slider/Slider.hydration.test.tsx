// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Slider } from "./Slider";

const roots: Array<ReturnType<typeof hydrateRoot>> = [];

afterEach(async () => {
  await act(() => {
    for (const root of roots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  vi.restoreAllMocks();
});

describe("Slider hydration", () => {
  it("preserves interactive and read-only form nodes without recoverable errors", async () => {
    const onChange = vi.fn();
    const element = (
      <form>
        <Slider aria-label="音量" defaultValue={20} name="volume" onChange={onChange} />
        <Slider aria-label="锁定音量" value={35} name="lockedVolume" readOnly />
      </form>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    const serverSlider = container.querySelector<HTMLInputElement>(
      'input[type="range"]:not([aria-hidden="true"])'
    );
    const serverHidden = container.querySelector<HTMLInputElement>('input[name="lockedVolume"]');
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

    const slider = container.querySelector<HTMLInputElement>(
      'input[type="range"]:not([aria-hidden="true"])'
    );
    const hidden = container.querySelector<HTMLInputElement>('input[name="lockedVolume"]');
    expect(slider).toBe(serverSlider);
    expect(hidden).toBe(serverHidden);
    fireEvent.change(slider!, { target: { value: "40" } });
    expect(onChange).toHaveBeenCalledWith(40, expect.anything());
    expect(new FormData(container.querySelector("form")!).get("lockedVolume")).toBe("35");
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
    container.remove();
  });

  it("keeps normalized controlled markup stable and completes interaction after hydration", async () => {
    const onChangeComplete = vi.fn();
    const element = (
      <Slider
        aria-label="比例"
        min={0.1}
        max={1}
        step={0.2}
        defaultValue={0.7}
        onChangeComplete={onChangeComplete}
      />
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    const serverSlider = container.querySelector<HTMLInputElement>('input[type="range"]');
    const recoverableErrors: unknown[] = [];

    await act(async () => {
      roots.push(
        hydrateRoot(container, element, {
          onRecoverableError: (error) => recoverableErrors.push(error)
        })
      );
      await Promise.resolve();
    });

    const slider = container.querySelector<HTMLInputElement>('input[type="range"]');
    expect(slider).toBe(serverSlider);
    fireEvent.pointerDown(slider!);
    fireEvent.change(slider!, { target: { value: "0.9" } });
    fireEvent.pointerUp(slider!);
    expect(onChangeComplete).toHaveBeenCalledWith(0.9, expect.anything());
    expect(recoverableErrors).toEqual([]);
    container.remove();
  });
});
