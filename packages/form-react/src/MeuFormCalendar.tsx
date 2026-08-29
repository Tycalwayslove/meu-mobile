"use client";

import { nativeDateAdapter } from "@meu/date-adapter";
import { Calendar, Field } from "@meu/mobile";
import type {
  CalendarBaseProps,
  CalendarChangeDetails,
  CalendarMultipleProps,
  CalendarRange,
  CalendarRangeProps,
  CalendarRef,
  CalendarSingleProps,
  DateAdapter
} from "@meu/mobile";
import { useRef } from "react";
import type { ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";
import type { FieldPathByValue, FieldValues, UseControllerProps } from "react-hook-form";

import type { MeuFormDataSerialization, MeuFormDataValue } from "./adapter-types";
import { HiddenFormValues, serializeHiddenFormValues } from "./HiddenFormValues";

/**
 * Calendar props accepted by the form adapter after removing form-controlled value and ref fields.
 *
 * @public
 */
export type MeuFormCalendarAdapterProps<TDate> = Omit<
  CalendarBaseProps<TDate>,
  "defaultValue" | "onChange" | "ref" | "selectionMode" | "value"
>;

/**
 * React Hook Form paths whose values can hold one selected date or an empty value.
 *
 * @public
 */
export type MeuFormCalendarSingleFieldPath<TFieldValues extends FieldValues, TDate> =
  | FieldPathByValue<TFieldValues, NoInfer<TDate> | null>
  | FieldPathByValue<TFieldValues, NoInfer<TDate> | null | undefined>;

/**
 * React Hook Form paths whose values can hold an array of selected dates.
 *
 * @public
 */
export type MeuFormCalendarMultipleFieldPath<TFieldValues extends FieldValues, TDate> =
  | FieldPathByValue<TFieldValues, ReadonlyArray<NoInfer<TDate>>>
  | FieldPathByValue<TFieldValues, ReadonlyArray<NoInfer<TDate>> | undefined>;

/**
 * React Hook Form paths whose values can hold a selected date range or an empty value.
 *
 * @public
 */
export type MeuFormCalendarRangeFieldPath<TFieldValues extends FieldValues, TDate> =
  | FieldPathByValue<TFieldValues, CalendarRange<NoInfer<TDate>> | null>
  | FieldPathByValue<TFieldValues, CalendarRange<NoInfer<TDate>> | null | undefined>;

type CalendarFieldPath<TFieldValues extends FieldValues, TDate> =
  | MeuFormCalendarSingleFieldPath<TFieldValues, TDate>
  | MeuFormCalendarMultipleFieldPath<TFieldValues, TDate>
  | MeuFormCalendarRangeFieldPath<TFieldValues, TDate>;

/**
 * Field presentation and calendar behavior shared by every selection mode.
 *
 * @public
 */
export type MeuFormCalendarCommonProps<
  TDate,
  TValue = TDate | ReadonlyArray<TDate>
> = MeuFormCalendarAdapterProps<TDate> & {
  /** Supporting content rendered with the field and associated with the calendar. */
  description?: ReactNode;
  /** Visible field label rendered by the surrounding `Field`. */
  label?: ReactNode;
  /** Shows the required affordance; enforce required validation through mode-specific `rules`. */
  required?: boolean;
  /**
   * Converts a non-empty valid selection into native `FormData` values. The default emits each
   * selected date as a repeated `YYYY-MM-DD` entry in selection order. Return a scalar for a
   * single-entry backend contract. This callback must be synchronous; thrown errors or accidental
   * promise results safely omit the field.
   */
  serializeValue?: (
    value: TValue,
    details: { adapter: DateAdapter<TDate> }
  ) => MeuFormDataSerialization;
};

/**
 * Props for a calendar bound to a single-date React Hook Form field.
 *
 * @public
 */
export type MeuFormCalendarSingleProps<
  TFieldValues extends FieldValues,
  TDate
> = MeuFormCalendarCommonProps<TDate, TDate> & {
  /** Path of a form field that stores one date or `null`. */
  name: MeuFormCalendarSingleFieldPath<TFieldValues, TDate>;
  /** Called after the form receives the next date, with the calendar change details. */
  onChange?: CalendarSingleProps<TDate>["onChange"];
  /** React Hook Form validation and value-processing rules for the single-date field. */
  rules?: UseControllerProps<
    TFieldValues,
    MeuFormCalendarSingleFieldPath<TFieldValues, TDate>
  >["rules"];
  /** Selects single-date behavior; omitted values also use this default mode. */
  selectionMode?: "single";
};

/**
 * Props for a calendar bound to a multiple-date React Hook Form field.
 *
 * @public
 */
export type MeuFormCalendarMultipleProps<
  TFieldValues extends FieldValues,
  TDate
> = MeuFormCalendarCommonProps<TDate, ReadonlyArray<TDate>> & {
  /** Path of a form field that stores the selected date array. */
  name: MeuFormCalendarMultipleFieldPath<TFieldValues, TDate>;
  /** Called after the form receives the next date array, with the calendar change details. */
  onChange?: CalendarMultipleProps<TDate>["onChange"];
  /** React Hook Form validation and value-processing rules for the multiple-date field. */
  rules?: UseControllerProps<
    TFieldValues,
    MeuFormCalendarMultipleFieldPath<TFieldValues, TDate>
  >["rules"];
  /** Selects multiple-date behavior and the corresponding form value shape. */
  selectionMode: "multiple";
};

/**
 * Props for a calendar bound to a date-range React Hook Form field.
 *
 * @public
 */
export type MeuFormCalendarRangeProps<
  TFieldValues extends FieldValues,
  TDate
> = MeuFormCalendarCommonProps<TDate, CalendarRange<TDate>> & {
  /** Path of a form field that stores a two-date range or `null`. */
  name: MeuFormCalendarRangeFieldPath<TFieldValues, TDate>;
  /** Called after the form receives the next range, with the calendar change details. */
  onChange?: CalendarRangeProps<TDate>["onChange"];
  /** React Hook Form validation and value-processing rules for the date-range field. */
  rules?: UseControllerProps<
    TFieldValues,
    MeuFormCalendarRangeFieldPath<TFieldValues, TDate>
  >["rules"];
  /** Selects date-range behavior and the corresponding form value shape. */
  selectionMode: "range";
};

/**
 * Mode-discriminated props for a calendar controlled by React Hook Form.
 *
 * @public
 */
export type MeuFormCalendarProps<TFieldValues extends FieldValues, TDate = Date> =
  | MeuFormCalendarSingleProps<TFieldValues, TDate>
  | MeuFormCalendarMultipleProps<TFieldValues, TDate>
  | MeuFormCalendarRangeProps<TFieldValues, TDate>;

/**
 * Binds a calendar's value, validation state, and focus target to React Hook Form.
 *
 * @public
 */
export function MeuFormCalendar<TFieldValues extends FieldValues, TDate = Date>(
  props: MeuFormCalendarProps<TFieldValues, TDate>
) {
  const {
    adapter,
    description,
    label,
    name,
    onChange,
    required = false,
    rules,
    serializeValue,
    selectionMode = "single",
    ...calendarProps
  } = props;
  const { control } = useFormContext<TFieldValues>();
  const calendarRef = useRef<CalendarRef<TDate>>(null);
  const resolvedAdapter = (adapter || nativeDateAdapter) as DateAdapter<TDate>;
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
  let serializedValues: ReadonlyArray<MeuFormDataValue> = [];

  if (selectionMode === "multiple") {
    const value = Array.isArray(field.value) ? (field.value as ReadonlyArray<TDate>) : [];
    if (value.length > 0 && value.every((item) => resolvedAdapter.isValid(item))) {
      const serializer = serializeValue as
        MeuFormCalendarMultipleProps<TFieldValues, TDate>["serializeValue"] | undefined;
      serializedValues = serializeHiddenFormValues(() =>
        serializer
          ? serializer(value, { adapter: resolvedAdapter })
          : value.map((item) => resolvedAdapter.format(item, "YYYY-MM-DD"))
      ).values;
    }
  } else if (selectionMode === "range") {
    const value = (
      Array.isArray(field.value) && field.value.length === 2 ? field.value : null
    ) as CalendarRange<TDate> | null;
    if (value !== null && resolvedAdapter.isValid(value[0]) && resolvedAdapter.isValid(value[1])) {
      const serializer = serializeValue as
        MeuFormCalendarRangeProps<TFieldValues, TDate>["serializeValue"] | undefined;
      serializedValues = serializeHiddenFormValues(() =>
        serializer
          ? serializer(value, { adapter: resolvedAdapter })
          : value.map((item) => resolvedAdapter.format(item, "YYYY-MM-DD"))
      ).values;
    }
  } else {
    const value = (field.value === undefined ? null : field.value) as TDate | null;
    if (value !== null && resolvedAdapter.isValid(value)) {
      const serializer = serializeValue as
        MeuFormCalendarSingleProps<TFieldValues, TDate>["serializeValue"] | undefined;
      serializedValues = serializeHiddenFormValues(() =>
        serializer
          ? serializer(value, { adapter: resolvedAdapter })
          : resolvedAdapter.format(value, "YYYY-MM-DD")
      ).values;
    }
  }

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
      <HiddenFormValues disabled={resolvedDisabled} name={field.name} values={serializedValues} />
      {selectionMode === "multiple" ? (
        <Calendar<TDate>
          {...calendarProps}
          ref={assignRef}
          adapter={resolvedAdapter}
          selectionMode="multiple"
          disabled={resolvedDisabled}
          value={Array.isArray(field.value) ? (field.value as ReadonlyArray<TDate>) : []}
          onChange={(nextValue, details) => publish(nextValue, details)}
        />
      ) : selectionMode === "range" ? (
        <Calendar<TDate>
          {...calendarProps}
          ref={assignRef}
          adapter={resolvedAdapter}
          selectionMode="range"
          disabled={resolvedDisabled}
          value={Array.isArray(field.value) && field.value.length === 2 ? field.value : null}
          onChange={(nextValue, details) => publish(nextValue, details)}
        />
      ) : (
        <Calendar<TDate>
          {...calendarProps}
          ref={assignRef}
          adapter={resolvedAdapter}
          selectionMode="single"
          disabled={resolvedDisabled}
          value={field.value === null || field.value === undefined ? null : field.value}
          onChange={(nextValue, details) => publish(nextValue, details)}
        />
      )}
    </Field>
  );
}
