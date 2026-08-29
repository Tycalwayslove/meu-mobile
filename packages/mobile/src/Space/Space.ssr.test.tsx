// @vitest-environment jsdom
import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { Space } from "./Space";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];

afterEach(async () => {
  await act(() => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  document.body.replaceChildren();
});

describe("Space SSR", () => {
  it("preserves child order and logical layout attributes in server markup", () => {
    const markup = renderToString(
      <Space direction="horizontal" align="start" gap={3} wrap>
        <button type="button">保存</button>
        <button type="button">取消</button>
      </Space>
    );
    expect(markup).toContain('data-meu-component="space"');
    expect(markup).toContain('data-align="start"');
    expect(markup).toContain('data-gap="3"');
    expect(markup.indexOf("保存")).toBeLessThan(markup.indexOf("取消"));
  });

  it("hydrates without replacing the layout root or child controls", async () => {
    const element = (
      <Space block gap={4} wrap>
        <button type="button">主要操作</button>
        <button type="button">次要操作</button>
      </Space>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    const rootBeforeHydration = container.firstElementChild;
    const buttonBeforeHydration = container.querySelector("button");
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
    expect(container.querySelector("button")).toBe(buttonBeforeHydration);
    expect(container.querySelectorAll("button")).toHaveLength(2);
  });
});
