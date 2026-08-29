// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { createWatermarkPattern, normalizeWatermarkLines } from "./pattern";
import { Watermark } from "./Watermark";

describe("Watermark", () => {
  it("renders staggered, hidden text marks without blocking content", () => {
    render(
      <Watermark content={["Meu Mobile", "内部资料"]}>
        <button type="button">继续</button>
      </Watermark>
    );

    const root = screen.getByRole("button", { name: "继续" }).parentElement!;
    const svg = root.querySelector("[data-meu-watermark-overlay]")!;
    expect(root.getAttribute("data-meu-component")).toBe("watermark");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.querySelectorAll("text")).toHaveLength(6);
    expect(svg.textContent).toContain("Meu Mobile");
  });

  it("keeps the SVG viewport and child DOM inside the clipped host", () => {
    render(
      <Watermark content="Meu">
        <div data-testid="bounded-child" />
      </Watermark>
    );
    const child = screen.getByTestId("bounded-child");
    const root = child.parentElement!;
    const svg = root.querySelector("svg")!;
    const rect = svg.querySelector("rect")!;
    expect(root.contains(child)).toBe(true);
    expect(svg.getAttribute("width")).toBeNull();
    expect(svg.getAttribute("height")).toBeNull();
    expect(rect.getAttribute("width")).toBe("100%");
    expect(rect.getAttribute("height")).toBe("100%");
  });

  it("forwards the container ref and preserves native div attributes", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Watermark ref={ref} content="订单 20260828" aria-label="订单凭证" data-track="proof">
        凭证内容
      </Watermark>
    );
    expect(ref.current && ref.current.getAttribute("aria-label")).toBe("订单凭证");
    expect(ref.current && ref.current.getAttribute("data-track")).toBe("proof");
  });

  it("forwards React 19 callback-ref cleanup", () => {
    const cleanup = vi.fn();
    const callbackRef = vi.fn((node: HTMLDivElement | null) => (node ? cleanup : undefined));
    const { unmount } = render(<Watermark ref={callbackRef} content="Meu" />);
    expect(callbackRef).toHaveBeenCalledTimes(1);
    expect(callbackRef.mock.calls[0]![0]).toBeInstanceOf(HTMLDivElement);
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(callbackRef).toHaveBeenCalledTimes(1);
  });

  it("reports a repeated image error once and falls back to content", () => {
    const onImageError = vi.fn();
    render(
      <Watermark image="/missing-logo.svg" content="Meu fallback" onImageError={onImageError}>
        内容
      </Watermark>
    );
    const images = Array.from(document.querySelectorAll("svg image"));
    expect(images).toHaveLength(3);
    const image = images[0]!;
    fireEvent.error(image);
    fireEvent.error(image);
    fireEvent.error(images[1]!);
    expect(onImageError).toHaveBeenCalledTimes(1);
    expect(document.querySelector("svg image")).toBeNull();
    const svg = document.querySelector("svg");
    expect(svg && svg.textContent).toContain("Meu fallback");
  });

  it("reports a repeated image load once and retries when the URL changes", () => {
    const onImageLoad = vi.fn();
    const onImageError = vi.fn();
    const { rerender } = render(
      <Watermark
        image="/first-logo.svg"
        content="Meu fallback"
        onImageLoad={onImageLoad}
        onImageError={onImageError}
      >
        内容
      </Watermark>
    );
    const firstImages = Array.from(document.querySelectorAll("svg image"));
    fireEvent.load(firstImages[0]!);
    fireEvent.load(firstImages[1]!);
    expect(onImageLoad).toHaveBeenCalledTimes(1);

    rerender(
      <Watermark
        image="/second-logo.svg"
        content="Meu fallback"
        onImageLoad={onImageLoad}
        onImageError={onImageError}
      >
        内容
      </Watermark>
    );
    const secondImage = document.querySelector("svg image")!;
    expect(secondImage.getAttribute("href")).toBe("/second-logo.svg");
    expect(secondImage.getAttribute("xlink:href")).toBe("/second-logo.svg");
    fireEvent.error(secondImage);
    expect(onImageError).toHaveBeenCalledTimes(1);
    expect(document.querySelector("svg image")).toBeNull();
  });

  it("recreates a removed overlay and reports the tamper event", async () => {
    const onRemove = vi.fn();
    render(
      <Watermark content="Meu protected" onRemove={onRemove}>
        内容
      </Watermark>
    );
    const root = document.querySelector('[data-meu-component="watermark"]')!;
    const first = root.querySelector("[data-meu-watermark-overlay]")!;
    act(() => first.remove());
    await waitFor(() => expect(onRemove).toHaveBeenCalledTimes(1));
    const repaired = root.querySelector("[data-meu-watermark-overlay]");
    expect(repaired).toBe(first);

    act(() => first.setAttribute("style", "display: none"));
    await waitFor(() => expect(onRemove).toHaveBeenCalledTimes(2));
    expect(first.getAttribute("style")).not.toContain("display: none");
  });

  it("restores the earliest attribute value after multiple mutations in one batch", async () => {
    const onRemove = vi.fn();
    render(<Watermark content="Meu protected" onRemove={onRemove} />);
    const overlay = document.querySelector<SVGSVGElement>("[data-meu-watermark-overlay]")!;
    const originalStyle = overlay.getAttribute("style");
    act(() => {
      overlay.setAttribute("style", "display: none");
      overlay.setAttribute("style", "visibility: hidden");
    });
    await waitFor(() => expect(onRemove).toHaveBeenCalledTimes(1));
    expect(overlay.getAttribute("style")).toBe(originalStyle);
  });

  it("does not remove an external node that only passed through the overlay", async () => {
    const onRemove = vi.fn();
    render(<Watermark content="Meu protected" onRemove={onRemove} />);
    const overlay = document.querySelector<SVGSVGElement>("[data-meu-watermark-overlay]")!;
    const externalHost = document.createElement("div");
    const externalNode = document.createElement("span");
    document.body.appendChild(externalHost);
    act(() => {
      overlay.appendChild(externalNode);
      externalHost.appendChild(externalNode);
    });
    await waitFor(() => expect(onRemove).toHaveBeenCalledTimes(1));
    expect(externalNode.parentNode).toBe(externalHost);
  });

  it("honors disabled and unavailable tamper protection", async () => {
    const originalMutationObserver = globalThis.MutationObserver;
    vi.stubGlobal("MutationObserver", undefined);
    const { unmount } = render(<Watermark content="Meu" />);
    const overlay = document.querySelector("[data-meu-watermark-overlay]")!;
    act(() => overlay.remove());
    await Promise.resolve();
    expect(document.querySelector("[data-meu-watermark-overlay]")).toBeNull();
    unmount();
    vi.stubGlobal("MutationObserver", originalMutationObserver);

    render(<Watermark content="Meu" tamperProtection={false} />);
    const disabledOverlay = document.querySelector("[data-meu-watermark-overlay]")!;
    act(() => disabledOverlay.remove());
    await Promise.resolve();
    expect(document.querySelector("[data-meu-watermark-overlay]")).toBeNull();
  });

  it("normalizes geometry, offsets, multiline strings and opacity", () => {
    expect(normalizeWatermarkLines(["A\nB", "C"])).toEqual(["A", "B", "C"]);
    const pattern = createWatermarkPattern({
      content: "A",
      gap: [-10, Number.NaN],
      height: 0,
      offset: [12, 16],
      rotate: 0,
      width: Number.POSITIVE_INFINITY
    });
    expect(pattern.markWidth).toBe(120);
    expect(pattern.markHeight).toBe(1);
    expect(pattern.gapX).toBe(0);
    expect(pattern.gapY).toBe(96);
    expect(pattern.offsetX).toBe(12);
    expect(pattern.offsetY).toBe(-32);
  });

  it("does not treat legitimate child updates as watermark tampering", async () => {
    const onRemove = vi.fn();
    const { rerender } = render(
      <Watermark content="Meu" onRemove={onRemove}>
        <span>第一版</span>
      </Watermark>
    );
    rerender(
      <Watermark content="Meu" onRemove={onRemove}>
        <span>第二版</span>
        <button type="button">新增操作</button>
      </Watermark>
    );
    await waitFor(() => expect(screen.getByRole("button", { name: "新增操作" })).toBeTruthy());
    expect(screen.getByText("第二版")).toBeTruthy();
    expect(onRemove).not.toHaveBeenCalled();
  });

  it("server-renders a stable hidden SVG without browser globals", () => {
    const markup = renderToString(<Watermark content="SSR">内容</Watermark>);
    expect(markup).toContain('data-meu-component="watermark"');
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain("meu-watermark-");
  });

  it("hydrates the server SVG without replacing the overlay", async () => {
    const host = document.createElement("div");
    const element = <Watermark content={["SSR", "稳定"]}>内容</Watermark>;
    host.innerHTML = renderToString(element);
    document.body.appendChild(host);
    const serverOverlay = host.querySelector("[data-meu-watermark-overlay]");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const hydrated = hydrateRoot(host, element);
    await act(async () => Promise.resolve());
    expect(host.querySelector("[data-meu-watermark-overlay]")).toBe(serverOverlay);
    expect(
      consoleError.mock.calls.some((values) =>
        values.some((value) => String(value).includes("hydration"))
      )
    ).toBe(false);
    act(() => hydrated.unmount());
    consoleError.mockRestore();
    host.remove();
  });
});
