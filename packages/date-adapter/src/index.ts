export type DateUnit = "day" | "week" | "month" | "year";

export const meuDateAdapterContractVersion = "1" as const;

export interface DateAdapter<TDate> {
  add(value: TDate, amount: number, unit: DateUnit): TDate;
  compare(left: TDate, right: TDate): number;
  format(value: TDate, pattern: string, locale?: string): string;
  isValid(value: TDate): boolean;
  parse(value: string, pattern: string, locale?: string): TDate | null;
  startOf(value: TDate, unit: DateUnit): TDate;
}
