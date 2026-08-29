// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];

afterEach(async () => {
  await act(() => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  document.body.replaceChildren();
});

describe("Button hydration", () => {
  it("preserves the native button and activates it without recovery", async () => {
    const onClick = vi.fn();
    const element = <Button onClick={onClick}>保存</Button>;
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    const buttonBeforeHydration = container.querySelector("button");
    const recoverableErrors: unknown[] = [];

    await act(async () => {
      mountedRoots.push(
        hydrateRoot(container, element, {
          onRecoverableError: (error) => recoverableErrors.push(error)
        })
      );
      await Promise.resolve();
    });

    expect(recoverableErrors).toEqual([]);
    expect(container.querySelector("button")).toBe(buttonBeforeHydration);
    fireEvent.click(buttonBeforeHydration!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
