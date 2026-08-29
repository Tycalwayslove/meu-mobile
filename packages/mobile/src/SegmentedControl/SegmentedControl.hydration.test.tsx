// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SegmentedControl } from "./SegmentedControl";

const roots: Array<ReturnType<typeof hydrateRoot>> = [];
const containers: HTMLElement[] = [];

afterEach(async () => {
  await act(() => {
    for (const root of roots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  for (const container of containers.splice(0)) container.remove();
  vi.restoreAllMocks();
});

describe("SegmentedControl hydration", () => {
  it("hydrates stable radio and tab semantics without replacing controls", async () => {
    const onRadioChange = vi.fn();
    const onTabChange = vi.fn();
    const element = (
      <>
        <SegmentedControl
          aria-label="布局"
          defaultValue="list"
          name="layout"
          options={[
            { label: "列表", value: "list" },
            { label: "卡片", value: "card" }
          ]}
          onChange={onRadioChange}
        />
        <SegmentedControl
          mode="tabs"
          aria-label="周期"
          defaultValue="day"
          options={[
            { label: "日", panelId: "day-panel", tabId: "day-tab", value: "day" },
            { label: "月", panelId: "month-panel", tabId: "month-tab", value: "month" }
          ]}
          onChange={onTabChange}
        />
      </>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    containers.push(container);
    const serverCard = container.querySelector<HTMLInputElement>('input[value="card"]');
    const serverMonth = container.querySelector<HTMLButtonElement>("#month-tab");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const recoverableErrors: unknown[] = [];

    await act(async () => {
      roots.push(
        hydrateRoot(container, element, {
          onRecoverableError: (error) => recoverableErrors.push(error)
        })
      );
      await Promise.resolve();
    });

    const hydratedCard = container.querySelector<HTMLInputElement>('input[value="card"]');
    const hydratedMonth = container.querySelector<HTMLButtonElement>("#month-tab");
    expect(hydratedCard).toBe(serverCard);
    expect(hydratedMonth).toBe(serverMonth);
    fireEvent.click(hydratedCard!);
    fireEvent.click(hydratedMonth!);
    expect(hydratedCard && hydratedCard.checked).toBe(true);
    expect(hydratedMonth && hydratedMonth.getAttribute("aria-selected")).toBe("true");
    expect(onRadioChange).toHaveBeenCalledWith("card", expect.anything());
    expect(onTabChange).toHaveBeenCalledWith("month", expect.anything());
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
