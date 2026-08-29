// @vitest-environment jsdom
import { act, createElement } from "react";
import { waitFor } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Ellipsis } from "./Ellipsis";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];
const containers: HTMLElement[] = [];
const originalClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");

afterEach(async () => {
  await act(() => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  for (const container of containers.splice(0)) container.remove();
  if (originalClientWidth)
    Object.defineProperty(HTMLElement.prototype, "clientWidth", originalClientWidth);
  else Reflect.deleteProperty(HTMLElement.prototype, "clientWidth");
  if (originalOffsetHeight)
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", originalOffsetHeight);
  else Reflect.deleteProperty(HTMLElement.prototype, "offsetHeight");
  vi.restoreAllMocks();
});

describe("Ellipsis hydration", () => {
  it("reuses the stable fallback and adds the action only after client measurement", async () => {
    const content = "服务端输出完整文本，客户端水合后按容器宽度安全截断并允许展开。";
    const onExpandedChange = vi.fn();
    const element = createElement(Ellipsis, { content, rows: 2, onExpandedChange });
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    containers.push(container);
    const serverRoot = container.querySelector<HTMLElement>('[data-meu-component="ellipsis"]');
    if (!serverRoot) throw new Error("Expected server-rendered Ellipsis root");
    expect(serverRoot.dataset.state).toBe("pending");
    expect(serverRoot.querySelector("button")).toBeNull();

    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get: () => 90
    });
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
      configurable: true,
      get() {
        if (!(this instanceof HTMLDivElement) || !this.getAttribute("aria-hidden")) return 24;
        const textElement = this.querySelector("span:first-child");
        const text = textElement && textElement.textContent ? textElement.textContent : "";
        const action = this.querySelector<HTMLElement>("span:last-child");
        const actionLength = action && action.style.display !== "none" ? 4 : 0;
        return Math.ceil((text.length + actionLength) / 9) * 24;
      }
    });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const recoverableErrors: unknown[] = [];

    await act(async () => {
      mountedRoots.push(
        hydrateRoot(container, element, {
          onRecoverableError: (error) => recoverableErrors.push(error)
        })
      );
      await Promise.resolve();
    });

    const hydratedRoot = container.querySelector<HTMLElement>('[data-meu-component="ellipsis"]');
    if (!hydratedRoot) throw new Error("Expected hydrated Ellipsis root");
    expect(hydratedRoot).toBe(serverRoot);
    await waitFor(() => expect(hydratedRoot.dataset.state).toBe("collapsed"));
    const action = hydratedRoot.querySelector<HTMLButtonElement>("button");
    if (!action) throw new Error("Expected hydrated action");
    expect(action.textContent).toBe("展开");
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();

    act(() => action.click());
    expect(hydratedRoot.dataset.state).toBe("expanded");
    expect(onExpandedChange).toHaveBeenCalledWith(true, expect.anything());
  });
});
