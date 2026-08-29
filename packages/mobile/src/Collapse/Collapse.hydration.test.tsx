// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Collapse } from "./Collapse";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];
const containers: HTMLElement[] = [];

function findTrigger(container: HTMLElement, value: string) {
  return Array.from(
    container.querySelectorAll<HTMLButtonElement>("[data-meu-collapse-trigger]")
  ).find((trigger) => trigger.dataset.meuCollapseTrigger === value);
}

afterEach(async () => {
  await act(() => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  for (const container of containers.splice(0)) container.remove();
  vi.restoreAllMocks();
});

describe("Collapse hydration", () => {
  it("hydrates stable relationships and keeps them stable after a reorder", async () => {
    const onChange = vi.fn();
    const items = [
      { value: "配送 / 🚚", title: "配送", content: "配送内容" },
      { value: "returns", title: "退换", content: "退换内容" }
    ];
    const element = createElement(Collapse, {
      accordion: true,
      defaultValue: ["配送 / 🚚"],
      items,
      onChange
    });
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    containers.push(container);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const recoverableErrors: unknown[] = [];
    const serverDelivery = findTrigger(container, "配送 / 🚚");
    if (!serverDelivery) throw new Error("Expected server-rendered delivery trigger");
    const serverDeliveryId = serverDelivery.id;
    const serverPanelId = serverDelivery.getAttribute("aria-controls");

    await act(async () => {
      mountedRoots.push(
        hydrateRoot(container, element, {
          onRecoverableError: (error) => recoverableErrors.push(error)
        })
      );
      await Promise.resolve();
    });

    const hydratedDelivery = findTrigger(container, "配送 / 🚚");
    if (!hydratedDelivery) throw new Error("Expected hydrated delivery trigger");
    expect(hydratedDelivery).toBe(serverDelivery);
    expect(hydratedDelivery.id).toBe(serverDeliveryId);
    expect(hydratedDelivery.getAttribute("aria-controls")).toBe(serverPanelId);
    expect(document.getElementById(serverPanelId || "")).not.toBeNull();

    const hydratedRoot = mountedRoots[0];
    if (!hydratedRoot) throw new Error("Expected hydrated React root");
    await act(async () => {
      hydratedRoot.render(
        createElement(Collapse, {
          accordion: true,
          defaultValue: ["配送 / 🚚"],
          items: [items[1]!, items[0]!],
          onChange
        })
      );
      await Promise.resolve();
    });
    const reorderedDelivery = findTrigger(container, "配送 / 🚚");
    if (!reorderedDelivery) throw new Error("Expected reordered delivery trigger");
    expect(reorderedDelivery.id).toBe(serverDeliveryId);
    expect(reorderedDelivery.getAttribute("aria-controls")).toBe(serverPanelId);

    const returns = findTrigger(container, "returns");
    if (!returns) throw new Error("Expected hydrated returns trigger");
    fireEvent.click(returns);
    expect(onChange).toHaveBeenCalledWith(["returns"], expect.anything());
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
