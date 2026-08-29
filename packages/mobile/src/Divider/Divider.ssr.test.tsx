// @vitest-environment jsdom
import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { Divider } from "./Divider";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];

afterEach(async () => {
  await act(() => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  document.body.replaceChildren();
});

describe("Divider SSR", () => {
  it("renders stable separator semantics without browser globals", () => {
    const markup = renderToString(<Divider align="start">订单信息</Divider>);
    expect(markup).toContain('data-meu-component="divider"');
    expect(markup).toContain('role="separator"');
    expect(markup).toContain('aria-orientation="horizontal"');
    expect(markup).toContain('aria-label="订单信息"');
  });

  it("hydrates the semantic root without recovery or replacement", async () => {
    const element = <Divider aria-label="价格与库存分界" direction="vertical" />;
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    const rootBeforeHydration = container.firstElementChild;
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
    expect(container.firstElementChild).toBe(rootBeforeHydration);
    expect(rootBeforeHydration && rootBeforeHydration.getAttribute("aria-orientation")).toBe(
      "vertical"
    );
  });
});
