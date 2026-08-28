// @vitest-environment jsdom
import { Button } from "@meu/mobile";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MeuForm } from "./MeuForm";
import { MeuFormRate } from "./MeuFormRate";
import { MeuFormSelector } from "./MeuFormSelector";
import { MeuFormSlider } from "./MeuFormSlider";
import { MeuFormStepper } from "./MeuFormStepper";
import { useMeuForm } from "./useMeuForm";

type Values = {
  quantity: number | null;
  rating: number;
  services: string[];
  volume: number;
};

const selectorOptions = [
  { value: "delivery", label: "配送" },
  { value: "pickup", label: "自提" }
];

function EntryForm({ onSubmit }: { onSubmit: (values: Values) => void }) {
  const form = useMeuForm<Values>({
    defaultValues: { quantity: 1, rating: 0, services: [], volume: 20 }
  });

  return (
    <MeuForm form={form} onSubmit={onSubmit}>
      <MeuFormStepper<Values> name="quantity" label="购买数量" min={1} max={5} />
      <MeuFormSlider<Values> name="volume" label="提示音量" showValue />
      <MeuFormRate<Values>
        name="rating"
        label="服务评分"
        rules={{ min: { value: 1, message: "请完成评分" } }}
      />
      <MeuFormSelector<Values, string>
        name="services"
        label="增值服务"
        options={selectorOptions}
        multiple
        rules={{ validate: (value) => (Array.isArray(value) && value.length > 0) || "请选择服务" }}
      />
      <Button type="button" onClick={() => form.setFocus("services")}>
        聚焦服务
      </Button>
      <Button type="submit">保存配置</Button>
    </MeuForm>
  );
}

describe("MeuForm advanced entry adapters", () => {
  it("validates and submits number, rating and array values", async () => {
    const onSubmit = vi.fn();
    render(<EntryForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "聚焦服务" }));
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("checkbox", { name: "配送" }))
    );

    fireEvent.click(screen.getByRole("button", { name: "保存配置" }));
    await waitFor(() => expect(screen.getAllByRole("alert")).toHaveLength(2));
    expect(document.activeElement).toBe(screen.getByRole("slider", { name: "服务评分" }));

    fireEvent.click(screen.getByRole("button", { name: "增加" }));
    fireEvent.change(screen.getByRole("slider", { name: "提示音量" }), {
      target: { value: "45" }
    });
    fireEvent.change(screen.getByRole("slider", { name: "服务评分" }), {
      target: { value: "4" }
    });
    fireEvent.click(screen.getByRole("button", { name: "保存配置" }));
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("checkbox", { name: "配送" }))
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "配送" }));
    fireEvent.click(screen.getByRole("button", { name: "保存配置" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { quantity: 2, rating: 4, services: ["delivery"], volume: 45 },
        expect.anything()
      )
    );
  });
});
