// @vitest-environment jsdom
import { Button } from "@meu/mobile";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MeuForm } from "./MeuForm";
import { MeuFormPicker } from "./MeuFormPicker";
import { useMeuForm } from "./useMeuForm";

const columns = [
  [
    { label: "标准配送", value: "standard" },
    { label: "次日达", value: "next-day", disabled: true },
    { label: "当日达", value: "same-day" },
    { label: "到店自提", value: "pickup" },
    { label: "快递柜", value: "locker" }
  ]
] as const;

type Values = { delivery: Array<string | null> };

afterEach(cleanup);

function PickerForm({ onSubmit }: { onSubmit: (values: Values) => void }) {
  const form = useMeuForm<Values>({ defaultValues: { delivery: [] } });

  return (
    <MeuForm form={form} onSubmit={onSubmit}>
      <MeuFormPicker<Values, string>
        name="delivery"
        label="配送方式"
        description="选择一种可用方式"
        columns={columns}
        required
        rules={{
          validate: (value) =>
            (Array.isArray(value) && typeof value[0] === "string") || "请选择配送方式"
        }}
        triggerProps={{ placeholder: "请选择配送方式" }}
      />
      <output data-testid="dirty">{form.formState.isDirty ? "dirty" : "pristine"}</output>
      <Button type="submit">提交订单</Button>
    </MeuForm>
  );
}

describe("MeuFormPicker", () => {
  it("keeps cancelled drafts out of form state and commits confirmed values", async () => {
    const onSubmit = vi.fn();
    render(<PickerForm onSubmit={onSubmit} />);

    const trigger = screen.getByRole("button", { name: "配送方式" });
    expect(trigger.textContent).toContain("请选择配送方式");
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "当日达" }));
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(trigger.textContent).toContain("请选择配送方式");
    expect(screen.getByTestId("dirty").textContent).toBe("pristine");

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "当日达" }));
    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    await waitFor(() => expect(trigger.textContent).toContain("当日达"));
    expect(screen.getByTestId("dirty").textContent).toBe("dirty");

    fireEvent.click(screen.getByRole("button", { name: "提交订单" }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ delivery: ["same-day"] }, expect.anything())
    );
  });

  it("surfaces validation errors on the trigger and focuses it", async () => {
    render(<PickerForm onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "提交订单" }));

    const alert = await screen.findByRole("alert");
    const trigger = screen.getByRole("button", { name: "配送方式" });
    expect(alert.textContent).toBe("请选择配送方式");
    expect(trigger.getAttribute("data-invalid")).toBe("true");
    expect(trigger.getAttribute("aria-describedby")).toContain("error");
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
});
