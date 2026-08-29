import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { MeuForm } from "./MeuForm";
import { useMeuForm } from "./useMeuForm";

type Values = { name: string; note?: string };

function CoreLifecycleStory() {
  const [showNote, setShowNote] = useState(true);
  const [result, setResult] = useState("Not submitted");
  const form = useMeuForm<Values>({ defaultValues: { name: "", note: "Initial note" } });
  return (
    <MeuForm form={form} onSubmit={(values) => setResult(JSON.stringify(values))}>
      <label>
        Store name
        <input {...form.register("name", { required: "Store name is required" })} />
      </label>
      {showNote ? (
        <label>
          Note
          <input {...form.register("note")} />
        </label>
      ) : null}
      <button type="button" onClick={() => setShowNote((visible) => !visible)}>
        Toggle note
      </button>
      <button type="reset">Reset</button>
      <button type="submit">Submit</button>
      <output aria-live="polite">
        {form.formState.isDirty ? "dirty" : "pristine"}/
        {form.formState.isSubmitting ? "submitting" : "idle"}/{result}
      </output>
    </MeuForm>
  );
}

const meta = {
  title: "Forms/Form",
  component: CoreLifecycleStory,
  parameters: { layout: "centered" },
  render: () => <CoreLifecycleStory />
} satisfies Meta<typeof CoreLifecycleStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CoreLifecycle: Story = {
  play: async ({ canvasElement }) => {
    const name = canvasElement.querySelector<HTMLInputElement>('input[name="name"]');
    const toggle = Array.from(canvasElement.querySelectorAll("button")).find(
      (button) => button.textContent === "Toggle note"
    );
    const submit = Array.from(canvasElement.querySelectorAll("button")).find(
      (button) => button.textContent === "Submit"
    );
    if (!name || !toggle || !submit) throw new window.Error("Expected core form controls");
    name.value = "Meu Store";
    name.dispatchEvent(new window.Event("input", { bubbles: true }));
    toggle.click();
    submit.click();
    await Promise.resolve();
    const output = canvasElement.querySelector("output");
    if (!output || !output.textContent || !output.textContent.includes('"name":"Meu Store"')) {
      throw new window.Error("Core form did not submit the mounted field set");
    }
    if (output.textContent.includes("note")) {
      throw new window.Error("Unmounted fields must not remain in the default submission");
    }
  }
};
