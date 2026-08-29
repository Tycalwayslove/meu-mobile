// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("derives an accessible initial fallback", () => {
    render(<Avatar src="" alt="林夏" />);
    expect(screen.getByRole("img", { name: "林夏" })).toBeTruthy();
    expect(screen.getByText("林")).toBeTruthy();
  });

  it("falls back when the image fails", () => {
    const onError = vi.fn();
    render(<Avatar src="/broken-avatar.jpg" alt="Mina" onError={onError} />);
    fireEvent.error(screen.getByRole("img", { name: "Mina" }));
    expect(screen.getByText("M")).toBeTruthy();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[data-state="error"]')).toBeTruthy();
  });

  it("supports numeric sizes without changing the public state model", () => {
    render(<Avatar src="" alt="A" size={72} data-testid="avatar" />);
    expect(screen.getByTestId("avatar").style.getPropertyValue("--meu-avatar-size")).toBe("72px");
  });

  it("prefers explicit initials and forwards native loading semantics", () => {
    render(<Avatar src="/avatar.jpg" alt="Ada Lovelace" initials="AL" loading="lazy" />);
    const image = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(image.getAttribute("loading")).toBe("lazy");
    expect(screen.getByText("AL")).toBeTruthy();

    fireEvent.error(image);
    expect(screen.getByText("AL")).toBeTruthy();
  });

  it("keeps empty-alt fallbacks decorative", () => {
    render(<Avatar src="" alt="" initials="NA" />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("NA").closest('[aria-hidden="true"]')).toBeTruthy();
  });

  it("forwards responsive and request controls to the native image", () => {
    const rootRef = createRef<HTMLSpanElement>();
    const imageRef = createRef<HTMLImageElement>();
    render(
      <Avatar
        ref={rootRef}
        imageRef={imageRef}
        src="/avatar-44.jpg"
        srcSet="/avatar-44.jpg 1x, /avatar-88.jpg 2x"
        sizes="44px"
        alt="Ada"
        crossOrigin="anonymous"
        decoding="sync"
        draggable
        fetchPriority="high"
        loading="lazy"
        referrerPolicy="no-referrer"
        objectPosition="50% 20%"
        data-testid="avatar"
      />
    );

    const root = screen.getByTestId("avatar");
    const image = screen.getByRole("img", { name: "Ada" });
    expect(rootRef.current).toBe(root);
    expect(imageRef.current).toBe(image);
    expect(root.style.getPropertyValue("--meu-avatar-object-position")).toBe("50% 20%");
    expect(image.getAttribute("srcset")).toBe("/avatar-44.jpg 1x, /avatar-88.jpg 2x");
    expect(image.getAttribute("sizes")).toBe("44px");
    expect(image.getAttribute("crossorigin")).toBe("anonymous");
    expect(image.getAttribute("decoding")).toBe("sync");
    expect(image.getAttribute("draggable")).toBe("true");
    expect(image.getAttribute("fetchpriority")).toBe("high");
    expect(image.getAttribute("loading")).toBe("lazy");
    expect(image.getAttribute("referrerpolicy")).toBe("no-referrer");
    expect(image.style.objectPosition).toBe("var(--meu-avatar-object-position, 50% 50%)");
  });

  it("tries a fallback image before exposing the content fallback", () => {
    const onError = vi.fn();
    const onLoad = vi.fn();
    render(
      <Avatar
        src="/primary-avatar.jpg"
        fallbackSrc="/fallback-avatar.jpg"
        alt="Ada"
        initials="AL"
        onError={onError}
        onLoad={onLoad}
      />
    );
    const primary = screen.getByRole("img", { name: "Ada" });
    fireEvent.error(primary);

    const fallbackImage = screen.getByRole("img", { name: "Ada" });
    expect(fallbackImage.getAttribute("src")).toBe("/fallback-avatar.jpg");
    expect(fallbackImage.closest('[data-source="fallback"][data-state="loading"]')).toBeTruthy();
    expect(onError).toHaveBeenCalledTimes(1);

    fireEvent.load(fallbackImage);
    expect(fallbackImage.closest('[data-source="fallback"][data-state="loaded"]')).toBeTruthy();
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it("supports srcSet-only sources and recovers when a failed source changes", () => {
    const onLoad = vi.fn();
    const { rerender } = render(
      <Avatar srcSet="/broken-avatar.webp 1x" alt="Mina" initials="MN" onLoad={onLoad} />
    );
    fireEvent.error(screen.getByRole("img", { name: "Mina" }));
    expect(screen.getByText("MN")).toBeTruthy();

    rerender(<Avatar src="/recovered-avatar.webp" alt="Mina" initials="MN" onLoad={onLoad} />);
    const recoveredImage = screen.getByRole("img", { name: "Mina" });
    expect(recoveredImage.tagName).toBe("IMG");
    expect(recoveredImage.closest('[data-state="loading"]')).toBeTruthy();
    fireEvent.load(recoveredImage);
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(recoveredImage.closest('[data-state="loaded"]')).toBeTruthy();
  });

  it("normalizes non-finite and non-positive numeric sizes", () => {
    const { rerender } = render(
      <Avatar src="" alt="A" size={Number.POSITIVE_INFINITY} data-testid="avatar" />
    );
    const root = screen.getByTestId("avatar");
    expect(root.style.getPropertyValue("--meu-avatar-size")).toBe("44px");
    expect(root.outerHTML).not.toContain("Infinity");

    rerender(<Avatar src="" alt="A" size={0} data-testid="avatar" />);
    expect(root.style.getPropertyValue("--meu-avatar-size")).toBe("1px");
    expect(root.getAttribute("data-size")).toBe("1");
  });
});
