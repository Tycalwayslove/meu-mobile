// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { createRef } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { Tabs } from "./Tabs";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];

afterEach(async () => {
  await act(() => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  document.body.replaceChildren();
});

describe("Tabs SSR", () => {
  it("renders stable APG associations and a lazy initial panel", () => {
    const html = renderToString(
      <Tabs
        aria-label="账户"
        lazy
        items={[
          { key: "profile", label: "资料", content: "资料内容" },
          { key: "security", label: "安全", content: "安全内容" }
        ]}
      />
    );
    expect(html).toContain('role="tablist"');
    expect(html.match(/role="tab"/g)).toHaveLength(2);
    expect(html.match(/role="tabpanel"/g)).toHaveLength(1);
    expect(html).toContain('aria-selected="true"');
  });

  it("hydrates deterministic IDs, the React 19 ref, and keyboard behavior without recovery", async () => {
    const ref = createRef<HTMLDivElement>();
    const element = (
      <Tabs
        ref={ref}
        aria-label="账户"
        items={[
          { key: "profile", label: "资料", content: "资料内容" },
          { key: "disabled", label: "停用", content: "停用内容", disabled: true },
          { key: "security", label: "安全", content: "安全内容" }
        ]}
      />
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    const recoverableErrors: unknown[] = [];

    await act(async () => {
      mountedRoots.push(
        hydrateRoot(container, element, {
          onRecoverableError: (error) => recoverableErrors.push(error)
        })
      );
      await Promise.resolve();
    });

    const profile = container.querySelector<HTMLButtonElement>('[role="tab"]');
    if (!profile) throw new Error("Expected the first hydrated tab");
    fireEvent.keyDown(profile, { key: "ArrowRight" });

    expect(recoverableErrors).toEqual([]);
    expect(ref.current).toBe(container.querySelector('[data-meu-component="tabs"]'));
    const selectedTab = container.querySelector('[role="tab"][aria-selected="true"]');
    const visiblePanel = container.querySelector('[role="tabpanel"]:not([hidden])');
    expect(selectedTab && selectedTab.textContent).toBe("安全");
    expect(visiblePanel && visiblePanel.textContent).toBe("安全内容");
  });
});
