// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SearchField } from "./SearchField";

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

describe("SearchField hydration", () => {
  it("hydrates the server searchbox and preserves the clear/focus contract", async () => {
    const onChange = vi.fn();
    const element = createElement(SearchField, {
      "aria-label": "Hydrated search",
      defaultValue: "Meu",
      name: "query",
      onChange
    });
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    containers.push(container);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const serverInput = container.querySelector<HTMLInputElement>('input[type="search"]');
    expect(serverInput && serverInput.value).toBe("Meu");
    await act(async () => {
      mountedRoots.push(hydrateRoot(container, element));
      await Promise.resolve();
    });

    const clearAction = container.querySelector<HTMLButtonElement>('button[type="button"]');
    expect(clearAction).not.toBeNull();
    fireEvent.click(clearAction!);
    await act(() => Promise.resolve());

    const hydratedInput = container.querySelector<HTMLInputElement>('input[type="search"]');
    expect(hydratedInput && hydratedInput.value).toBe("");
    expect(document.activeElement).toBe(hydratedInput);
    expect(onChange).toHaveBeenCalledWith("", expect.objectContaining({ source: "clear" }));
    expect(consoleError).not.toHaveBeenCalled();
  });
});
