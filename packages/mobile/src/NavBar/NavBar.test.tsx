// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { NavBar } from "./NavBar";

describe("NavBar", () => {
  it("renders a native back button only when an action is provided", () => {
    const onBack = vi.fn();
    render(<NavBar title="订单详情" onBack={onBack} right={<a href="/help">帮助</a>} />);

    fireEvent.click(screen.getByRole("button", { name: "返回" }));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("banner").getAttribute("data-bordered")).toBe("true");
    expect(screen.getByRole("link", { name: "帮助" }).getAttribute("href")).toBe("/help");
  });

  it("uses an anchor and localized name when backHref is present", () => {
    render(
      <ConfigProvider locale="en-US">
        <NavBar title="Orders" backHref="/orders" />
      </ConfigProvider>
    );

    expect(screen.getByRole("link", { name: "Back" }).getAttribute("href")).toBe("/orders");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("does not invent an interactive back control", () => {
    render(<NavBar title="首页" />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("allows a back link handler to cancel native navigation", () => {
    const onBack = vi.fn((event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      event.preventDefault();
    });
    render(<NavBar title="订单" backHref="/orders" onBack={onBack} />);
    const link = screen.getByRole("link", { name: "返回" });
    expect(fireEvent.click(link)).toBe(false);
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("opts into top safe-area spacing without fixed positioning", () => {
    render(<NavBar title={<h1>标题</h1>} safeArea />);
    const banner = screen.getByRole("banner");
    expect(banner.getAttribute("data-safe-area")).toBe("true");
    expect(screen.getByRole("heading", { level: 1, name: "标题" })).toBeTruthy();
  });

  it("uses native disabled semantics and blocks loading repeat activation", () => {
    const disabledBack = vi.fn();
    const { rerender } = render(
      <NavBar title="不可返回" onBack={disabledBack} backDisabled backLabel="列表" />
    );
    const disabledButton = screen.getByRole("button", { name: "返回" });
    expect(disabledButton.hasAttribute("disabled")).toBe(true);
    expect(disabledButton.getAttribute("data-state")).toBe("disabled");
    fireEvent.click(disabledButton);
    expect(disabledBack).not.toHaveBeenCalled();

    rerender(<NavBar title="正在返回" onBack={disabledBack} backLoading backLabel="列表" />);
    const loadingButton = screen.getByRole("button", { name: "返回" });
    expect(loadingButton.hasAttribute("disabled")).toBe(true);
    expect(loadingButton.getAttribute("aria-busy")).toBe("true");
    expect(loadingButton.getAttribute("data-state")).toBe("loading");
    const systemSpinner = loadingButton.querySelector("[aria-hidden='true'] > span");
    expect(systemSpinner).not.toBeNull();
    fireEvent.click(loadingButton);
    expect(disabledBack).not.toHaveBeenCalled();

    rerender(
      <ConfigProvider motion="reduced">
        <NavBar title="正在返回" onBack={disabledBack} backLoading backLabel="列表" />
      </ConfigProvider>
    );
    const reducedSpinner = screen
      .getByRole("button", { name: "返回" })
      .querySelector("[aria-hidden='true'] > span");
    expect(reducedSpinner).not.toBeNull();
    expect(reducedSpinner ? reducedSpinner.className : "").not.toBe(
      systemSpinner ? systemSpinner.className : ""
    );
  });

  it("keeps an unavailable href as a stable non-navigable link", () => {
    const onBack = vi.fn();
    const onParentClick = vi.fn();
    const { rerender } = render(
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- Event boundary verifies unavailable links stop React bubbling.
      <div onClick={onParentClick}>
        <NavBar title="订单" backHref="/orders" backDisabled onBack={onBack} backLabel="订单列表" />
      </div>
    );
    const link = screen.getByRole("link", { name: "返回" });
    expect(link.tagName).toBe("A");
    expect(link.hasAttribute("href")).toBe(false);
    expect(link.getAttribute("aria-disabled")).toBe("true");
    expect(link.getAttribute("tabindex")).toBe("-1");
    expect(fireEvent.click(link)).toBe(false);
    expect(onBack).not.toHaveBeenCalled();
    expect(onParentClick).not.toHaveBeenCalled();

    rerender(
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- Event boundary verifies the same anchor becomes active without replacement.
      <div onClick={onParentClick}>
        <NavBar title="订单" backHref="/orders" onBack={onBack} backLabel="订单列表" />
      </div>
    );
    const enabledLink = screen.getByRole("link", { name: "返回" });
    expect(enabledLink).toBe(link);
    expect(enabledLink.getAttribute("href")).toBe("/orders");
    expect(enabledLink.hasAttribute("aria-disabled")).toBe(false);
  });

  it("exposes controlled sticky and scroll presentation without observing the viewport", () => {
    render(
      <NavBar title="订单" bordered={false} position="sticky" scrolled data-testid="navbar" />
    );
    const banner = screen.getByTestId("navbar");
    expect(banner.getAttribute("data-position")).toBe("sticky");
    expect(banner.getAttribute("data-scrolled")).toBe("true");
    expect(banner.getAttribute("data-bordered")).toBe("false");
  });

  it("forwards the React 19 ref and native landmark naming props", () => {
    const ref = createRef<HTMLElement>();
    render(<NavBar ref={ref} title="结算" aria-label="结算页头" />);
    expect(ref.current).toBe(screen.getByRole("banner", { name: "结算页头" }));
    expect(ref.current && ref.current.getAttribute("data-back-state")).toBe("hidden");
  });

  it("resolves the back-icon direction from config while honoring a nested dir override", () => {
    render(
      <ConfigProvider dir="rtl">
        <NavBar data-testid="rtl" title="RTL" onBack={() => undefined} />
        <NavBar data-testid="ltr" dir="ltr" title="LTR" onBack={() => undefined} />
        <NavBar data-testid="auto" dir="auto" title="Auto" onBack={() => undefined} />
      </ConfigProvider>
    );
    const rtlIcon = screen.getByTestId("rtl").querySelector('[aria-hidden="true"]');
    const ltrIcon = screen.getByTestId("ltr").querySelector('[aria-hidden="true"]');
    expect(rtlIcon && ltrIcon && rtlIcon.className).not.toBe(ltrIcon && ltrIcon.className);
    expect(screen.getByTestId("ltr").getAttribute("dir")).toBe("ltr");
    expect(screen.getByTestId("auto").getAttribute("dir")).toBe("auto");
  });
});
