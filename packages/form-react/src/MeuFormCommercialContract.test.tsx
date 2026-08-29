// @vitest-environment jsdom
import { Checkbox, Radio } from "@meu/mobile";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { MeuForm } from "./MeuForm";
import { MeuFormCalendar } from "./MeuFormCalendar";
import { MeuFormCascadePicker } from "./MeuFormCascadePicker";
import { MeuFormCheckbox } from "./MeuFormCheckbox";
import { MeuFormCheckboxGroup } from "./MeuFormCheckboxGroup";
import { MeuFormDatePicker } from "./MeuFormDatePicker";
import { MeuFormDateRangePicker } from "./MeuFormDateRangePicker";
import { MeuFormImageUploader } from "./MeuFormImageUploader";
import { MeuFormNumberKeyboard } from "./MeuFormNumberKeyboard";
import { MeuFormPasscodeInput } from "./MeuFormPasscodeInput";
import { MeuFormPicker } from "./MeuFormPicker";
import { MeuFormRadioGroup } from "./MeuFormRadioGroup";
import { MeuFormRate } from "./MeuFormRate";
import { MeuFormSearchField } from "./MeuFormSearchField";
import { MeuFormSegmentedControl } from "./MeuFormSegmentedControl";
import { MeuFormSelector } from "./MeuFormSelector";
import { MeuFormSlider } from "./MeuFormSlider";
import { MeuFormStepper } from "./MeuFormStepper";
import { MeuFormSwitch } from "./MeuFormSwitch";
import { MeuFormTextArea } from "./MeuFormTextArea";
import { MeuFormTextInput } from "./MeuFormTextInput";
import { MeuFormTimePicker } from "./MeuFormTimePicker";
import { MeuFormTreeSelect } from "./MeuFormTreeSelect";
import { useMeuForm } from "./useMeuForm";

type ContractCategory = "complex value" | "group" | "native input" | "overlay trigger";

type ContractValues = {
  accepted: boolean;
  appointment: string[];
  calendarDate: Date | null;
  code: string;
  deliveryDate: Date | null;
  deliveryTime: { hour: number; minute: number; second: number } | null;
  deliveryWindow: [Date, Date] | null;
  description: string;
  images: Array<{ alt: string; url: string }>;
  notifications: boolean;
  paymentAmount: string;
  quantity: number;
  query: string;
  rating: number;
  region: string[];
  score: number;
  services: string[];
  shipping: string;
  tags: string[];
  title: string;
  treeValues: string[];
  view: string;
};

const firstDate = new Date(2026, 7, 10);
const secondDate = new Date(2026, 7, 15);
const image = { alt: "商品图", url: "/product.jpg" };
const defaultValues: ContractValues = {
  accepted: true,
  appointment: ["today"],
  calendarDate: firstDate,
  code: "1234",
  deliveryDate: firstDate,
  deliveryTime: { hour: 10, minute: 30, second: 0 },
  deliveryWindow: [firstDate, secondDate],
  description: "店铺介绍",
  images: [image],
  notifications: true,
  paymentAmount: "12.5",
  quantity: 2,
  query: "订单",
  rating: 4,
  region: ["zhejiang", "hangzhou"],
  score: 60,
  services: ["delivery"],
  shipping: "standard",
  tags: ["new"],
  title: "喵呜店",
  treeValues: ["phone"],
  view: "list"
};

type AdapterCase = {
  category: ContractCategory;
  focusTarget: (fieldRoot: HTMLElement) => HTMLElement;
  refTarget?: (fieldRoot: HTMLElement) => HTMLElement;
  name: keyof ContractValues;
  nativeRequired: boolean;
  readOnly: boolean;
  render: (props: { readOnly: boolean; required: boolean }) => ReactElement;
};

function requiredElement<TElement extends Element>(root: ParentNode, selector: string): TElement {
  const element = root.querySelector<TElement>(selector);
  if (!element) throw new Error(`Missing contract target: ${selector}`);
  return element;
}

const firstNamedControl = (fieldRoot: HTMLElement) =>
  requiredElement<HTMLElement>(fieldRoot, "input:not([type=hidden]), textarea");
const pickerTrigger = (fieldRoot: HTMLElement) =>
  requiredElement<HTMLElement>(fieldRoot, '[data-meu-component="picker-trigger"]');

