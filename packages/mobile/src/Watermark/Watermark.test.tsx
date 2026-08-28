// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
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

  it("uses an image first and falls back to content after an image error", () => {
    const onImageError = vi.fn();
    render(
      <Watermark image="/missing-logo.svg" content="Meu fallback" onImageError={onImageError}>
        内容
      </Watermark>
    );
    const image = document.querySelector("svg image")!;
    fireEvent.error(image);
    expect(onImageError).toHaveBeenCalledTimes(1);
    expect(document.querySelector("svg image")).toBeNull();
    const svg = document.querySelector("svg");
    expect(svg && svg.textContent).toContain("Meu fallback");
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
});
