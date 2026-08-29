// @vitest-environment jsdom
import { act } from "@testing-library/react";
import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { Toast } from "./Toast";

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

describe("Toast hydration", () => {
  it("hydrates in place before moving the configured feedback into the body Portal", async () => {
    const element = createElement(ConfigProvider, {
      children: createElement(Toast, { duration: 0, message: "Saved", open: true }),
      dir: "rtl",
      locale: "en-US",
      theme: "dark"
    });
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    containers.push(container);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const serverStatus = container.querySelector('[role="status"]');
    expect(serverStatus && serverStatus.textContent).toBe("Saved");
    await act(async () => {
      mountedRoots.push(hydrateRoot(container, element));
      await Promise.resolve();
      await Promise.resolve();
    });

    const layer = document.body.querySelector<HTMLElement>('[data-meu-overlay-layer="toast"]');
    expect(layer && layer.closest("body")).toBe(document.body);
    expect(layer && layer.getAttribute("dir")).toBe("rtl");
    expect(layer && layer.getAttribute("lang")).toBe("en-US");
    expect(layer && layer.getAttribute("data-meu-theme")).toBe("dark");
    expect(consoleError).not.toHaveBeenCalled();
  });
});