const adapterCases: readonly AdapterCase[] = [
  {
    category: "native input",
    name: "title",
    nativeRequired: true,
    readOnly: true,
    focusTarget: firstNamedControl,
    render: ({ readOnly, required }) => (
      <MeuFormTextInput<ContractValues>
        name="title"
        label="TextInput"
        readOnly={readOnly}
        required={required}
      />
    )
  },
  {
    category: "native input",
    name: "description",
    nativeRequired: true,
    readOnly: true,
    focusTarget: firstNamedControl,
    render: ({ readOnly, required }) => (
      <MeuFormTextArea<ContractValues>
        name="description"
        label="TextArea"
        readOnly={readOnly}
        required={required}
      />
    )
  },
  {
    category: "native input",
    name: "query",
    nativeRequired: true,
    readOnly: true,
    focusTarget: firstNamedControl,
    render: ({ readOnly, required }) => (
      <MeuFormSearchField<ContractValues>
        name="query"
        label="SearchField"
        readOnly={readOnly}
        required={required}
      />
    )
  },
  {
    category: "native input",
    name: "accepted",
    nativeRequired: true,
    readOnly: true,
    focusTarget: firstNamedControl,
    render: ({ readOnly, required }) => (
      <MeuFormCheckbox<ContractValues>
        name="accepted"
        label="Checkbox"
        readOnly={readOnly}
        required={required}
      >
        同意
      </MeuFormCheckbox>
    )
  },
  {
    category: "native input",
    name: "notifications",
    nativeRequired: true,
    readOnly: true,
    focusTarget: firstNamedControl,
    render: ({ readOnly, required }) => (
      <MeuFormSwitch<ContractValues>
        name="notifications"
        label="Switch"
        readOnly={readOnly}
        required={required}
      />
    )
  },
  {
    category: "native input",
    name: "quantity",
    nativeRequired: true,
    readOnly: true,
    focusTarget: firstNamedControl,
    render: ({ readOnly, required }) => (
      <MeuFormStepper<ContractValues>
        name="quantity"
        label="Stepper"
        readOnly={readOnly}
        required={required}
      />
    )
  },
  {
    category: "native input",
    name: "score",
    nativeRequired: true,
    readOnly: true,
    focusTarget: firstNamedControl,
    render: ({ readOnly, required }) => (
      <MeuFormSlider<ContractValues>
        name="score"
        label="Slider"
        readOnly={readOnly}
        required={required}
      />
    )
  },
  {
    category: "native input",
    name: "rating",
    nativeRequired: true,
    readOnly: true,
    focusTarget: firstNamedControl,
    render: ({ readOnly, required }) => (
      <MeuFormRate<ContractValues>
        name="rating"
        label="Rate"
        readOnly={readOnly}
        required={required}
      />
    )
  },
  {
    category: "native input",
    name: "code",
    nativeRequired: true,
    readOnly: true,
    focusTarget: firstNamedControl,
    render: ({ readOnly, required }) => (
      <MeuFormPasscodeInput<ContractValues>
        name="code"
        label="PasscodeInput"
        readOnly={readOnly}
        required={required}
      />
    )
  },
  {
    category: "group",
    name: "services",
    nativeRequired: false,
    readOnly: true,
    focusTarget: firstNamedControl,
    refTarget: (fieldRoot) =>
      requiredElement<HTMLElement>(fieldRoot, '[data-meu-component="checkbox-group"]'),
    render: ({ readOnly, required }) => (
      <MeuFormCheckboxGroup<ContractValues, string>
        name="services"
        label="CheckboxGroup"
        readOnly={readOnly}
        required={required}
      >
        <Checkbox value="delivery">配送</Checkbox>
        <Checkbox value="pickup">自提</Checkbox>
      </MeuFormCheckboxGroup>
    )
  },
  {
    category: "group",
    name: "shipping",
    nativeRequired: true,
    readOnly: true,
    focusTarget: firstNamedControl,
    refTarget: (fieldRoot) =>
      requiredElement<HTMLElement>(fieldRoot, '[data-meu-component="radio-group"]'),
    render: ({ readOnly, required }) => (
      <MeuFormRadioGroup<ContractValues, string>
        name="shipping"
        label="RadioGroup"
        readOnly={readOnly}
        required={required}
      >
        <Radio value="standard">标准</Radio>
        <Radio value="express">加急</Radio>
      </MeuFormRadioGroup>
    )
  },
  {
    category: "group",
    name: "tags",
    nativeRequired: true,
    readOnly: true,
    focusTarget: firstNamedControl,
    render: ({ readOnly, required }) => (
      <MeuFormSelector<ContractValues, string>
        name="tags"
        label="Selector"
        readOnly={readOnly}
        required={required}
        options={[
          { label: "新品", value: "new" },
          { label: "促销", value: "sale" }
        ]}
      />
    )
  },
  {
    category: "group",
    name: "view",
    nativeRequired: true,
    readOnly: false,
    focusTarget: firstNamedControl,
    render: ({ required }) => (
      <MeuFormSegmentedControl<ContractValues, string>
        name="view"
        label="SegmentedControl"
        required={required}
        options={[
          { label: "列表", value: "list" },
          { label: "网格", value: "grid" }
        ]}
      />
    )
  },
  {
    category: "overlay trigger",
    name: "appointment",
    nativeRequired: false,
    readOnly: false,
    focusTarget: pickerTrigger,
    render: ({ required }) => (
      <MeuFormPicker<ContractValues, string>
        name="appointment"
        label="Picker"
        required={required}
        columns={[[{ label: "今天", value: "today" }]]}
      />
    )
  },
  {
    category: "overlay trigger",
    name: "region",
    nativeRequired: false,
    readOnly: false,
    focusTarget: pickerTrigger,
    render: ({ required }) => (
      <MeuFormCascadePicker<ContractValues, string>
        name="region"
        label="CascadePicker"
        required={required}
        options={[
          {
            label: "浙江",
            value: "zhejiang",
            children: [{ label: "杭州", value: "hangzhou" }]
          }
        ]}
      />
    )
  },
  {
    category: "overlay trigger",
    name: "deliveryDate",
    nativeRequired: false,
    readOnly: false,
    focusTarget: pickerTrigger,
    render: ({ required }) => (
      <MeuFormDatePicker<ContractValues>
        name="deliveryDate"
        label="DatePicker"
        required={required}
      />
    )
  },
  {
    category: "overlay trigger",
    name: "deliveryWindow",
    nativeRequired: false,
    readOnly: false,
    focusTarget: pickerTrigger,
    render: ({ required }) => (
      <MeuFormDateRangePicker<ContractValues>
        name="deliveryWindow"
        label="DateRangePicker"
        required={required}
      />
    )
  },
  {
    category: "overlay trigger",
    name: "deliveryTime",
    nativeRequired: false,
    readOnly: false,
    focusTarget: pickerTrigger,
    render: ({ required }) => (
      <MeuFormTimePicker<ContractValues>
        name="deliveryTime"
        label="TimePicker"
        required={required}
      />
    )
  },
  {
    category: "overlay trigger",
    name: "treeValues",
    nativeRequired: false,
    readOnly: true,
    focusTarget: pickerTrigger,
    render: ({ readOnly, required }) => (
      <MeuFormTreeSelect<ContractValues, string>
        name="treeValues"
        label="TreeSelect"
        readOnly={readOnly}
        required={required}
        options={[{ label: "手机", value: "phone" }]}
      />
    )
  },
  {
    category: "overlay trigger",
    name: "paymentAmount",
    nativeRequired: false,
    readOnly: false,
    focusTarget: (fieldRoot) =>
      requiredElement<HTMLElement>(fieldRoot, '[data-meu-component="number-keyboard-trigger"]'),
    render: ({ required }) => (
      <MeuFormNumberKeyboard<ContractValues>
        name="paymentAmount"
        label="NumberKeyboard"
        required={required}
      />
    )
  },
  {
    category: "complex value",
    name: "calendarDate",
    nativeRequired: false,
    readOnly: false,
    focusTarget: (fieldRoot) =>
      requiredElement<HTMLElement>(
        fieldRoot,
        '[data-meu-component="calendar"] button[tabindex="0"]'
      ),
    render: ({ required }) => (
      <MeuFormCalendar<ContractValues> name="calendarDate" label="Calendar" required={required} />
    )
  },
  {
    category: "complex value",
    name: "images",
    nativeRequired: false,
    readOnly: true,
    focusTarget: (fieldRoot) => requiredElement<HTMLElement>(fieldRoot, 'input[type="file"]'),
    render: ({ readOnly, required }) => (
      <MeuFormImageUploader<ContractValues>
        name="images"
        label="ImageUploader"
        readOnly={readOnly}
        required={required}
        upload={() => Promise.resolve(image)}
      />
    )
  }
];

