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

export const Default: Story = {};

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
