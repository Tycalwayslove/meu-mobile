type HiddenFormValuesProps = {
  disabled?: boolean;
  name: string;
  values: ReadonlyArray<number | string | null | undefined>;
};

/**
 * Mirrors non-native adapter values into successful form controls without exposing layout or
 * accessibility nodes. Repeated values intentionally use the same name so FormData preserves
 * collection order through `getAll(name)`.
 */
export function HiddenFormValues({ disabled = false, name, values }: HiddenFormValuesProps) {
  return values.flatMap((value, index) =>
    value === null || value === undefined
      ? []
      : [
          <input
            key={`${index}-${String(value)}`}
            type="hidden"
            name={name}
            value={String(value)}
            disabled={disabled}
            data-meu-form-value="hidden"
          />
        ]
  );
}
