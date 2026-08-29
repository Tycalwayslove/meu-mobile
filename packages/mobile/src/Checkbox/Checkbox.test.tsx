// @vitest-environment jsdom
import type { ChangeEvent } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { Checkbox } from "./Checkbox";
import { CheckboxGroup } from "./CheckboxGroup";

describe("Checkbox", () => {
  it("supports uncontrolled boolean changes", () => {
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange}>接收通知</Checkbox>);
    const checkbox = screen.getByRole("checkbox", { name: "接收通知" });

    fireEvent.click(checkbox);
    expect(checkbox).toHaveProperty("checked", true);
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it("reports controlled changes without mutating the source of truth", () => {
    const onChange = vi.fn();
    render(
      <Checkbox checked={false} onChange={onChange}>
        受控选择
      </Checkbox>
    );
    const checkbox = screen.getByRole("checkbox", { name: "受控选择" });
    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
    expect(checkbox).toHaveProperty("checked", false);
  });

  it("exposes the native indeterminate state", () => {
    render(<Checkbox indeterminate>选择全部</Checkbox>);
    const checkbox = screen.getByRole("checkbox", { name: "选择全部" });

    expect(checkbox).toHaveProperty("indeterminate", true);
    expect(checkbox.getAttribute("aria-checked")).toBe("mixed");
  });

  it("restores the native mixed property after an accepted uncontrolled change", () => {
    let indeterminateDuringChange = false;
    const onChange = vi.fn((_checked: boolean, event: ChangeEvent<HTMLInputElement>) => {
      indeterminateDuringChange = event.currentTarget.indeterminate;
    });
    render(
      <Checkbox indeterminate onChange={onChange}>
        选择全部
      </Checkbox>
    );
    const checkbox = screen.getByRole("checkbox", { name: "选择全部" });

    fireEvent.click(checkbox);

    expect(checkbox).toHaveProperty("checked", true);
    expect(checkbox).toHaveProperty("indeterminate", true);
    expect(checkbox.getAttribute("aria-checked")).toBe("mixed");
    expect(indeterminateDuringChange).toBe(true);
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it("keeps controlled checked state authoritative while restoring the mixed property", () => {
    const onChange = vi.fn();
    render(
      <Checkbox checked={false} indeterminate onChange={onChange}>
        受控全选
      </Checkbox>
    );
    const checkbox = screen.getByRole("checkbox", { name: "受控全选" });

    fireEvent.click(checkbox);

    expect(checkbox).toHaveProperty("checked", false);
    expect(checkbox).toHaveProperty("indeterminate", true);
    expect(checkbox.getAttribute("aria-checked")).toBe("mixed");
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it.each([
    [false, "false"],
    ["false", "false"],
    ["grammar", "grammar"],
    ["spelling", "spelling"]
  ] as const)("preserves aria-invalid=%s on a standalone checkbox", (ariaInvalid, expected) => {
    render(<Checkbox aria-invalid={ariaInvalid}>语义复选框</Checkbox>);
    expect(screen.getByRole("checkbox", { name: "语义复选框" }).getAttribute("aria-invalid")).toBe(
      expected
    );
  });

  it("lets Field validation override a caller grammar token", () => {
    render(
      <Field label="确认条款" error="必须确认">
        <Checkbox aria-invalid="grammar">同意条款</Checkbox>
      </Field>
    );

    expect(screen.getByRole("checkbox", { name: "确认条款" }).getAttribute("aria-invalid")).toBe(
      "true"
    );
  });

  it("keeps an indeterminate checkbox inert when disabled", () => {
    const onChange = vi.fn();
    render(
      <Checkbox disabled indeterminate onChange={onChange}>
        部分选择
      </Checkbox>
    );
    const checkbox = screen.getByRole("checkbox", { name: "部分选择" });

    expect(checkbox).toHaveProperty("indeterminate", true);
    fireEvent.click(checkbox);
    expect(checkbox).toHaveProperty("disabled", true);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps readonly controls focusable, unchanged and successful in FormData", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <form>
        <Checkbox defaultChecked name="terms" readOnly value="accepted" onChange={onChange}>
          条款
        </Checkbox>
      </form>
    );
    const checkbox = screen.getByRole("checkbox", { name: "条款" });

    fireEvent.click(checkbox);
    await waitFor(() => expect(checkbox).toHaveProperty("checked", true));
    expect(checkbox).not.toHaveProperty("disabled", true);
    expect(checkbox.getAttribute("aria-readonly")).toBe("true");
    expect(onChange).not.toHaveBeenCalled();
    expect(new FormData(container.querySelector("form")!).get("terms")).toBe("accepted");
  });

  it("restores uncontrolled state on native form reset", async () => {
    const { container } = render(
      <form>
        <Checkbox defaultChecked name="marketing">
          营销通知
        </Checkbox>
      </form>
    );
    const checkbox = screen.getByRole("checkbox", { name: "营销通知" });
    fireEvent.click(checkbox);
    expect(checkbox).toHaveProperty("checked", false);

    container.querySelector("form")!.reset();
    await waitFor(() => expect(checkbox).toHaveProperty("checked", true));
  });

  it("does not reset when the native reset event is canceled", async () => {
    const { container } = render(
      <form onReset={(event) => event.preventDefault()}>
        <Checkbox defaultChecked name="marketing">
          营销通知
        </Checkbox>
      </form>
    );
    const checkbox = screen.getByRole("checkbox", { name: "营销通知" });
    fireEvent.click(checkbox);

    act(() => container.querySelector("form")!.reset());
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(checkbox).toHaveProperty("checked", false);
  });

  it("rebinds reset behavior when the external form owner changes", async () => {
    const { rerender } = render(
      <>
        <form id="checkbox-a" />
        <form id="checkbox-b" />
        <Checkbox defaultChecked form="checkbox-a" name="choice" value="yes">
          外部协议
        </Checkbox>
      </>
    );
    const checkbox = screen.getByRole("checkbox", { name: "外部协议" });
    fireEvent.click(checkbox);
    rerender(
      <>
        <form id="checkbox-a" />
        <form id="checkbox-b" />
        <Checkbox defaultChecked form="checkbox-b" name="choice" value="yes">
          外部协议
        </Checkbox>
      </>
    );

    const form = document.getElementById("checkbox-b") as HTMLFormElement;
    act(() => form.reset());
    expect(new FormData(form).get("choice")).toBe("yes");
    await waitFor(() => expect(checkbox).toHaveProperty("checked", true));
  });

  it("merges caller and Field descriptions and propagates native required semantics", () => {
    render(
      <Field label="协议" description="请阅读" required>
        <Checkbox aria-describedby="external-help">同意</Checkbox>
      </Field>
    );
    const checkbox = screen.getByRole("checkbox", { name: "协议" });
    expect(checkbox.getAttribute("aria-describedby")).toContain("external-help");
    expect(checkbox.getAttribute("aria-describedby")).toContain("description");
    expect(checkbox).toHaveProperty("required", true);
  });
});

describe("CheckboxGroup", () => {
  it("manages array values and inherits Field semantics", () => {
    const onChange = vi.fn();
    render(
      <Field label="服务范围" error="至少选择一项">
        <CheckboxGroup<string> defaultValue={["delivery"]} onChange={onChange}>
          <Checkbox value="delivery">配送</Checkbox>
          <Checkbox value="pickup">自提</Checkbox>
        </CheckboxGroup>
      </Field>
    );

    const group = screen.getByRole("group", { name: "服务范围" });
    const delivery = screen.getByRole("checkbox", { name: "配送" });
    expect(group.getAttribute("data-state")).toBe("error");
    expect(group.getAttribute("aria-invalid")).toBe("true");
    expect(delivery.getAttribute("aria-invalid")).toBeNull();
    expect(delivery).toHaveProperty("checked", true);
    fireEvent.click(screen.getByRole("checkbox", { name: "自提" }));
    expect(onChange).toHaveBeenLastCalledWith(["delivery", "pickup"]);
  });

  it.each([
    [false, "false"],
    ["false", "false"],
    ["grammar", "grammar"],
    ["spelling", "spelling"]
  ] as const)(
    "keeps group aria-invalid=%s on the semantic root without manufacturing child tokens",
    (ariaInvalid, expected) => {
      render(
        <CheckboxGroup aria-invalid={ariaInvalid} aria-label="服务范围">
          <Checkbox value="delivery">配送</Checkbox>
        </CheckboxGroup>
      );

      expect(screen.getByRole("group", { name: "服务范围" }).getAttribute("aria-invalid")).toBe(
        expected
      );
      expect(
        screen.getByRole("checkbox", { name: "配送" }).getAttribute("aria-invalid")
      ).toBeNull();
    }
  );

  it("lets group validation override a caller spelling token", () => {
    render(
      <Field label="服务范围" error="请选择服务">
        <CheckboxGroup aria-invalid="spelling">
          <Checkbox value="delivery">配送</Checkbox>
        </CheckboxGroup>
      </Field>
    );

    expect(screen.getByRole("group", { name: "服务范围" }).getAttribute("aria-invalid")).toBe(
      "true"
    );
  });

  it("resets an uncontrolled group and submits repeated native names", async () => {
    const { container } = render(
      <form>
        <CheckboxGroup<string> defaultValue={["delivery"]} name="service">
          <Checkbox value="delivery">配送</Checkbox>
          <Checkbox value="pickup">自提</Checkbox>
        </CheckboxGroup>
      </form>
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "自提" }));
    expect(new FormData(container.querySelector("form")!).getAll("service")).toEqual([
      "delivery",
      "pickup"
    ]);

    const form = container.querySelector("form")!;
    act(() => form.reset());
    expect(new FormData(form).getAll("service")).toEqual(["delivery"]);
    await waitFor(() =>
      expect(screen.getByRole("checkbox", { name: "自提" })).toHaveProperty("checked", false)
    );
  });

  it("blocks readonly group changes without disabling its values", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <form>
        <CheckboxGroup defaultValue={["delivery"]} name="service" onChange={onChange} readOnly>
          <Checkbox value="delivery">配送</Checkbox>
          <Checkbox value="pickup">自提</Checkbox>
        </CheckboxGroup>
      </form>
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "自提" }));
    await waitFor(() =>
      expect(screen.getByRole("checkbox", { name: "自提" })).toHaveProperty("checked", false)
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(new FormData(container.querySelector("form")!).getAll("service")).toEqual(["delivery"]);
  });
});
