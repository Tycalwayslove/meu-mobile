// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { Mask } from "./Mask";

describe("Mask", () => {
  it("portals to the body, clamps opacity and locks scroll", () => {
    render(<Mask opacity={4} />);
    const mask = document.body.querySelector('[data-meu-component="mask"]');
    if (!(mask instanceof HTMLElement)) throw new Error("Expected Mask root");
    expect(mask.getAttribute("aria-hidden")).toBe("true");
    expect(mask.style.getPropertyValue("--meu-mask-opacity")).toBe("1");
    expect(document.body.getAttribute("data-meu-scroll-locked")).toBe("true");
  });

  it("reports a structured dismiss reason in uncontrolled mode", async () => {
    const onOpenChange = vi.fn();
    render(<Mask dismissible onOpenChange={onOpenChange} />);
    const mask = document.body.querySelector('[data-meu-component="mask"]');
    if (!(mask instanceof HTMLElement) || !(mask.firstElementChild instanceof HTMLElement)) {
      throw new Error("Expected Mask backdrop");
    }
    fireEvent.click(mask.firstElementChild);
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "mask" });
    await waitFor(() => expect(mask.getAttribute("data-state")).toBe("closed"));
    expect(document.body.hasAttribute("data-meu-scroll-locked")).toBe(false);
  });

  it("supports explicit inline rendering and force-mounted closed state", () => {
    render(
      <ConfigProvider portalContainer={null}>
        <div data-testid="host">
          <Mask open={false} forceMount />
        </div>
      </ConfigProvider>
    );
    const host = screen.getByTestId("host");
    const mask = host.querySelector('[data-meu-component="mask"]');
    if (!(mask instanceof HTMLElement)) throw new Error("Expected inline Mask");
    expect(mask.hidden).toBe(true);
  });

  it("preserves root attributes and falls back for non-finite opacity", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Mask
        ref={ref}
        className="business-mask"
        data-testid="business-mask"
        opacity={Number.NaN}
        style={{ zIndex: 1200 }}
      />
    );
    const mask = screen.getByTestId("business-mask");
    expect(ref.current).toBe(mask);
    expect(mask.className).toContain("business-mask");
    expect(mask.style.zIndex).toBe("1200");
    expect(mask.style.getPropertyValue("--meu-mask-opacity")).toBe("0.48");
  });
});
