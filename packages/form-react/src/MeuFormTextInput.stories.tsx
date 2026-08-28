import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@meu/mobile";
import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import { z } from "zod";

import { MeuForm } from "./MeuForm";
import { MeuFormTextInput } from "./MeuFormTextInput";
import { applyMeuFormErrors } from "./server-errors";
import { useMeuForm } from "./useMeuForm";

const schema = z.object({
  storeName: z.string().min(1, "请输入店铺名称"),
  contact: z.string().min(1, "请输入联系人")
});

type FormValues = z.infer<typeof schema>;

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

function changeInputValue(input: HTMLInputElement, value: string) {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
  if (descriptor && descriptor.set) descriptor.set.call(input, value);
  else input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function FormExample() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<FormValues>({
    schema,
    defaultValues: { storeName: "", contact: "" }
  });

  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(JSON.stringify(values))}
      style={{ display: "grid", gap: 20, maxWidth: 390 }}
    >
      <MeuFormTextInput<FormValues>
        name="storeName"
        label="店铺名称"
        description="提交后用于消费者侧展示"
        placeholder="例如：喵呜体验店"
        clearable
        required
      />
      <MeuFormTextInput<FormValues>
        name="contact"
        label="联系人"
        placeholder="请输入联系人"
        required
      />
      <Button type="submit">保存更改</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}

const advancedSchema = z.object({
  aliases: z.array(z.object({ value: z.string().min(1, "请输入别名") })),
  profile: z.object({ name: z.string().min(1, "请输入店铺名称") })
});
type AdvancedValues = z.infer<typeof advancedSchema>;

function AdvancedFormExample() {
  const [result, setResult] = useState("尚未提交");
  const form = useMeuForm<AdvancedValues>({
    schema: advancedSchema,
    defaultValues: { aliases: [{ value: "" }], profile: { name: "" } }
  });
  const aliases = useFieldArray({ control: form.control, name: "aliases" });

  return (
    <MeuForm
      form={form}
      onSubmit={(values) => setResult(JSON.stringify(values))}
      style={{ display: "grid", gap: 20, maxWidth: 390 }}
    >
      <MeuFormTextInput<AdvancedValues>
        name="profile.name"
        label="店铺名称"
        placeholder="例如：喵呜体验店"
        required
      />
      {aliases.fields.map((field, index) => (
        <MeuFormTextInput<AdvancedValues>
          key={field.id}
          name={`aliases.${index}.value`}
          label={`别名 ${index + 1}`}
          placeholder="请输入别名"
        />
      ))}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button type="button" variant="outline" onClick={() => aliases.append({ value: "" })}>
          添加别名
        </Button>
        <Button
          type="button"
          variant="outline"
          tone="danger"
          onClick={() => applyMeuFormErrors(form, { "profile.name": "店铺名称已存在" })}
        >
          模拟服务端错误
        </Button>
        <Button type="button" variant="text" onClick={() => form.reset()}>
          重置
        </Button>
      </div>
      <Button type="submit">提交</Button>
      <output aria-live="polite">{result}</output>
    </MeuForm>
  );
}

const meta = {
  title: "Forms/FormTextInput",
  component: FormExample,
  parameters: {
    docs: {
      description: {
        component: "React Hook Form + Zod 的完整绑定示例，覆盖字段注册、错误显示、清除与提交。"
      }
    }
  }
} satisfies Meta<typeof FormExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ValidationAndSubmit: Story = {
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector<HTMLFormElement>("form");
    const storeName = canvasElement.querySelector<HTMLInputElement>('input[name="storeName"]');
    const contact = canvasElement.querySelector<HTMLInputElement>('input[name="contact"]');
    const submit = canvasElement.querySelector<HTMLButtonElement>('button[type="submit"]');
    const output = canvasElement.querySelector<HTMLOutputElement>("output");
    if (!form || !storeName || !contact || !submit || !output) {
      throw new window.Error("Expected text input form controls");
    }

    submit.click();
    await waitForStory(
      () => canvasElement.querySelectorAll('[role="alert"]').length === 2,
      "Text input form did not expose required validation errors"
    );
    if (
      storeName.getAttribute("aria-invalid") !== "true" ||
      contact.getAttribute("aria-invalid") !== "true" ||
      canvasElement.ownerDocument.activeElement !== storeName
    ) {
      throw new window.Error("Text input validation did not mark and focus the first field");
    }

    changeInputValue(storeName, "喵呜体验店");
    changeInputValue(contact, "小喵");
    submit.click();
    await waitForStory(
      () => output.textContent !== "尚未提交",
      "Text input form did not submit entered values"
    );

    const submitted = JSON.parse(output.textContent || "{}") as Partial<FormValues>;
    if (submitted.storeName !== "喵呜体验店" || submitted.contact !== "小喵") {
      throw new window.Error("Text input form submitted unexpected values");
    }
    const data = new FormData(form);
    if (data.get("storeName") !== "喵呜体验店" || data.get("contact") !== "小喵") {
      throw new window.Error("Text inputs did not expose their values through native FormData");
    }
    if (canvasElement.querySelector('[role="alert"]') !== null) {
      throw new window.Error("Text input validation errors remained after valid submission");
    }
  }
};
export const NestedArrayAndServerErrors: Story = { render: () => <AdvancedFormExample /> };