afterEach(cleanup);

function ContractHarness({
  adapter,
  readOnly = false,
  required = false
}: {
  adapter: AdapterCase;
  readOnly?: boolean;
  required?: boolean;
}) {
  const form = useMeuForm<ContractValues>({ defaultValues });
  const touched = Boolean(form.formState.touchedFields[adapter.name]);

  return (
    <MeuForm aria-label={`${adapter.name} contract`} form={form} onSubmit={() => undefined}>
      {adapter.render({ readOnly, required })}
      <button type="button" data-testid="focus-field" onClick={() => form.setFocus(adapter.name)}>
        Focus
      </button>
      <output data-testid="touched-state">{String(touched)}</output>
    </MeuForm>
  );
}

function fieldRoot(container: HTMLElement, adapter: AdapterCase) {
  return requiredElement<HTMLElement>(container, `[data-meu-form-field="${adapter.name}"]`);
}

describe("MeuForm commercial adapter contract matrix", () => {
  it("classifies every public adapter exactly once", () => {
    expect(adapterCases).toHaveLength(22);
    expect(new Set(adapterCases.map((adapter) => adapter.name)).size).toBe(22);
    expect(
      adapterCases.reduce<Record<ContractCategory, number>>(
        (counts, adapter) => ({
          ...counts,
          [adapter.category]: counts[adapter.category] + 1
        }),
        { "complex value": 0, group: 0, "native input": 0, "overlay trigger": 0 }
      )
    ).toEqual({ "complex value": 2, group: 4, "native input": 9, "overlay trigger": 7 });
  });

  it.each(adapterCases)(
    "$category / $name marks touched after focus leaves its field",
    async (adapter) => {
      const { container, getByTestId } = render(<ContractHarness adapter={adapter} />);
      const target = adapter.focusTarget(fieldRoot(container, adapter));

      fireEvent.focus(target);
      fireEvent.blur(target, { relatedTarget: null });

      await waitFor(() => expect(getByTestId("touched-state").textContent).toBe("true"));
    }
  );

  it.each(adapterCases)("$category / $name registers a working RHF focus ref", async (adapter) => {
    const { container, getByTestId } = render(<ContractHarness adapter={adapter} />);
    const root = fieldRoot(container, adapter);
    const target = adapter.refTarget ? adapter.refTarget(root) : adapter.focusTarget(root);

    fireEvent.click(getByTestId("focus-field"));

    await waitFor(() => expect(document.activeElement).toBe(target));
  });

  it.each(adapterCases)("$category / $name exposes its required contract", (adapter) => {
    const { container } = render(<ContractHarness adapter={adapter} required />);
    const root = fieldRoot(container, adapter);
    const requiredDescription = Array.from(root.querySelectorAll<HTMLElement>("[id]")).find(
      (element) => element.textContent === "必填"
    );

    expect(root.getAttribute("data-required")).toBe("true");
    if (adapter.nativeRequired) {
      const nativeControls = Array.from(
        root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
          "input:not([type=hidden]), textarea"
        )
      );
      expect(nativeControls.length).toBeGreaterThan(0);
      expect(nativeControls.some((control) => control.required)).toBe(true);
    } else {
      expect(requiredDescription).toBeDefined();
      if (!requiredDescription) throw new Error(`Missing required description: ${adapter.name}`);
      const describedControl = Array.from(
        root.querySelectorAll<HTMLElement>("[aria-describedby]")
      ).find((element) => {
        const describedBy = element.getAttribute("aria-describedby");
        return describedBy ? describedBy.split(/\s+/).includes(requiredDescription.id) : false;
      });
      expect(describedControl).toBeDefined();
    }
  });

  it.each(adapterCases.filter((adapter) => adapter.readOnly))(
    "$category / $name preserves a submitted value and exposes read-only semantics",
    (adapter) => {
      const { container } = render(<ContractHarness adapter={adapter} readOnly />);
      const root = fieldRoot(container, adapter);
      const form = requiredElement<HTMLFormElement>(container, "form");
      const readOnlySemantic = root.querySelector(
        "[readonly], [aria-readonly=true], [data-readonly=true], [data-state=readonly], [role=meter]"
      );

      expect(readOnlySemantic).not.toBeNull();
      expect(new FormData(form).getAll(adapter.name).length).toBeGreaterThan(0);
    }
  );

  it("records the eight adapters whose public control does not define readOnly", () => {
    expect(
      adapterCases.filter((adapter) => !adapter.readOnly).map((adapter) => adapter.name)
    ).toEqual([
      "view",
      "appointment",
      "region",
      "deliveryDate",
      "deliveryWindow",
      "deliveryTime",
      "paymentAmount",
      "calendarDate"
    ]);
  });
});
