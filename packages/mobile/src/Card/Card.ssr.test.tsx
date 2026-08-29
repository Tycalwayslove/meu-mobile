// @vitest-environment jsdom
import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { Card } from "./Card";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];

afterEach(async () => {
  await act(() => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  document.body.replaceChildren();
});

describe("Card SSR", () => {
  it("renders stable non-interactive slot markup", () => {
    const html = renderToString(
      <Card title={<h2>订单</h2>} media="封面" footer={<a href="/orders">查看</a>}>
        订单内容
      </Card>
    );
    expect(html).toContain('data-meu-component="card"');
    expect(html).toContain("<h2>订单</h2>");
    expect(html).toContain('data-meu-card-media="true"');
    expect(html).toContain('href="/orders"');
    expect(html).not.toContain('role="button"');
  });

  it("hydrates the same static root and slot boundaries without recovery", async () => {
    const element = (
      <Card title={<h2>订单</h2>} footer={<button type="button">查看</button>}>
        {0}
      </Card>
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

    expect(recoverableErrors).toEqual([]);
    const card = container.querySelector('[data-meu-component="card"]');
    const body = container.querySelector("[data-meu-card-body]");
    expect(card && card.tagName).toBe("DIV");
    expect(body && body.textContent).toBe("0");
    expect(container.querySelectorAll("button")).toHaveLength(1);
  });
});
