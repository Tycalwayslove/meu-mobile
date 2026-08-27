// @vitest-environment jsdom
import { Button } from "@meu/mobile";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MeuForm } from "./MeuForm";
import { MeuFormCascadePicker } from "./MeuFormCascadePicker";
import { useMeuForm } from "./useMeuForm";

const regions = [
  {
    label: "浙江省",
    value: "zhejiang",
    children: [
      {
        label: "杭州市",
        value: "hangzhou",
        children: [
          { label: "西湖区", value: "xihu" },
          { label: "滨江区", value: "binjiang" }
        ]
      }
    ]
  },
  {
    label: "江苏省",
    value: "jiangsu",
    children: [
      {
        label: "南京市",
        value: "nanjing",
        children: [{ label: "玄武区", value: "xuanwu" }]
      }
    ]
  }
] as const;

type Values = { region: Array<string | null> };

afterEach(cleanup);

function CascadePickerForm({ onSubmit }: { onSubmit: (values: Values) => void }) {
  const form = useMeuForm<Values>({ defaultValues: { region: [] } });

  return (
    <MeuForm form={form} onSubmit={onSubmit}>
      <MeuFormCascadePicker<Values, string>
        name="region"
        label="配送地区"
        description="选择省市区"
        columnLabels={["省份", "城市", "区县"]}
        options={regions}
        required
        rules={{
          validate: (value) =>
            (Array.isArray(value) && value.length === 3 && value.every(Boolean)) ||
            "请选择完整配送地区"
        }}
        triggerProps={{ placeholder: "请选择配送地区" }}
      />
      <output data-testid="dirty">{form.formState.isDirty ? "dirty" : "pristine"}</output>
      <Button type="submit">提交订单</Button>
    </MeuForm>
  );
}

describe("MeuFormCascadePicker", () => {
  it("keeps cancelled paths pristine and commits the confirmed normalized path", async () => {
    const onSubmit = vi.fn();
    render(<CascadePickerForm onSubmit={onSubmit} />);

    const trigger = screen.getByRole("button", { name: "配送地区" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "江苏省" }));
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(trigger.textContent).toContain("请选择配送地区");
    expect(screen.getByTestId("dirty").textContent).toBe("pristine");

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "江苏省" }));
    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    await waitFor(() => expect(trigger.textContent).toContain("江苏省 / 南京市 / 玄武区"));
    expect(screen.getByTestId("dirty").textContent).toBe("dirty");

    fireEvent.click(screen.getByRole("button", { name: "提交订单" }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { region: ["jiangsu", "nanjing", "xuanwu"] },
        expect.anything()
      )
    );
  });

  it("associates validation feedback and focuses the trigger", async () => {
    render(<CascadePickerForm onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "提交订单" }));

    const alert = await screen.findByRole("alert");
    const trigger = screen.getByRole("button", { name: "配送地区" });
    expect(alert.textContent).toBe("请选择完整配送地区");
    expect(trigger.getAttribute("data-invalid")).toBe("true");
    expect(trigger.getAttribute("aria-describedby")).toContain("error");
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
});
