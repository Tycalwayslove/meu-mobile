// @vitest-environment jsdom
import { Checkbox, Radio } from "@meu/mobile";
import { fireEvent, render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MeuForm } from "./MeuForm";
import { MeuFormCheckbox } from "./MeuFormCheckbox";
import { MeuFormCheckboxGroup } from "./MeuFormCheckboxGroup";
import { MeuFormRadioGroup } from "./MeuFormRadioGroup";
import { MeuFormRate } from "./MeuFormRate";
import { MeuFormSearchField } from "./MeuFormSearchField";
import { MeuFormSegmentedControl } from "./MeuFormSegmentedControl";
import type { MeuFormSegmentedControlProps } from "./MeuFormSegmentedControl";
import { MeuFormSelector } from "./MeuFormSelector";
import { MeuFormSlider } from "./MeuFormSlider";
import { MeuFormStepper } from "./MeuFormStepper";
import { MeuFormSwitch } from "./MeuFormSwitch";
import { MeuFormTextArea } from "./MeuFormTextArea";
import { MeuFormTextInput } from "./MeuFormTextInput";
import { useMeuForm } from "./useMeuForm";
import type {
  MeuBooleanFieldPath,
  MeuCollectionFieldPath,
  MeuNumberFieldPath,
  MeuStringFieldPath
} from "./adapter-types";

type AdapterValues = {
  accepted: boolean;
  description: string;
  notifications: boolean;
  quantity: number;
  query: string;
  rating: number;
  score: number;
  services: string[];
  shipping: string;
  tags: string[];
  view: string;
};

const defaultValues: AdapterValues = {
  accepted: false,
  description: "",
  notifications: false,
  quantity: 1,
  query: "",
  rating: 0,
  score: 25,
  services: [],
  shipping: "standard",
  tags: [],
  view: "list"
};

const stringPath: MeuStringFieldPath<AdapterValues> = "query";
const booleanPath: MeuBooleanFieldPath<AdapterValues> = "accepted";
const numberPath: MeuNumberFieldPath<AdapterValues> = "quantity";
const collectionPath: MeuCollectionFieldPath<AdapterValues, string> = "services";
// @ts-expect-error Text adapters must not bind a numeric field.
const invalidStringPath: MeuStringFieldPath<AdapterValues> = "quantity";
const invalidSegmentedMode: MeuFormSegmentedControlProps<AdapterValues, string> = {
  name: "view",
  options: [{ label: "List", value: "list" }],
  // @ts-expect-error The form adapter intentionally excludes navigation tabs.
  mode: "tabs"
};
void [stringPath, booleanPath, numberPath, collectionPath, invalidStringPath, invalidSegmentedMode];

function AdapterMatrix({ disabled = false, required = false }) {
  const form = useMeuForm<AdapterValues>({ defaultValues, disabled });

  return (
    <MeuForm form={form} onSubmit={() => undefined}>
      <MeuFormTextArea<AdapterValues> name="description" label="Description" required={required} />
      <MeuFormSearchField<AdapterValues> name="query" label="Query" required={required} />
      <MeuFormCheckbox<AdapterValues> name="accepted" required={required}>
        Accept terms
      </MeuFormCheckbox>
      <MeuFormCheckboxGroup<AdapterValues, string>
        name="services"
        label="Services"
        required={required}
      >
        <Checkbox value="delivery">Delivery</Checkbox>
        <Checkbox value="pickup">Pickup</Checkbox>
      </MeuFormCheckboxGroup>
      <MeuFormRadioGroup<AdapterValues, string>
        name="shipping"
        label="Shipping"
        required={required}
      >
        <Radio value="standard">Standard</Radio>
        <Radio value="express">Express</Radio>
      </MeuFormRadioGroup>
      <MeuFormSwitch<AdapterValues>
        name="notifications"
        label="Notifications"
        required={required}
      />
      <MeuFormStepper<AdapterValues> name="quantity" label="Quantity" required={required} />
      <MeuFormSlider<AdapterValues> name="score" label="Score" required={required} />
      <MeuFormRate<AdapterValues> name="rating" label="Rating" required={required} />
      <MeuFormSelector<AdapterValues, string>
        name="tags"
        label="Tags"
        required={required}
        options={[
          { label: "New", value: "new" },
          { label: "Sale", value: "sale" }
        ]}
      />
      <MeuFormSegmentedControl<AdapterValues, string>
        name="view"
        label="View"
        required={required}
        options={[
          { label: "List", value: "list" },
          { label: "Grid", value: "grid" }
        ]}
      />
    </MeuForm>
  );
}

