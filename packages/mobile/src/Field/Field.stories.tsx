import type { Meta, StoryObj } from "@storybook/react-vite";

import { Checkbox, CheckboxGroup } from "../Checkbox";
import { TextInput } from "../TextInput";
import { Field } from "./Field";

const meta = {
  title: "Forms/Field",
  component: Field,
  args: {
    children: <TextInput placeholder="请输入收货人姓名" />,
    description: "请与身份证姓名保持一致",
    label: "收货人",
    labelAssociation: "native",
    required: true
  }
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      'input[placeholder="请输入收货人姓名"]'
    );
    const label = canvasElement.querySelector<HTMLLabelElement>("label");
    if (!input || !label) throw new window.Error("Expected Field label and input");
    const describedBy = input.getAttribute("aria-describedby");
    const description = describedBy
      ? canvasElement.ownerDocument.getElementById(describedBy)
      : null;
    if (
      label.htmlFor !== input.id ||
      !label.textContent ||
      !label.textContent.includes("收货人") ||
      !input.required ||
      !description ||
      description.textContent !== "请与身份证姓名保持一致"
    ) {
      throw new window.Error("Field did not associate its label, requirement, and description");
    }
  }
};

export const Error: Story = {
  args: {
    description: undefined,
    error: "请输入收货人姓名"
  }
};

export const ExplicitControlId: Story = {
  args: {
    children: (
      <TextInput
        id="recipient-phone"
        aria-describedby="recipient-phone-policy"
        inputMode="tel"
        placeholder="请输入手机号"
      />
    ),
    description: "用于接收配送通知",
    label: "联系电话"
  },
  render: (args) => (
    <>
      <span id="recipient-phone-policy">仅用于本次订单</span>
      <Field {...args} />
    </>
  )
};

export const NestedLayout: Story = {
  args: {
    children: (
      <div style={{ display: "grid", gap: 8 }}>
        <TextInput autoComplete="name" name="contact" placeholder="请输入联系人" />
      </div>
    ),
    description: "用于配送通知",
    label: "联系人",
    labelAssociation: "auto",
    required: true
  },
  play: ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>('input[name="contact"]');
    const inputWrapper = input ? input.parentElement : null;
    const layout = inputWrapper ? inputWrapper.parentElement : null;
    if (
      !input ||
      !input.required ||
      !input.getAttribute("aria-labelledby") ||
      !input.getAttribute("aria-describedby") ||
      (layout ? layout.hasAttribute("id") : false)
    ) {
      throw new window.Error("Nested Field-aware input lost its label or required semantics");
    }
    if (canvasElement.querySelectorAll(`[id="${input.id}"]`).length !== 1) {
      throw new window.Error("Nested Field-aware input produced a duplicate control id");
    }
  }
};

export const CompositeControl: Story = {
  args: {
    children: (
      <CheckboxGroup defaultValue={["standard"]} name="shipping">
        <Checkbox value="standard">标准配送</Checkbox>
        <Checkbox value="express">加急配送</Checkbox>
      </CheckboxGroup>
    ),
    description: "加急配送可能产生额外费用",
    label: "配送方式",
    labelAssociation: "aria",
    required: true
  }
};

export const ExternalValidation: Story = {
  args: {
    children: <TextInput placeholder="输入优惠码" />,
    error: undefined,
    invalid: true,
    label: "优惠码",
    labelAssociation: "native",
    required: false
  }
};
