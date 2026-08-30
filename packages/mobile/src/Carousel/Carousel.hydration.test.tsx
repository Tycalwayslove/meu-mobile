// @vitest-environment jsdom
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { Carousel } from "./Carousel";

const emblaApi = vi.hoisted(() => ({
  off: vi.fn(),
  on: vi.fn(),
  scrollNext: vi.fn(),
  scrollPrev: vi.fn(),
  scrollTo: vi.fn(),
  selectedScrollSnap: vi.fn(() => 1)
}));

vi.mock("embla-carousel-react", () => ({
  default: () => [vi.fn(), emblaApi] as const
}));

const items = [
  { key: "one", ariaLabel: "First offer", content: <a href="/one">First offer link</a> },
  { key: "two", ariaLabel: "Second offer", content: <button type="button">Buy second</button> },
  { key: "three", ariaLabel: "Third offer", content: <a href="/three">Third offer link</a> }
] as const;
const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];

function carousel() {
  return (
    <ConfigProvider locale="en-US" motion="reduced">
      <Carousel autoplay aria-label="Featured offers" index={1} items={items} loop />
    </ConfigProvider>
  );
}

afterEach(async () => {
  await act(async () => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    await Promise.resolve();
  });
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("Carousel hydration", () => {
  it("hydrates controlled reduced-motion semantics and isolates inactive focus", async () => {
    const ui = carousel();
    const container = document.createElement("div");
    container.innerHTML = renderToString(ui);
    document.body.append(container);

    expect(container.querySelector('[data-meu-component="carousel"]')).toBeTruthy();
    expect(container.querySelector('[data-index="1"]')).toBeTruthy();
    expect(container.querySelectorAll("[data-meu-carousel-slide]")).toHaveLength(3);
    expect(container.querySelectorAll("[data-meu-carousel-slide][inert]")).toHaveLength(2);
    const serverStatus = container.querySelector("[data-meu-carousel-status]");
    expect(serverStatus && serverStatus.textContent).toBe("Second offer, slide 2 of 3");

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const recoverableErrors: unknown[] = [];
    await act(async () => {
      mountedRoots.push(
        hydrateRoot(container, ui, {
          onRecoverableError: (error) => recoverableErrors.push(error)
        })
      );
      await Promise.resolve();
    });

    const root = container.querySelector<HTMLElement>('[data-meu-component="carousel"]');
    const rotation = container.querySelector("[data-meu-carousel-rotation]");
    const firstLink = container.querySelector<HTMLAnchorElement>('a[href="/one"]');
    const activeButton = Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => button.textContent === "Buy second"
    );
    const thirdLink = container.querySelector<HTMLAnchorElement>('a[href="/three"]');
    expect(root && root.getAttribute("data-index")).toBe("1");
    expect(root && root.getAttribute("data-rotating")).toBe("false");
    expect(rotation && rotation.getAttribute("aria-label")).toBe("Start slide rotation");
    expect(firstLink && firstLink.tabIndex).toBe(-1);
    expect(activeButton && activeButton.tabIndex).toBe(0);
    expect(thirdLink && thirdLink.tabIndex).toBe(-1);
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
