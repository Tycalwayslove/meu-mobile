// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("derives an accessible initial fallback", () => {
    render(<Avatar src="" alt="林夏" />);
    expect(screen.getByRole("img", { name: "林夏" })).toBeTruthy();
    expect(screen.getByText("林")).toBeTruthy();
  });

  it("falls back when the image fails", () => {
    render(<Avatar src="/broken-avatar.jpg" alt="Mina" />);
    fireEvent.error(screen.getByRole("img", { name: "Mina" }));
    expect(screen.getByText("M")).toBeTruthy();
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
});
