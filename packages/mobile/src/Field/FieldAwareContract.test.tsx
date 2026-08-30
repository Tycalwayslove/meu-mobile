// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import type { AriaAttributes, ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Calendar } from "../Calendar";
import { Checkbox, CheckboxGroup } from "../Checkbox";
import { ImageUploader } from "../ImageUploader";
import { NumberKeyboardTrigger } from "../NumberKeyboard";
import { PasscodeInput } from "../PasscodeInput";
import { PickerTrigger } from "../Picker";
import { Radio, RadioGroup } from "../Radio";
import { Rate } from "../Rate";
import { SearchField } from "../SearchField";
import { SegmentedControl } from "../SegmentedControl";
import { Selector } from "../Selector";
import { Slider } from "../Slider";
import { Stepper } from "../Stepper";
import { Switch } from "../Switch";
import { TextArea } from "../TextArea";
import { TextInput } from "../TextInput";
import { Field } from "./Field";

type ContractProps = Pick<
  AriaAttributes,
  "aria-describedby" | "aria-invalid" | "aria-label" | "aria-labelledby"
>;

type RequiredContract = "aria-and-native" | "description" | "native";

type FieldAwareCase = {
  name: string;
  render: (props: ContractProps) => ReactElement;
  required: RequiredContract;
  target: (container: HTMLElement) => HTMLElement;
};

function requiredElement<TElement extends Element>(root: ParentNode, selector: string): TElement {
  const element = root.querySelector<TElement>(selector);
  if (!element) throw new Error(`Missing Field-aware target: ${selector}`);
  return element;
}

const inputTarget = (container: HTMLElement) =>
  requiredElement<HTMLElement>(container, "input:not([type=hidden])");

const cases: readonly FieldAwareCase[] = [
  {
    name: "Calendar",
    required: "description",
    target: (container) =>
      requiredElement<HTMLElement>(container, '[data-meu-component="calendar"]'),
    render: (props) => <Calendar defaultMonth={new Date(2026, 7, 1)} {...props} />
  },
  {
    name: "Checkbox",
    required: "native",
    target: inputTarget,
    render: (props) => <Checkbox {...props}>同意</Checkbox>
  },
  {
    name: "CheckboxGroup",
    required: "description",
    target: (container) =>
      requiredElement<HTMLElement>(container, '[data-meu-component="checkbox-group"]'),
    render: (props) => (
      <CheckboxGroup {...props}>
        <Checkbox value="delivery">配送</Checkbox>
      </CheckboxGroup>
    )
  },
  {
    name: "ImageUploader",
    required: "description",
    target: (container) =>
      requiredElement<HTMLElement>(container, '[data-meu-component="image-uploader"]'),
    render: (props) => (
      <ImageUploader {...props} value={[{ alt: "商品图", url: "/product.jpg" }]} upload={vi.fn()} />
    )
  },
  {
    name: "NumberKeyboardTrigger",
    required: "description",
    target: (container) =>
      requiredElement<HTMLElement>(container, '[data-meu-component="number-keyboard-trigger"]'),
    render: (props) => <NumberKeyboardTrigger {...props} />
  },
  {
    name: "PasscodeInput",
    required: "native",
    target: inputTarget,
    render: (props) => <PasscodeInput {...props} />
  },
  {
    name: "PickerTrigger",
    required: "description",
    target: (container) =>
      requiredElement<HTMLElement>(container, '[data-meu-component="picker-trigger"]'),
    render: (props) => <PickerTrigger {...props} />
  },
  {
    name: "Radio",
    required: "native",
    target: inputTarget,
    render: (props) => <Radio {...props}>标准配送</Radio>
  },
  {
    name: "RadioGroup",
    required: "aria-and-native",
    target: (container) =>
      requiredElement<HTMLElement>(container, '[data-meu-component="radio-group"]'),
    render: (props) => (
      <RadioGroup {...props}>
        <Radio value="standard">标准配送</Radio>
      </RadioGroup>
    )
  },
  {
    name: "Rate",
    required: "native",
    target: inputTarget,
    render: (props) => <Rate {...props} value={4} />
  },
  {
    name: "SearchField",
    required: "native",
    target: inputTarget,
    render: (props) => <SearchField {...props} />
  },
  {
    name: "SegmentedControl",
    required: "aria-and-native",
    target: (container) =>
      requiredElement<HTMLElement>(container, '[data-meu-component="segmented-control"]'),
    render: (props) => (
      <SegmentedControl {...props} mode="radiogroup" options={[{ label: "列表", value: "list" }]} />
    )
  },
  {
    name: "Selector",
    required: "aria-and-native",
    target: (container) =>
      requiredElement<HTMLElement>(container, '[data-meu-component="selector"]'),
    render: (props) => <Selector {...props} options={[{ label: "新品", value: "new" }]} />
  },
  {
    name: "Slider",
    required: "native",
    target: inputTarget,
    render: (props) => <Slider {...props} value={50} />
  },
  {
    name: "Stepper",
    required: "native",
    target: inputTarget,
    render: (props) => <Stepper {...props} value={2} />
  },
  {
    name: "Switch",
    required: "native",
    target: inputTarget,
    render: (props) => <Switch {...props} checked />
  },
  {
    name: "TextArea",
    required: "native",
    target: (container) => requiredElement<HTMLElement>(container, "textarea"),
    render: (props) => <TextArea {...props} value="介绍" />
  },
  {
    name: "TextInput",
    required: "native",
    target: inputTarget,
    render: (props) => <TextInput {...props} value="标题" />
  }
];

