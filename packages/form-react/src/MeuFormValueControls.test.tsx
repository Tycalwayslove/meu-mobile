// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MeuForm } from "./MeuForm";
import { MeuFormRate } from "./MeuFormRate";
import { MeuFormSegmentedControl } from "./MeuFormSegmentedControl";
import { MeuFormSelector } from "./MeuFormSelector";
import { MeuFormSlider } from "./MeuFormSlider";
import { MeuFormStepper } from "./MeuFormStepper";
import { useMeuForm } from "./useMeuForm";

type Values = {
  density: string;
  quantity: number | null;
  rating: number;
  services: string[];
  volume: number;
};

const selectionOptions = [
  { label: "标准", value: "standard" },
  { label: "紧凑", value: "compact" }
];

function ValueControlsHarness() {
  const form = useMeuForm<Values>({
    defaultValues: {
      density: "standard",
      quantity: 2,
      rating: 4,
      services: ["standard"],
      volume: 35
    }
  });

  return (
    <MeuForm form={form} onSubmit={vi.fn()} aria-label="数值控件表单">
      <MeuFormStepper<Values> name="quantity" label="数量" status="error" />
      <MeuFormSlider<Values> name="volume" label="锁定音量" readOnly status="error" />
      <MeuFormRate<Values> name="rating" label="评分" status="error" />
      <MeuFormSelector<Values, string>
        name="services"
        label="服务"
        options={selectionOptions}
        status="error"
      />
      <MeuFormSegmentedControl<Values, string>
        name="density"
        label="密度"
        options={selectionOptions}
        status="error"
      />
    </MeuForm>
  );
}

describe("MeuForm value control adapters", () => {
  it("preserves caller-owned error presentation and read-only native values", () => {
    const { container } = render(<ValueControlsHarness />);

    for (const component of ["stepper", "slider", "rate", "selector", "segmented-control"]) {
      const element = container.querySelector(`[data-meu-component="${component}"]`);
      expect(element && element.getAttribute("data-state")).toBe(
        component === "slider" ? "readonly" : "error"
      );
    }

    expect(screen.getByRole("meter", { name: "锁定音量" }).getAttribute("aria-invalid")).toBe(
      "true"
    );
    const form = screen.getByRole<HTMLFormElement>("form", { name: "数值控件表单" });
    expect(new FormData(form).get("volume")).toBe("35");
  });
});
