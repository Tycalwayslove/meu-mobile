// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("supports uncontrolled boolean changes with switch semantics", () => {
    const onChange = vi.fn();
    render(<Switch aria-label="消息通知" onChange={onChange} />);
    const control = screen.getByRole("switch", { name: "消息通知" });

    fireEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it("reports controlled changes without mutating the source of truth", () => {
    const onChange = vi.fn();
    render(<Switch aria-label="受控开关" checked={false} onChange={onChange} />);
    const control = screen.getByRole("switch", { name: "受控开关" });
    fireEvent.click(control);

    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
    expect(control).toHaveProperty("checked", false);
  });

  it("inherits a Field label and error description", () => {
    render(
      <Field label="自动续费" error="暂时无法修改">
        <Switch />
      </Field>
    );

    const control = screen.getByRole("switch", { name: "自动续费" });
    expect(control.getAttribute("aria-invalid")).toBe("true");
    expect(control.getAttribute("aria-describedby")).toContain("error");
  });

  it.each([
    [false, "false"],
    ["false", "false"],
    ["grammar", "grammar"],
    ["spelling", "spelling"]
  ] as const)("preserves aria-invalid=%s on the native switch", (ariaInvalid, expected) => {
    render(<Switch aria-invalid={ariaInvalid} aria-label="语义开关" />);
    expect(screen.getByRole("switch", { name: "语义开关" }).getAttribute("aria-invalid")).toBe(
      expected
    );
  });

  it("lets Field validation override a caller spelling token", () => {
    render(
      <Field label="自动续费" error="暂时无法修改">
        <Switch aria-invalid="spelling" />
      </Field>
    );

    expect(screen.getByRole("switch", { name: "自动续费" }).getAttribute("aria-invalid")).toBe(
      "true"
    );
  });

  it("blocks interaction while loading", () => {
    const onChange = vi.fn();
    const onClick = vi.fn();
    render(<Switch aria-label="同步设置" loading onChange={onChange} onClick={onClick} />);
    const control = screen.getByRole("switch", { name: "同步设置" });

    fireEvent.click(control);
    expect(onChange).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
    expect(control).toHaveProperty("disabled", false);
    expect(control.getAttribute("aria-disabled")).toBe("true");
    expect(control.getAttribute("aria-busy")).toBe("true");
  });

  it("preserves a loading value in native FormData", () => {
    const { container } = render(
      <form>
        <Switch aria-label="同步设置" defaultChecked loading name="sync" value="enabled" />
      </form>
    );
    expect(new FormData(container.querySelector("form")!).get("sync")).toBe("enabled");
  });

  it("keeps readonly switches focusable, unchanged and submitted", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <form>
        <Switch
          aria-label="自动续费"
          defaultChecked
          name="renew"
          readOnly
          value="yes"
          onChange={onChange}
        />
      </form>
    );
    const control = screen.getByRole("switch", { name: "自动续费" });
    fireEvent.click(control);

    expect(control.getAttribute("aria-readonly")).toBe("true");
    await waitFor(() => expect(control).toHaveProperty("checked", true));
    expect(onChange).not.toHaveBeenCalled();
    expect(new FormData(container.querySelector("form")!).get("renew")).toBe("yes");
  });

  it("restores uncontrolled state on native form reset", async () => {
    const { container } = render(
      <form>
        <Switch aria-label="消息通知" defaultChecked name="notifications" value="enabled" />
      </form>
    );
    const control = screen.getByRole("switch", { name: "消息通知" });
    fireEvent.click(control);
    expect(control).toHaveProperty("checked", false);

    const form = container.querySelector("form")!;
    act(() => form.reset());
    expect(new FormData(form).get("notifications")).toBe("enabled");
    await waitFor(() => expect(control).toHaveProperty("checked", true));
  });

  it("does not reset when the native reset event is canceled", async () => {
    const { container } = render(
      <form onReset={(event) => event.preventDefault()}>
        <Switch aria-label="消息通知" defaultChecked />
      </form>
    );
    const control = screen.getByRole("switch", { name: "消息通知" });
    fireEvent.click(control);

    act(() => container.querySelector("form")!.reset());
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(control).toHaveProperty("checked", false);
  });

  it("rebinds reset behavior when the external form owner changes", async () => {
    const { rerender } = render(
      <>
        <form id="switch-a" />
        <form id="switch-b" />
        <Switch
          aria-label="外部开关"
          defaultChecked
          form="switch-a"
          name="setting"
          value="enabled"
        />
      </>
    );
    const control = screen.getByRole("switch", { name: "外部开关" });
    fireEvent.click(control);
    rerender(
      <>
        <form id="switch-a" />
        <form id="switch-b" />
        <Switch
          aria-label="外部开关"
          defaultChecked
          form="switch-b"
          name="setting"
          value="enabled"
        />
      </>
    );
    const form = document.getElementById("switch-b") as HTMLFormElement;
    act(() => form.reset());
    expect(new FormData(form).get("setting")).toBe("enabled");
    await waitFor(() => expect(control).toHaveProperty("checked", true));
  });

  it("merges Field and caller descriptions and inherits required", () => {
    render(
      <Field label="自动续费" description="可随时关闭" required>
        <Switch aria-describedby="external-help" />
      </Field>
    );
    const control = screen.getByRole("switch", { name: "自动续费" });
    expect(control.getAttribute("aria-describedby")).toContain("external-help");
    expect(control.getAttribute("aria-describedby")).toContain("description");
    expect(control).toHaveProperty("required", true);
  });
});