afterEach(cleanup);

function idTokens(element: Element, attribute: "aria-describedby" | "aria-labelledby") {
  const value = element.getAttribute(attribute);
  return value ? value.trim().split(/\s+/) : [];
}

function renderContract(
  contract: FieldAwareCase,
  props: ContractProps = {
    "aria-describedby": "caller-help contract-control-description caller-help",
    "aria-invalid": "spelling",
    "aria-labelledby": "caller-label contract-control-label caller-label"
  }
) {
  return render(
    <Field
      controlId="contract-control"
      label="Field label"
      description="Field description"
      error="Field error"
      required
    >
      <div>
        <span id="caller-label">Caller label</span>
        <span id="caller-help">Caller help</span>
        {contract.render(props)}
      </div>
    </Field>
  );
}

describe("Field-aware public control commercial contract", () => {
  it("covers every public FieldContext consumer exactly once", () => {
    expect(cases).toHaveLength(18);
    expect(new Set(cases.map((contract) => contract.name)).size).toBe(18);
  });

  it.each(cases)("$name preserves and deduplicates caller plus Field IDREFs", (contract) => {
    const { container } = renderContract(contract);
    const target = contract.target(container);

    expect(idTokens(target, "aria-describedby")).toEqual([
      "caller-help",
      "contract-control-description",
      "contract-control-required",
      "contract-control-error"
    ]);
    expect(idTokens(target, "aria-labelledby")).toEqual(["caller-label", "contract-control-label"]);
  });

  it.each(cases)("$name gives Field invalid state priority", (contract) => {
    const { container } = renderContract(contract);

    expect(contract.target(container).getAttribute("aria-invalid")).toBe("true");
  });

  it.each(cases)("$name keeps an explicit accessible name authoritative", (contract) => {
    const { container } = renderContract(contract, {
      "aria-label": "Explicit control name",
      "aria-labelledby": "caller-label"
    });
    const target = contract.target(container);

    expect(target.getAttribute("aria-label")).toBe("Explicit control name");
    expect(target.getAttribute("aria-labelledby")).toBeNull();
  });

  it.each(cases)("$name exposes the correct required semantics", (contract) => {
    const { container } = renderContract(contract);
    const target = contract.target(container);

    if (contract.required === "native") {
      expect((target as HTMLInputElement | HTMLTextAreaElement).required).toBe(true);
      return;
    }
    if (contract.required === "aria-and-native") {
      expect(target.getAttribute("aria-required")).toBe("true");
      const nativeControl = requiredElement<HTMLInputElement>(target, 'input:not([type="hidden"])');
      expect(nativeControl.required).toBe(true);
      return;
    }
    expect(idTokens(target, "aria-describedby")).toContain("contract-control-required");
    expect(target.hasAttribute("required")).toBe(false);
    expect(target.hasAttribute("aria-required")).toBe(false);
  });
});
