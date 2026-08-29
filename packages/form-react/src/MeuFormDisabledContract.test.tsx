// @vitest-environment jsdom
import { Checkbox, Radio } from "@meu/mobile";
import { fireEvent, render, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
import type { ImageUploaderItem } from "@meu/mobile";

type DisabledValues = {
  accepted: boolean;
  appointment: string[];
  calendarDate: Date | null;
  code: string;
  deliveryDate: Date | null;
  deliveryTime: { hour: number; minute: number; second: number } | null;
  deliveryWindow: [Date, Date] | null;
  description: string;
  images: ImageUploaderItem[];
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
const resetStartDate = new Date(2026, 8, 2);
const resetEndDate = new Date(2026, 8, 8);
const image = { alt: "商品图", url: "/product.jpg" };
const resetImage = { alt: "新商品图", url: "/reset-product.jpg" };
const defaultValues: DisabledValues = {
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

const resetValues: DisabledValues = {
  accepted: false,
  appointment: ["tomorrow"],
  calendarDate: resetStartDate,
  code: "9876",
  deliveryDate: resetStartDate,
  deliveryTime: { hour: 18, minute: 45, second: 0 },
  deliveryWindow: [resetStartDate, resetEndDate],
  description: "重置后的介绍",
  images: [resetImage],
  notifications: false,
  paymentAmount: "88.6",
  quantity: 5,
  query: "重置订单",
  rating: 2,
  region: ["jiangsu", "nanjing"],
  score: 30,
  services: ["pickup"],
  shipping: "express",
  tags: ["sale"],
  title: "重置店铺",
  treeValues: ["tablet"],
  view: "grid"
};

function DisabledAdapterMatrix({
  disabled,
  onSubmit
}: {
  disabled: boolean;
  onSubmit: (values: Partial<DisabledValues>) => void;
}) {
  const form = useMeuForm<DisabledValues>({ defaultValues });

  return (
    <MeuForm aria-label="disabled adapter matrix" form={form} onSubmit={onSubmit}>
      <div data-testid="adapter-controls">
        <MeuFormTextInput<DisabledValues> name="title" label="标题" disabled={disabled} />
        <MeuFormTextArea<DisabledValues> name="description" label="介绍" disabled={disabled} />
        <MeuFormSearchField<DisabledValues> name="query" label="搜索" disabled={disabled} />
        <MeuFormCheckbox<DisabledValues> name="accepted" disabled={disabled}>
          同意
        </MeuFormCheckbox>
        <MeuFormCheckboxGroup<DisabledValues, string>
          name="services"
          label="服务"
          disabled={disabled}
        >
          <Checkbox value="delivery">配送</Checkbox>
          <Checkbox value="pickup">自提</Checkbox>
        </MeuFormCheckboxGroup>
        <MeuFormRadioGroup<DisabledValues, string>
          name="shipping"
          label="配送方式"
          disabled={disabled}
        >
          <Radio value="standard">标准配送</Radio>
          <Radio value="express">加急配送</Radio>
        </MeuFormRadioGroup>
        <MeuFormSwitch<DisabledValues> name="notifications" label="通知" disabled={disabled} />
        <MeuFormStepper<DisabledValues> name="quantity" label="数量" disabled={disabled} />
        <MeuFormSlider<DisabledValues> name="score" label="分数" disabled={disabled} />
        <MeuFormRate<DisabledValues> name="rating" label="评分" disabled={disabled} />
        <MeuFormSelector<DisabledValues, string>
          name="tags"
          label="标签"
          disabled={disabled}
          options={[
            { label: "新品", value: "new" },
            { label: "促销", value: "sale" }
          ]}
        />
        <MeuFormSegmentedControl<DisabledValues, string>
          name="view"
          label="视图"
          disabled={disabled}
          options={[
            { label: "列表", value: "list" },
            { label: "网格", value: "grid" }
          ]}
        />
        <MeuFormPicker<DisabledValues, string>
          name="appointment"
          label="预约"
          columns={[
            [
              { label: "今天", value: "today" },
              { label: "明天", value: "tomorrow" }
            ]
          ]}
          triggerProps={{ disabled }}
        />
        <MeuFormCascadePicker<DisabledValues, string>
          name="region"
          label="地区"
          options={[
            {
              label: "浙江",
              value: "zhejiang",
              children: [{ label: "杭州", value: "hangzhou" }]
            },
            {
              label: "江苏",
              value: "jiangsu",
              children: [{ label: "南京", value: "nanjing" }]
            }
          ]}
          triggerProps={{ disabled }}
        />
        <MeuFormDatePicker<DisabledValues>
          name="deliveryDate"
          label="日期"
          triggerProps={{ disabled }}
        />
        <MeuFormDateRangePicker<DisabledValues>
          name="deliveryWindow"
          label="日期范围"
          disabled={disabled}
        />
        <MeuFormCalendar<DisabledValues> name="calendarDate" label="日历" disabled={disabled} />
        <MeuFormTimePicker<DisabledValues>
          name="deliveryTime"
          label="时间"
          triggerProps={{ disabled }}
        />
        <MeuFormTreeSelect<DisabledValues, string>
          name="treeValues"
          label="类目"
          disabled={disabled}
          options={[
            { label: "手机", value: "phone" },
            { label: "平板", value: "tablet" }
          ]}
        />
        <MeuFormNumberKeyboard<DisabledValues>
          name="paymentAmount"
          label="金额"
          disabled={disabled}
        />
        <MeuFormPasscodeInput<DisabledValues> name="code" label="验证码" disabled={disabled} />
        <MeuFormImageUploader<DisabledValues>
          name="images"
          label="图片"
          disabled={disabled}
          upload={() => Promise.resolve(image)}
        />
      </div>
      <button type="button" onClick={() => form.reset(resetValues)}>
        重置全部适配器
      </button>
    </MeuForm>
  );
}

describe("MeuForm local disabled contract", () => {
  it("omits every locally disabled adapter from native and RHF submission, then restores it", async () => {
    const onSubmit = vi.fn();
    const { container, getByTestId, rerender } = render(
      <DisabledAdapterMatrix disabled onSubmit={onSubmit} />
    );
    const form = container.querySelector("form")!;
    const controls = Array.from(
      getByTestId("adapter-controls").querySelectorAll<
        HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement
      >("button, input, textarea")
    );

    expect(controls.length).toBeGreaterThan(22);
    expect(controls.every((control) => control.disabled)).toBe(true);
    expect(Array.from(new FormData(form).keys())).toEqual([]);

    fireEvent.submit(form);
    await waitFor(() => expect(onSubmit).toHaveBeenLastCalledWith({}, expect.anything()));

    rerender(<DisabledAdapterMatrix disabled={false} onSubmit={onSubmit} />);

    await waitFor(() => {
      const enabledControls = Array.from(
        getByTestId("adapter-controls").querySelectorAll<
          HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement
        >("button, input, textarea")
      );
      expect(enabledControls.some((control) => !control.disabled)).toBe(true);
      expect(new FormData(form).get("title")).toBe("喵呜店");
      expect(new FormData(form).getAll("deliveryWindow")).toEqual(["2026-08-10", "2026-08-15"]);
      expect(new FormData(form).get("images")).toBe("/product.jpg");
    });

    fireEvent.submit(form);
    await waitFor(() =>
      expect(onSubmit).toHaveBeenLastCalledWith(defaultValues, expect.anything())
    );
  });

  it("resets all 22 adapters to one coherent RHF and native-form snapshot", async () => {
    const onSubmit = vi.fn();
    const { container } = render(<DisabledAdapterMatrix disabled={false} onSubmit={onSubmit} />);
    const view = within(container);

    fireEvent.click(view.getByRole("button", { name: "重置全部适配器" }));

    expect(view.getByRole<HTMLInputElement>("textbox", { name: "标题" }).value).toBe("重置店铺");
    expect(view.getByRole<HTMLInputElement>("checkbox", { name: "同意" }).checked).toBe(false);
    expect(view.getByRole<HTMLInputElement>("radio", { name: "加急配送" }).checked).toBe(true);

    const form = container.querySelector("form")!;
    const formData = new FormData(form);
    expect(formData.get("title")).toBe("重置店铺");
    expect(formData.get("paymentAmount")).toBe("88.6");
    expect(formData.get("code")).toBe("9876");
    expect(formData.getAll("deliveryWindow")).toEqual(["2026-09-02", "2026-09-08"]);
    expect(formData.get("images")).toBe("/reset-product.jpg");

    fireEvent.submit(form);
    await waitFor(() => expect(onSubmit).toHaveBeenLastCalledWith(resetValues, expect.anything()));
  });
});
