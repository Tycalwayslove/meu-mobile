// @vitest-environment jsdom
import { Button, Checkbox, Radio } from "@meu/mobile";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MeuForm } from "./MeuForm";
import { MeuFormCheckbox } from "./MeuFormCheckbox";
import { MeuFormCheckboxGroup } from "./MeuFormCheckboxGroup";
import { MeuFormRadioGroup } from "./MeuFormRadioGroup";
import { MeuFormSegmentedControl } from "./MeuFormSegmentedControl";
import { MeuFormSwitch } from "./MeuFormSwitch";
import { useMeuForm } from "./useMeuForm";

type Values = {
  agreement: boolean;
  notifications: boolean;
  services: string[];
  shipping: string;
  viewMode: string;
};

function SelectionForm({ onSubmit }: { onSubmit: (values: Values) => void }) {
  const form = useMeuForm<Values>({
    defaultValues: {
      agreement: false,
      notifications: false,
      services: [],
      shipping: "",
      viewMode: ""
    }
  });

  return (
    <MeuForm form={form} onSubmit={onSubmit}>
      <MeuFormCheckboxGroup<Values, string>
        name="services"
        label="服务范围"
        rules={{
          validate: (value) => (Array.isArray(value) && value.length > 0) || "至少选择一项服务"
        }}
      >
        <Checkbox value="delivery">配送</Checkbox>
        <Checkbox value="pickup">自提</Checkbox>
      </MeuFormCheckboxGroup>
      <MeuFormRadioGroup<Values, string>
        name="shipping"
        label="配送方式"
        rules={{ required: "请选择配送方式" }}
      >
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
        rules={{ required: "请选择展示方式" }}
      />
      <MeuFormCheckbox<Values>
        name="agreement"
        rules={{ validate: (value) => value === true || "请同意服务协议" }}
      >
        同意服务协议
      </MeuFormCheckbox>
      <Button type="submit">提交选择</Button>
    </MeuForm>
  );
}

describe("MeuForm selection adapters", () => {
  it("validates, focuses and submits array, scalar and boolean values", async () => {
    const onSubmit = vi.fn();
    render(<SelectionForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "提交选择" }));
    await waitFor(() => expect(screen.getAllByRole("alert")).toHaveLength(4));
    expect(document.activeElement).toBe(screen.getByRole("group", { name: "服务范围" }));

    fireEvent.click(screen.getByRole("checkbox", { name: "配送" }));
    fireEvent.click(screen.getByRole("radio", { name: "急速配送" }));
    fireEvent.click(screen.getByRole("switch", { name: "消息通知" }));
    fireEvent.click(screen.getByRole("radio", { name: "卡片" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "同意服务协议" }));
    fireEvent.click(screen.getByRole("button", { name: "提交选择" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        {
          agreement: true,
          notifications: true,
          services: ["delivery"],
          shipping: "express",
          viewMode: "card"
        },
        expect.anything()
      )
    );
  });
});
