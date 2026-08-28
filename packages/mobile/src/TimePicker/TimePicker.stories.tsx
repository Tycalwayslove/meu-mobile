import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

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
