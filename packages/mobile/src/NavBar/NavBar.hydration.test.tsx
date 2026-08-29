// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NavBar } from "./NavBar";

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

describe("NavBar hydration", () => {
  it("hydrates stable link semantics and preserves router cancellation", async () => {
    const onBack = vi.fn((event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      event.preventDefault();
    });
    const element = createElement(NavBar, {
      backHref: "/orders",
      onBack,
      position: "sticky",
      safeArea: true,
      scrolled: true,
      title: createElement("h1", null, "订单")
    });
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    containers.push(container);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const recoverableErrors: unknown[] = [];

    const serverLink = container.querySelector<HTMLAnchorElement>('a[href="/orders"]');
    expect(serverLink && serverLink.getAttribute("aria-label")).toBe("返回");
    await act(async () => {
      mountedRoots.push(
        hydrateRoot(container, element, {
          onRecoverableError: (error) => recoverableErrors.push(error)
        })
      );
      await Promise.resolve();
    });

    const hydratedLink = container.querySelector<HTMLAnchorElement>('a[href="/orders"]');
    expect(hydratedLink).toBe(serverLink);
    expect(hydratedLink && fireEvent.click(hydratedLink)).toBe(false);
    expect(onBack).toHaveBeenCalledOnce();
    const header = container.querySelector("header");
    expect(header && header.getAttribute("data-position")).toBe("sticky");
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
