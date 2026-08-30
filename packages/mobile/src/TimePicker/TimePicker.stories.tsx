import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import { ConfigProvider } from "../ConfigProvider";
import { Field } from "../Field";
import { PickerTrigger } from "../Picker";
import { waitForStory } from "../storyTestUtils";
import { TimePicker } from "./TimePicker";
import { formatTimeValue } from "./resolveTimePicker";
import type { TimePickerHourCycle, TimeValue } from "./types";

const initial: TimeValue = { hour: 10, minute: 30, second: 0 };

function TimePickerPreview({ hourCycle = "h23" }: { hourCycle?: TimePickerHourCycle }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<TimeValue | null>(initial);
  const [confirmCount, setConfirmCount] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Field label="送达时间">
      <PickerTrigger
        ref={triggerRef}
        open={open}
        value={
          value
            ? formatTimeValue(value, { hourCycle, locale: "zh-CN", precision: "minute" })
            : undefined
        }
        onClick={() => setOpen(true)}
      />
      <output hidden data-time-confirm>
        {confirmCount}:{value ? `${value.hour}:${value.minute}` : "未选择"}
      </output>
      <TimePicker
        open={open}
        title="送达时间"
        hourCycle={hourCycle}
        max={{ hour: 18, minute: 0, second: 0 }}
        min={{ hour: 9, minute: 0, second: 0 }}
        minuteStep={15}
        returnFocusRef={triggerRef}
        value={value}
        onConfirm={(nextValue) => {
          setValue(nextValue);
          setConfirmCount((current) => current + 1);
        }}
        onOpenChange={setOpen}
      />
    </Field>
  );
}

const meta = {
  title: "Data Entry/TimePicker",
  component: TimePicker,
  args: {
    title: "选择时间"
  },
  render: () => <TimePickerPreview />
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLButtonElement>("button");
    if (!trigger) throw new window.Error("Expected TimePicker trigger");
    trigger.click();

    const body = canvasElement.ownerDocument.body;
    await waitForStory(
      () => body.querySelector('[data-meu-component="time-picker"]') !== null,
      "TimePicker did not open in its portal"
    );
    const picker = body.querySelector<HTMLElement>('[data-meu-component="time-picker"]');
    if (!picker) throw new window.Error("TimePicker did not open in its portal");
    const dialog = picker.closest<HTMLElement>('[role="dialog"]');
    if (!dialog) throw new window.Error("TimePicker did not render a dialog");
    const buttons = Array.from(dialog.querySelectorAll<HTMLButtonElement>("button"));
    const cancel = buttons.find((button) => (button.textContent || "").trim() === "取消");
    const confirm = buttons.find((button) => (button.textContent || "").trim() === "确定");
    if (!cancel || !confirm) throw new window.Error("Expected TimePicker header actions");
    await waitForStory(
      () => canvasElement.ownerDocument.activeElement === cancel,
      "TimePicker did not focus its cancel action on open"
    );

    const minuteWheel = dialog.querySelector<HTMLElement>('[role="listbox"][aria-label="分"]');
    const minute45 = minuteWheel
      ? Array.from(minuteWheel.querySelectorAll<HTMLElement>('[role="option"]')).find(
          (option) => (option.textContent || "").trim() === "45分"
        )
      : undefined;
    if (!minute45) throw new window.Error("Expected selectable 45 minute option");
    minute45.click();
    await waitForStory(
      () => minute45.getAttribute("aria-selected") === "true",
      "TimePicker did not update its draft selection"
    );

    confirm.click();
    const confirmation = canvasElement.querySelector<HTMLOutputElement>("[data-time-confirm]");
    await waitForStory(
      () =>
        Boolean(confirmation && (confirmation.textContent || "").trim() === "1:10:45") &&
        canvasElement.ownerDocument.activeElement === trigger,
      "TimePicker did not publish its confirmed value and restore trigger focus"
    );
  }
};

export const TwelveHour: Story = {
  render: () => <TimePickerPreview hourCycle="h12" />
};

export const SecondsAndFilter: Story = {
  args: {
    defaultValue: { hour: 10, minute: 30, second: 20 },
    filter: {
      second: (value) => value !== 40
    },
    max: { hour: 10, minute: 31, second: 50 },
    min: { hour: 10, minute: 29, second: 10 },
    minuteStep: 1,
    open: true,
    precision: "second",
    secondStep: 10,
    title: "精确时间"
  },
  render: (args) => <TimePicker {...args} />
};

