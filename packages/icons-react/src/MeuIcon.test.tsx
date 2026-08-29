// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MeuIconCheck, MeuIconChevronLeft, MeuIconPlus, MeuIconSearch, MeuIconX } from "./MeuIcon";

describe("MeuIcon", () => {
  it("is decorative without a title", () => {
    const { container } = render(<MeuIconSearch />);
    const icon = container.querySelector("svg");
    expect(icon && icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon && icon.getAttribute("focusable")).toBe("false");
  });

  it("becomes an accessible image when titled", () => {
    const { container } = render(<MeuIconSearch title="搜索" />);
    const icon = screen.getByRole("img", { name: "搜索" });
    const title = container.querySelector("title");
    expect(title && title.id).toBeTruthy();
    expect(icon.getAttribute("aria-labelledby")).toBe(title ? title.id : undefined);
    expect(icon.getAttribute("aria-label")).toBeNull();
  });

  it("lets an explicit aria-label or aria-labelledby take naming precedence", () => {
    const { rerender } = render(<MeuIconSearch aria-label="查找商品" title="搜索" />);
    const directlyLabelled = screen.getByRole("img", { name: "查找商品" });
    expect(directlyLabelled.getAttribute("aria-labelledby")).toBeNull();

    rerender(
      <>
        <span id="icon-label">站内搜索</span>
        <MeuIconSearch aria-labelledby="icon-label" title="搜索" />
      </>
    );
    const externallyLabelled = screen.getByRole("img", { name: "站内搜索" });
    expect(externallyLabelled.getAttribute("aria-labelledby")).toBe("icon-label");
  });

  it("honors an explicit decorative override and removes competing naming metadata", () => {
    const { container } = render(<MeuIconSearch title="不应公告" aria-hidden="true" />);
    const icon = container.querySelector("svg");
    expect(icon && icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon && icon.getAttribute("role")).toBeNull();
    expect(icon && icon.getAttribute("aria-label")).toBeNull();
    expect(icon && icon.getAttribute("aria-labelledby")).toBeNull();
    expect(container.querySelector("title")).toBeNull();
  });

  it("keeps empty naming inputs decorative", () => {
    const { container, rerender } = render(<MeuIconSearch aria-label="   " />);
    const directlyEmpty = container.querySelector("svg");
    expect(directlyEmpty && directlyEmpty.getAttribute("aria-hidden")).toBe("true");

    rerender(<MeuIconSearch aria-labelledby="   " />);
    const externallyEmpty = container.querySelector("svg");
    expect(externallyEmpty && externallyEmpty.getAttribute("aria-hidden")).toBe("true");
  });

  it("keeps refs, Meu names, sizing, currentColor geometry and DevTools names stable", () => {
    const ref = createRef<SVGSVGElement>();
    const { container } = render(<MeuIconChevronLeft ref={ref} size="1.5em" strokeWidth={2.5} />);
    const icon = container.querySelector("svg");
    expect(ref.current).toBe(icon);
    expect(icon && icon.getAttribute("data-meu-icon")).toBe("chevron-left");
    expect(icon && icon.getAttribute("width")).toBe("1.5em");
    expect(icon && icon.getAttribute("height")).toBe("1.5em");
    expect(icon && icon.getAttribute("stroke")).toBe("currentColor");
    expect(icon && icon.getAttribute("stroke-width")).toBe("2.5");
    expect(MeuIconChevronLeft.displayName).toBe("MeuIconChevronLeft");
  });

  it("keeps every Meu export mapped to its traced upstream ID", () => {
    const mappings = [
      [MeuIconChevronLeft, "chevron-left"],
      [MeuIconCheck, "check"],
      [MeuIconPlus, "plus"],
      [MeuIconSearch, "search"],
      [MeuIconX, "x"]
    ] as const;

    const { container } = render(
      <>
        {mappings.map(([Icon, name]) => (
          <Icon key={name} />
        ))}
      </>
    );
    expect(Array.from(container.querySelectorAll("svg"), (icon) => icon.dataset.meuIcon)).toEqual(
      mappings.map(([, name]) => name)
    );
  });

  it("keeps title association and geometry deterministic in SSR output", () => {
    const html = renderToString(<MeuIconCheck title="已完成" size={20} />);
    const titleMatch = html.match(/<title id="([^"]+)"/);
    const titleId = titleMatch ? titleMatch[1] : undefined;
    expect(titleId).toBeTruthy();
    expect(html).toContain(`aria-labelledby="${titleId}"`);
    expect(html).toContain('role="img"');
    expect(html).toContain('data-meu-icon="check"');
    expect(html).toContain('stroke="currentColor"');
    expect(html).toContain('width="20"');
  });
});
