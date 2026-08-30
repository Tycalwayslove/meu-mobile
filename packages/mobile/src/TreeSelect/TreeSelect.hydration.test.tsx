// @vitest-environment jsdom
import { act } from "@testing-library/react";
import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TreeSelect } from "./TreeSelect";
import type { TreeSelectOption } from "./types";

const roots: Array<ReturnType<typeof hydrateRoot>> = [];
const containers: HTMLElement[] = [];

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement
  ) {
    const height = this.hasAttribute("data-index")
      ? 52
      : Number.parseFloat(this.style.height) || 208;
    return {
      bottom: height,
      height,
      left: 0,
      right: 390,
      top: 0,
      width: 390,
      x: 0,
      y: 0,
      toJSON: () => ({})
    };
  });
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (
    this: HTMLElement
  ) {
    return this.hasAttribute("data-index") ? 52 : Number.parseFloat(this.style.height) || 0;
  });
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(390);
});

afterEach(async () => {
  await act(() => {
    for (const root of roots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  for (const container of containers.splice(0)) container.remove();
  vi.restoreAllMocks();
});

describe("TreeSelect hydration", () => {
  it("hydrates the complete server tree before enabling a bounded virtual window", async () => {
    const options: ReadonlyArray<TreeSelectOption<string>> = [
      {
        children: [{ label: "Loaded child", value: "loaded-child" }],
        label: "Loaded branch",
        value: "loaded-branch"
      },
      ...Array.from({ length: 60 }, (_, index) => ({
        label: `Hydration option ${index + 1}`,
        value: `hydration-option-${index + 1}`
      }))
    ];
    const element = createElement(TreeSelect<string>, {
      "aria-label": "Hydration tree select",
      defaultExpandedValues: ["loaded-branch"],
      lockScroll: false,
      open: true,
      options,
      overscan: 1,
      treeAriaLabel: "Hydration tree",
      treeHeight: 208
    });
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    containers.push(container);

    const serverTree = container.querySelector<HTMLElement>('[role="tree"]');
    expect(serverTree).toBeTruthy();
    expect(serverTree ? serverTree.querySelectorAll('[role="treeitem"]') : []).toHaveLength(62);
    expect(serverTree ? serverTree.getAttribute("aria-label") : null).toBe("Hydration tree");
    const serverChild = serverTree
      ? Array.from(serverTree.querySelectorAll<HTMLElement>('[role="treeitem"]')).find(
          (item) => item.textContent === "Loaded child"
        )
      : undefined;
    expect(serverChild ? serverChild.getAttribute("aria-level") : null).toBe("2");

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const recoverableErrors: unknown[] = [];
    const root = hydrateRoot(container, element, {
      onRecoverableError: (error) => recoverableErrors.push(error)
    });
    roots.push(root);
    await act(async () => {
      await Promise.resolve();
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    });

    const hydratedTree = document.querySelector<HTMLElement>('[role="tree"]');
    const hydratedItems = hydratedTree
      ? hydratedTree.querySelectorAll<HTMLElement>('[role="treeitem"]')
      : [];
    expect(hydratedTree).toBeTruthy();
    expect(hydratedItems.length).toBeGreaterThan(0);
    expect(hydratedItems.length).toBeLessThan(12);
    expect(hydratedTree ? hydratedTree.getAttribute("aria-label") : null).toBe("Hydration tree");
    expect(consoleError).not.toHaveBeenCalled();
    expect(recoverableErrors).toEqual([]);
  });
});