function AdapterEvents({
  onGroupBlur,
  onGroupChange,
  onTextChange
}: {
  onGroupBlur: () => void;
  onGroupChange: (formValue: string[], callbackValue: string[]) => void;
  onTextChange: (formValue: string, callbackValue: string) => void;
}) {
  const form = useMeuForm<AdapterValues>({ defaultValues });

  return (
    <MeuForm form={form} onSubmit={() => undefined}>
      <MeuFormTextInput<AdapterValues>
        name="query"
        label="Event query"
        onChange={(event) => onTextChange(form.getValues("query"), event.target.value)}
      />
      <MeuFormCheckboxGroup<AdapterValues, string>
        name="services"
        label="Event services"
        onBlur={onGroupBlur}
        onChange={(nextValue) => onGroupChange(form.getValues("services"), nextValue)}
      >
        <Checkbox value="delivery">Event delivery</Checkbox>
        <Checkbox value="pickup">Event pickup</Checkbox>
      </MeuFormCheckboxGroup>
    </MeuForm>
  );
}

describe("MeuForm adapter contract", () => {
  it("propagates the form-wide disabled state to every native control", () => {
    const { container } = render(<AdapterMatrix disabled />);
    const controls = Array.from(
      container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement>(
        "input, textarea, button"
      )
    );

    expect(controls.length).toBeGreaterThan(11);
    for (const control of controls) expect(control.disabled).toBe(true);
  });

  it("propagates required to native controls and composite semantics", () => {
    const { container } = render(<AdapterMatrix required />);

    for (const name of [
      "description",
      "query",
      "accepted",
      "shipping",
      "notifications",
      "quantity",
      "score",
      "rating",
      "tags",
      "view"
    ]) {
      const controls = Array.from(
        container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`)
      );
      expect(controls.length).toBeGreaterThan(0);
      expect(controls.some((control) => control.required)).toBe(true);
    }

    const checkboxGroup = container.querySelector('[data-meu-component="checkbox-group"]');
    const requiredDescription = checkboxGroup
      ? checkboxGroup.getAttribute("aria-describedby")
      : null;
    expect(requiredDescription).toMatch(/-required$/);
    const requiredElement = requiredDescription
      ? document.getElementById(requiredDescription)
      : null;
    expect(requiredElement ? requiredElement.textContent : null).toBe("必填");
  });

  it("updates React Hook Form before publishing consumer change callbacks", () => {
    const onTextChange = vi.fn();
    const onGroupChange = vi.fn();
    const { container } = render(
      <AdapterEvents
        onGroupBlur={() => undefined}
        onGroupChange={onGroupChange}
        onTextChange={onTextChange}
      />
    );

    const view = within(container);
    fireEvent.change(view.getByRole("textbox", { name: "Event query" }), {
      target: { value: "cats" }
    });
    fireEvent.click(view.getByRole("checkbox", { name: "Event delivery" }));

    expect(onTextChange).toHaveBeenCalledWith("cats", "cats");
    expect(onGroupChange).toHaveBeenCalledWith(["delivery"], ["delivery"]);
  });

  it("marks a composite adapter blurred only after focus leaves the whole group", () => {
    const onGroupBlur = vi.fn();
    const { container } = render(
      <AdapterEvents
        onGroupBlur={onGroupBlur}
        onGroupChange={() => undefined}
        onTextChange={() => undefined}
      />
    );
    const view = within(container);
    const first = view.getByRole("checkbox", { name: "Event delivery" });
    const second = view.getByRole("checkbox", { name: "Event pickup" });

    fireEvent.blur(first, { relatedTarget: second });
    expect(onGroupBlur).not.toHaveBeenCalled();

    fireEvent.blur(second, { relatedTarget: null });
    expect(onGroupBlur).toHaveBeenCalledTimes(1);
  });
});