export const ConstrainedTwelveHourSeconds: Story = {
  args: {
    "aria-label": "Constrained appointment time",
    defaultValue: { hour: 12, minute: 0, second: 20 },
    filter: {
      second: (value) => value !== 40
    },
    hourCycle: "h12",
    max: { hour: 13, minute: 10, second: 50 },
    min: { hour: 11, minute: 50, second: 10 },
    minuteStep: 10,
    open: true,
    precision: "second",
    secondStep: 10
  },
  render: (args) => (
    <ConfigProvider locale="en-US">
      <TimePicker {...args} />
    </ConfigProvider>
  ),
  play: async ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;
    await waitForStory(
      () => body.querySelector('[data-meu-component="time-picker"]') !== null,
      "Expected the constrained TimePicker"
    );
    const picker = body.querySelector<HTMLElement>('[data-meu-component="time-picker"]');
    const dialog = picker ? picker.closest<HTMLElement>('[role="dialog"]') : null;
    if (!dialog) throw new window.Error("Expected constrained TimePicker dialog");
    const wheels = Array.from(dialog.querySelectorAll<HTMLElement>('[role="listbox"]'));
    const names = wheels.map((wheel) => wheel.getAttribute("aria-label"));
    if (names.join("|") !== "Hour|Minute|Second|Period") {
      throw new window.Error(`Unexpected time wheel order: ${names.join("|")}`);
    }
    const disabledSecond = dialog.querySelector<HTMLElement>(
      '[role="listbox"][aria-label="Second"] [role="option"][aria-label="40"]'
    );
    const selectedSecond = dialog.querySelector<HTMLElement>(
      '[role="listbox"][aria-label="Second"] [role="option"][aria-label="20"]'
    );
    if (!disabledSecond || disabledSecond.getAttribute("aria-disabled") !== "true") {
      throw new window.Error("Expected the filtered second option to remain disabled");
    }
    if (!selectedSecond || selectedSecond.getAttribute("aria-selected") !== "true") {
      throw new window.Error("Expected the normalized second selection");
    }
    for (const wheel of wheels) {
      const activeId = wheel.getAttribute("aria-activedescendant");
      if (!activeId || !body.querySelector(`#${CSS.escape(activeId)}`)) {
        throw new window.Error("TimePicker listbox has an unresolved active descendant");
      }
    }
  }
};

export const LongLocalizedActionsRtl: Story = {
  args: {
    title: "Choose the preferred delivery time for this international order",
    cancelText: "Keep the currently scheduled time",
    columnLabels: {
      hour: "Delivery hour",
      minute: "Delivery minute",
      period: "Morning or afternoon"
    },
    confirmText: "Confirm the selected delivery time",
    defaultValue: { hour: 23, minute: 55, second: 0 },
    hourCycle: "h12",
    minuteStep: 5,
    open: true
  },
  render: (args) => (
    <ConfigProvider dir="rtl" locale="en-US" motion="reduced">
      <TimePicker {...args} />
    </ConfigProvider>
  ),
  play: async ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;
    await waitForStory(
      () => body.querySelector('[data-meu-component="time-picker"]') !== null,
      "Expected the localized TimePicker"
    );
    const picker = body.querySelector<HTMLElement>('[data-meu-component="time-picker"]');
    const dialog = picker ? picker.closest<HTMLElement>('[role="dialog"]') : null;
    if (!picker || !dialog) throw new window.Error("Expected localized TimePicker dialog");
    const layer = dialog.closest<HTMLElement>('[data-meu-overlay-layer="popup"]');
    if (
      !layer ||
      layer.getAttribute("dir") !== "rtl" ||
      layer.getAttribute("data-meu-motion") !== "reduced"
    ) {
      throw new window.Error("TimePicker did not preserve RTL and reduced-motion context");
    }
    const wheelNames = Array.from(dialog.querySelectorAll('[role="listbox"]')).map((wheel) =>
      wheel.getAttribute("aria-label")
    );
    if (wheelNames.join("|") !== "Delivery hour|Delivery minute|Morning or afternoon") {
      throw new window.Error("RTL changed the semantic time-wheel order");
    }
    if (picker.scrollWidth > picker.clientWidth + 1) {
      throw new window.Error("Localized TimePicker overflowed horizontally");
    }
    const actions = Array.from(dialog.querySelectorAll<HTMLButtonElement>("button"));
    if (
      actions.length !== 2 ||
      actions.some((action) => action.getBoundingClientRect().height < 44)
    ) {
      throw new window.Error("Localized TimePicker actions missed the 44px touch target");
    }
  }
};
