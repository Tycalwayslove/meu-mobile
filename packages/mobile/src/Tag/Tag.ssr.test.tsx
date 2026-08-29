// @vitest-environment jsdom
import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { Tag } from "./Tag";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];

afterEach(async () => {
  await act(() => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  document.body.replaceChildren();
});

describe("Tag SSR", () => {
  it("renders static, filter and closable modes deterministically", () => {
    expect(renderToString(<Tag>新品</Tag>)).toContain('data-state="static"');
    expect(renderToString(<Tag onClick={() => undefined}>有货</Tag>)).toContain("<button");
    const closable = renderToString(<Tag onClose={() => undefined}>促销</Tag>);
    expect(closable).toContain("移除标签");
    expect(closable).toContain("data-meu-tag-close");
  });

  it("hydrates the two-button closable filter without recovery", async () => {
    const element = (
      <Tag selected onClick={() => undefined} onClose={() => undefined}>
        有货
      </Tag>
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
    expect(container.querySelectorAll("[data-meu-tag-group] > button")).toHaveLength(2);
    expect(container.querySelector('button[aria-pressed="true"]')).not.toBeNull();
    expect(container.querySelector("button button")).toBeNull();
  });
});
