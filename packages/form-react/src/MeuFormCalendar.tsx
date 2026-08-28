"use client";

import { Calendar, Field } from "@meu/mobile";
import type {
  CalendarBaseProps,
  CalendarChangeDetails,
  CalendarMultipleProps,
  CalendarRange,
  CalendarRangeProps,
  CalendarRef,
  CalendarSingleProps
} from "@meu/mobile";
import { useRef } from "react";
import type { ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";
import type { FieldPathByValue, FieldValues, UseControllerProps } from "react-hook-form";

export type MeuFormCalendarAdapterProps<TDate> = Omit<
  CalendarBaseProps<TDate>,
  "defaultValue" | "onChange" | "ref" | "selectionMode" | "value"
>;

export type MeuFormCalendarSingleFieldPath<TFieldValues extends FieldValues, TDate> =
  | FieldPathByValue<TFieldValues, NoInfer<TDate> | null>
  | FieldPathByValue<TFieldValues, NoInfer<TDate> | null | undefined>;

export type MeuFormCalendarMultipleFieldPath<TFieldValues extends FieldValues, TDate> =
  | FieldPathByValue<TFieldValues, ReadonlyArray<NoInfer<TDate>>>
  | FieldPathByValue<TFieldValues, ReadonlyArray<NoInfer<TDate>> | undefined>;

export type MeuFormCalendarRangeFieldPath<TFieldValues extends FieldValues, TDate> =
  | FieldPathByValue<TFieldValues, CalendarRange<NoInfer<TDate>> | null>
  | FieldPathByValue<TFieldValues, CalendarRange<NoInfer<TDate>> | null | undefined>;

type CalendarFieldPath<TFieldValues extends FieldValues, TDate> =
  | MeuFormCalendarSingleFieldPath<TFieldValues, TDate>
  | MeuFormCalendarMultipleFieldPath<TFieldValues, TDate>
  | MeuFormCalendarRangeFieldPath<TFieldValues, TDate>;

export type MeuFormCalendarCommonProps<TDate> = MeuFormCalendarAdapterProps<TDate> & {
  description?: ReactNode;
  label?: ReactNode;
  required?: boolean;
};

export type MeuFormCalendarSingleProps<
  TFieldValues extends FieldValues,
  TDate
> = MeuFormCalendarCommonProps<TDate> & {
  name: MeuFormCalendarSingleFieldPath<TFieldValues, TDate>;
  onChange?: CalendarSingleProps<TDate>["onChange"];
  rules?: UseControllerProps<
    TFieldValues,
    MeuFormCalendarSingleFieldPath<TFieldValues, TDate>
  >["rules"];
  selectionMode?: "single";
};

export type MeuFormCalendarMultipleProps<
  TFieldValues extends FieldValues,
  TDate
> = MeuFormCalendarCommonProps<TDate> & {
  name: MeuFormCalendarMultipleFieldPath<TFieldValues, TDate>;
  onChange?: CalendarMultipleProps<TDate>["onChange"];
  rules?: UseControllerProps<
    TFieldValues,
    MeuFormCalendarMultipleFieldPath<TFieldValues, TDate>
  >["rules"];
  selectionMode: "multiple";
};

export type MeuFormCalendarRangeProps<
  TFieldValues extends FieldValues,
  TDate
> = MeuFormCalendarCommonProps<TDate> & {
  name: MeuFormCalendarRangeFieldPath<TFieldValues, TDate>;
  onChange?: CalendarRangeProps<TDate>["onChange"];
  rules?: UseControllerProps<
    TFieldValues,
    MeuFormCalendarRangeFieldPath<TFieldValues, TDate>
  >["rules"];
  selectionMode: "range";
};

export type MeuFormCalendarProps<TFieldValues extends FieldValues, TDate = Date> =
  | MeuFormCalendarSingleProps<TFieldValues, TDate>
  | MeuFormCalendarMultipleProps<TFieldValues, TDate>
  | MeuFormCalendarRangeProps<TFieldValues, TDate>;

export function MeuFormCalendar<TFieldValues extends FieldValues, TDate = Date>(
  props: MeuFormCalendarProps<TFieldValues, TDate>
) {
  const {
    description,
    label,
    name,
    onChange,
    required = false,
    rules,
    selectionMode = "single",
    ...calendarProps
  } = props;
  const { control } = useFormContext<TFieldValues>();
  const calendarRef = useRef<CalendarRef<TDate>>(null);
  const controllerRules = rules as UseControllerProps<
    TFieldValues,
    CalendarFieldPath<TFieldValues, TDate>
  >["rules"];
  const { field, fieldState } = useController<TFieldValues, CalendarFieldPath<TFieldValues, TDate>>(
    {
      control,
      name,
      ...(controllerRules ? { rules: controllerRules } : {})
    }
  );
  const resolvedDisabled = Boolean(field.disabled || calendarProps.disabled);

  function assignRef(instance: CalendarRef<TDate> | null) {
    calendarRef.current = instance;
    field.ref(instance);
  }

  function publish(nextValue: unknown, details: CalendarChangeDetails<TDate>) {
    field.onChange(nextValue);
    if (!onChange) return;
    if (selectionMode === "single" && (!props.selectionMode || props.selectionMode === "single")) {
      const callback = onChange as NonNullable<CalendarSingleProps<TDate>["onChange"]>;
      callback(nextValue as TDate | null, details);
    } else if (selectionMode === "multiple" && props.selectionMode === "multiple") {
      const callback = onChange as NonNullable<CalendarMultipleProps<TDate>["onChange"]>;
      callback(nextValue as ReadonlyArray<TDate>, details);
    } else if (selectionMode === "range" && props.selectionMode === "range") {
      const callback = onChange as NonNullable<CalendarRangeProps<TDate>["onChange"]>;
      callback(nextValue as CalendarRange<TDate> | null, details);
    }
  }

  return (
    <Field
      label={label}
      description={description}
      required={required}
      error={fieldState.error ? fieldState.error.message : undefined}
    >
      {selectionMode === "multiple" ? (
        <Calendar<TDate>
          {...calendarProps}
          ref={assignRef}
          selectionMode="multiple"
          disabled={resolvedDisabled}
          value={Array.isArray(field.value) ? (field.value as ReadonlyArray<TDate>) : []}
          aria-required={required || undefined}
          onChange={(nextValue, details) => publish(nextValue, details)}
        />
      ) : selectionMode === "range" ? (
        <Calendar<TDate>
          {...calendarProps}
          ref={assignRef}
          selectionMode="range"
          disabled={resolvedDisabled}
          value={Array.isArray(field.value) && field.value.length === 2 ? field.value : null}
          aria-required={required || undefined}
          onChange={(nextValue, details) => publish(nextValue, details)}
        />
      ) : (
        <Calendar<TDate>
          {...calendarProps}
          ref={assignRef}
          selectionMode="single"
          disabled={resolvedDisabled}
          value={field.value === null || field.value === undefined ? null : field.value}
          aria-required={required || undefined}
          onChange={(nextValue, details) => publish(nextValue, details)}
        />
      )}
    </Field>
  );
}
