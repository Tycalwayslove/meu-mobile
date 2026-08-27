// @vitest-environment jsdom
import { Button } from "@meu/mobile";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MeuForm } from "./MeuForm";
import { MeuFormTimePicker } from "./MeuFormTimePicker";
import { useMeuForm } from "./useMeuForm";

type Values = { deliveryTime: { hour: number; minute: number; second: number } | null };

afterEach(cleanup);

function TimePickerForm({
  initialValue = null,
  onSubmit
}: {
  initialValue?: Values["deliveryTime"];
  onSubmit: (values: Values) => void;
}) {
  const form = useMeuForm<Values>({ defaultValues: { deliveryTime: initialValue } });

  return (
    <MeuForm form={form} onSubmit={onSubmit}>
      <MeuFormTimePicker<Values>
        name="deliveryTime"
        label="送达时间"
        description="选择预计送达时间"
        min={{ hour: 9, minute: 0, second: 0 }}
        max={{ hour: 18, minute: 0, second: 0 }}
        minuteStep={15}
        required
        rules={{ validate: (value) => (value && value.hour >= 0) || "请选择送达时间" }}
        triggerProps={{ placeholder: "请选择时间" }}
      />
      <output data-testid="dirty">{form.formState.isDirty ? "dirty" : "pristine"}</output>
      <Button type="submit">提交订单</Button>
    </MeuForm>
  );
}

describe("MeuFormTimePicker", () => {
  it("keeps cancelled drafts pristine and commits a confirmed TimeValue", async () => {
    const onSubmit = vi.fn();
    render(
      <TimePickerForm initialValue={{ hour: 10, minute: 30, second: 0 }} onSubmit={onSubmit} />
    );

    const trigger = screen.getByRole("button", { name: "送达时间" });
    expect(trigger.textContent).toContain("10:30");
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "45分" }));
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(trigger.textContent).toContain("10:30");
    expect(screen.getByTestId("dirty").textContent).toBe("pristine");

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "45分" }));
    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    await waitFor(() => expect(trigger.textContent).toContain("10:45"));
    expect(screen.getByTestId("dirty").textContent).toBe("dirty");

    fireEvent.click(screen.getByRole("button", { name: "提交订单" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({
      deliveryTime: { hour: 10, minute: 45, second: 0 }
    });
  });

  it("associates validation feedback and focuses the native trigger", async () => {
    render(<TimePickerForm onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "提交订单" }));

    const alert = await screen.findByRole("alert");
    const trigger = screen.getByRole("button", { name: "送达时间" });
    expect(alert.textContent).toBe("请选择送达时间");
    expect(trigger.getAttribute("data-invalid")).toBe("true");
    expect(trigger.getAttribute("aria-describedby")).toContain("error");
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
});
