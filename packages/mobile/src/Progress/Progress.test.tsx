// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { Progress } from "./Progress";

describe("Progress", () => {
  it("clamps determinate values and exposes range semantics", () => {
    render(<Progress label="上传进度" value={140} showValue />);
    const progress = screen.getByRole("progressbar", { name: "上传进度" });
    expect(progress.getAttribute("aria-valuemin")).toBe("0");
    expect(progress.getAttribute("aria-valuemax")).toBe("100");
    expect(progress.getAttribute("aria-valuenow")).toBe("100");
    expect(progress.style.getPropertyValue("--meu-progress-scale")).toBe("1");
    expect(screen.getByText("100%")).toBeTruthy();
  });

  it("omits aria-valuenow for indeterminate progress", () => {
    render(<Progress indeterminate aria-label="正在同步" value={40} showValue />);
    const progress = screen.getByRole("progressbar", { name: "正在同步" });
    expect(progress.hasAttribute("aria-valuenow")).toBe(false);
    expect(progress.getAttribute("data-state")).toBe("indeterminate");
    expect(screen.queryByText("40%")).toBeNull();
  });

  it("formats visible values and localizes its fallback name", () => {
    render(
      <ConfigProvider locale="en-US">
        <Progress value={35.5} showValue formatValue={(value) => `${value} complete`} />
      </ConfigProvider>
    );
    expect(screen.getByRole("progressbar", { name: "Progress" })).toBeTruthy();
    expect(screen.getByText("35.5 complete")).toBeTruthy();
  });

  it("normalizes non-finite input and exposes opt-in announcement text", () => {
    render(<Progress announce aria-label="导入" value={Number.NaN} valueText="尚未开始" />);
    const progress = screen.getByRole("progressbar", { name: "导入" });
    expect(progress.getAttribute("aria-valuenow")).toBe("0");
    expect(progress.getAttribute("aria-valuetext")).toBe("尚未开始");
    expect(progress.getAttribute("aria-live")).toBe("polite");
    expect(progress.getAttribute("aria-atomic")).toBe("true");
  });

  it("preserves explicit announcement attributes without treating an empty value text as absent", () => {
    render(
      <Progress
        aria-atomic="false"
        aria-label="同步"
        aria-live="assertive"
        aria-valuetext=""
        announce
        value={42}
      />
    );
    const progress = screen.getByRole("progressbar", { name: "同步" });
    expect(progress.getAttribute("aria-live")).toBe("assertive");
    expect(progress.getAttribute("aria-atomic")).toBe("false");
    expect(progress.getAttribute("aria-valuetext")).toBe("");
  });
});
