import { Button } from "@meu/mobile";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { MeuForm } from "./MeuForm";
import { MeuFormRate } from "./MeuFormRate";
import { MeuFormSelector } from "./MeuFormSelector";
import { MeuFormSlider } from "./MeuFormSlider";
import { MeuFormStepper } from "./MeuFormStepper";
import { useMeuForm } from "./useMeuForm";

type Values = { quantity: number | null; rating: number; services: string[]; volume: number };

function AdvancedEntryStory() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({
    defaultValues: { quantity: 1, rating: 3.5, services: ["delivery"], volume: 40 }
  });
  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(JSON.stringify(values))}
      style={{ width: 360 }}
    >
      <MeuFormStepper<Values> name="quantity" label="购买数量" min={1} max={8} />
      <MeuFormSlider<Values> name="volume" label="提示音量" showValue />
      <MeuFormRate<Values> name="rating" label="服务评分" allowHalf />
      <MeuFormSelector<Values, string>
        name="services"
        label="增值服务"
        multiple
        options={[
          { value: "delivery", label: "配送" },
          { value: "pickup", label: "自提" }
        ]}
      />
      <Button type="submit">保存配置</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}

async function waitForFormStory(predicate: () => boolean, message: string) {
  const deadline = Date.now() + 2_000;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new window.Error(message);
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
  }
}

const meta = {
  title: "Form/Advanced Entry",
  component: AdvancedEntryStory
} satisfies Meta<typeof AdvancedEntryStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const increment = canvasElement.querySelector<HTMLButtonElement>('button[aria-label="增加"]');
    const pickup = canvasElement.querySelector<HTMLInputElement>('input[value="pickup"]');
    const submit = Array.from(canvasElement.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => button.textContent === "保存配置"
    );
    const output = canvasElement.querySelector('output[aria-live="polite"]');
    if (!increment || !pickup || !submit || !output) {
      throw new window.Error("Expected advanced form controls");
    }

    increment.click();
    pickup.click();
    submit.click();
    await waitForFormStory(
      () =>
        output.textContent ===
        '{"quantity":2,"rating":3.5,"services":["delivery","pickup"],"volume":40}',
      "Expected advanced form values to submit"
    );
  }
};
