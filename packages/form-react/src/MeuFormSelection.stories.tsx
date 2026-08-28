import { Button, Checkbox, Radio } from "@meu/mobile";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { z } from "zod";

import { MeuForm } from "./MeuForm";
import { MeuFormCheckbox } from "./MeuFormCheckbox";
import { MeuFormCheckboxGroup } from "./MeuFormCheckboxGroup";
import { MeuFormRadioGroup } from "./MeuFormRadioGroup";
import { MeuFormSegmentedControl } from "./MeuFormSegmentedControl";
import { MeuFormSwitch } from "./MeuFormSwitch";
import { useMeuForm } from "./useMeuForm";

const schema = z.object({
  agreement: z.boolean().refine((value) => value, "请同意服务协议"),
  notifications: z.boolean(),
  services: z.array(z.string()).min(1, "至少选择一项服务"),
  shipping: z.string().min(1, "请选择配送方式"),
  viewMode: z.string().min(1, "请选择展示方式")
});
type Values = z.infer<typeof schema>;

function nextStoryFrame() {
  return new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
}

async function waitForStory(predicate: () => boolean, message: string) {
  const deadline = Date.now() + 2_000;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new window.Error(message);
    await nextStoryFrame();
  }
}

function SelectionExample() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<Values>({
    schema,
    defaultValues: {
      agreement: false,
      notifications: true,
      services: [],
      shipping: "",
      viewMode: "list"
    }
  });

  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(JSON.stringify(values))}
      style={{ display: "grid", gap: 20, maxWidth: 390 }}
    >
      <MeuFormCheckboxGroup<Values, string> name="services" label="服务范围" required>
        <Checkbox value="delivery">配送</Checkbox>
        <Checkbox value="pickup">到店自提</Checkbox>
      </MeuFormCheckboxGroup>
      <MeuFormRadioGroup<Values, string> name="shipping" label="配送方式" required>
        <Radio value="standard">标准配送</Radio>
        <Radio value="express">急速配送</Radio>
      </MeuFormRadioGroup>
      <MeuFormSwitch<Values> name="notifications" label="消息通知" />
      <MeuFormSegmentedControl<Values, string>
        name="viewMode"
        label="展示方式"
        block
        options={[
          { label: "列表", value: "list" },
          { label: "卡片", value: "card" }
        ]}
      />
      <MeuFormCheckbox<Values> name="agreement">同意服务协议</MeuFormCheckbox>
      <Button type="submit">保存设置</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}

const meta = {
  title: "Forms/SelectionIntegration",
  component: SelectionExample,
  parameters: { layout: "padded" }
} satisfies Meta<typeof SelectionExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CheckboxRadioAndSwitch: Story = {
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector<HTMLFormElement>("form");
    const submit = canvasElement.querySelector<HTMLButtonElement>('button[type="submit"]');
    const delivery = canvasElement.querySelector<HTMLInputElement>(
      'input[type="checkbox"][value="delivery"]'
    );
    const express = canvasElement.querySelector<HTMLInputElement>(
      'input[type="radio"][value="express"]'
    );
    const notifications = canvasElement.querySelector<HTMLInputElement>('input[role="switch"]');
    const card = canvasElement.querySelector<HTMLInputElement>('input[type="radio"][value="card"]');
    const agreement = canvasElement.querySelector<HTMLInputElement>(
      'input[type="checkbox"][name="agreement"]'
    );
    const output = canvasElement.querySelector<HTMLOutputElement>("output");
    if (
      !form ||
      !submit ||
      !delivery ||
      !express ||
      !notifications ||
      !card ||
      !agreement ||
      !output
    ) {
      throw new window.Error("Expected selection form controls");
    }

    submit.click();
    await waitForStory(
      () => canvasElement.querySelectorAll('[role="alert"]').length === 3,
      "Selection form did not expose required field validation"
    );
    const serviceGroup = canvasElement.querySelector<HTMLElement>(
      '[role="group"][aria-labelledby]'
    );
    if (!serviceGroup || canvasElement.ownerDocument.activeElement !== serviceGroup) {
      throw new window.Error("Selection form did not focus its first invalid group");
    }

    delivery.click();
    express.click();
    if (!notifications.checked) {
      throw new window.Error("Selection form lost its default switch value");
    }
    notifications.click();
    notifications.click();
    card.click();
    agreement.click();
    submit.click();

    await waitForStory(
      () => output.textContent !== "尚未提交",
      "Selection form did not submit its selected values"
    );
    const submitted = JSON.parse(output.textContent || "{}") as Partial<Values>;
    if (
      submitted.agreement !== true ||
      submitted.notifications !== true ||
      !Array.isArray(submitted.services) ||
      submitted.services.join(",") !== "delivery" ||
      submitted.shipping !== "express" ||
      submitted.viewMode !== "card"
    ) {
      throw new window.Error("Selection form submitted unexpected adapter values");
    }
    const data = new FormData(form);
    const services = data.getAll("services");
    if (
      services.length !== 1 ||
      services[0] !== "delivery" ||
      data.get("shipping") !== "express" ||
      data.get("notifications") === null ||
      data.get("viewMode") !== "card" ||
      data.get("agreement") === null
    ) {
      throw new window.Error("Selection controls did not participate in native FormData");
    }
  }
};
