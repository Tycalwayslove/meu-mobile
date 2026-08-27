import { Button } from "@meu/mobile";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MeuForm } from "./MeuForm";
import { MeuFormRate } from "./MeuFormRate";
import { MeuFormSelector } from "./MeuFormSelector";
import { MeuFormSlider } from "./MeuFormSlider";
import { MeuFormStepper } from "./MeuFormStepper";
import { useMeuForm } from "./useMeuForm";

type Values = { quantity: number | null; rating: number; services: string[]; volume: number };

function AdvancedEntryStory() {
  const form = useMeuForm<Values>({
    defaultValues: { quantity: 1, rating: 3.5, services: ["delivery"], volume: 40 }
  });
  return (
    <MeuForm form={form} onSubmit={() => undefined} style={{ width: 360 }}>
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
    </MeuForm>
  );
}

const meta = {
  title: "Form/Advanced Entry",
  component: AdvancedEntryStory
} satisfies Meta<typeof AdvancedEntryStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
