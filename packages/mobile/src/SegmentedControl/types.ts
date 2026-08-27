import type { ChangeEvent, HTMLAttributes, ReactNode, Ref } from "react";

export type SegmentedControlValue = string | number;
export type SegmentedControlSize = "small" | "medium" | "large";
export type SegmentedControlStatus = "default" | "error";

export type SegmentedControlOption<TValue extends SegmentedControlValue = SegmentedControlValue> = {
  disabled?: boolean;
  icon?: ReactNode;
  label: ReactNode;
  value: TValue;
};

export type SegmentedControlProps<TValue extends SegmentedControlValue = SegmentedControlValue> =
  Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> & {
    block?: boolean;
    defaultValue?: TValue;
    disabled?: boolean;
    name?: string;
    onChange?: (value: TValue, event: ChangeEvent<HTMLInputElement>) => void;
    options: readonly SegmentedControlOption<TValue>[];
    ref?: Ref<HTMLDivElement>;
    required?: boolean;
    size?: SegmentedControlSize;
    status?: SegmentedControlStatus;
    value?: TValue | null;
  };
