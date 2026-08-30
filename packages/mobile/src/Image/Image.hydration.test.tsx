// @vitest-environment jsdom
import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Image } from "./Image";

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

function serverContainer(element: React.ReactElement) {
  const container = document.createElement("div");
  container.innerHTML = renderToString(element);
  document.body.append(container);
  containers.push(container);
  return container;
}

describe("Image hydration", () => {
  it("hydrates loading markup without changing native image semantics", async () => {
    const element = (
      <Image
        src="/hydrated.jpg"
        srcSet="/hydrated-2x.jpg 2x"
        sizes="320px"
        alt="水合图片"
        width="100%"
        aspectRatio="16 / 9"
        intrinsicWidth={320}
        intrinsicHeight={180}
        loading="lazy"
      />
    );
    const container = serverContainer(element);
    const serverImage = container.querySelector("img");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await act(async () => {
      roots.push(hydrateRoot(container, element));
      await Promise.resolve();
    });

    const hydratedImage = container.querySelector("img");
    expect(hydratedImage).toBe(serverImage);
    expect(hydratedImage).toBeTruthy();
    expect(hydratedImage!.getAttribute("alt")).toBe("水合图片");
    expect(hydratedImage!.getAttribute("loading")).toBe("lazy");
    expect(container.querySelector('[data-state="loading"]')).toBeTruthy();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("hydrates the no-source accessible fallback without a mismatch", async () => {
    const element = <Image src="" alt="不可用图片" fallback="暂无图片" />;
    const container = serverContainer(element);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await act(async () => {
      roots.push(hydrateRoot(container, element));
      await Promise.resolve();
    });

    const fallback = container.querySelector('[role="img"]');
    expect(fallback).toBeTruthy();
    expect(fallback!.getAttribute("aria-label")).toBe("不可用图片");
    expect(container.querySelector("img")).toBeNull();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("hydrates a direct fallback source without changing its source phase", async () => {
    const element = (
      <Image src=" " fallbackSrc="/hydrated-backup.jpg" alt="水合备用图片" loading="lazy" />
    );
    const container = serverContainer(element);
    const serverImage = container.querySelector("img");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await act(async () => {
      roots.push(hydrateRoot(container, element));
      await Promise.resolve();
    });

    expect(container.querySelector("img")).toBe(serverImage);
    expect(container.querySelector('[data-source="fallback"][data-state="loading"]')).toBeTruthy();
    expect(serverImage!.getAttribute("src")).toBe("/hydrated-backup.jpg");
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("hydrates a decorative fallback outside the accessibility tree", async () => {
    const element = <Image alt="" fallback="装饰占位" dir="rtl" />;
    const container = serverContainer(element);
    const serverRoot = container.querySelector('[data-meu-component="image"]');
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await act(async () => {
      roots.push(hydrateRoot(container, element));
      await Promise.resolve();
    });

    expect(container.querySelector('[data-meu-component="image"]')).toBe(serverRoot);
    expect(serverRoot!.getAttribute("aria-hidden")).toBe("true");
    expect(serverRoot!.getAttribute("dir")).toBe("rtl");
    expect(container.querySelector('[role="img"]')).toBeNull();
    expect(consoleError).not.toHaveBeenCalled();
  });
});
