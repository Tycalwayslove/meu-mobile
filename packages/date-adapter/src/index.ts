/** Calendar or clock unit accepted by adapter arithmetic. @public */
export type DateUnit = "second" | "minute" | "hour" | "day" | "week" | "month" | "quarter" | "year";

/** Finest editable unit used by date and time picker columns. @public */
export type DatePrecision = "year" | "month" | "day" | "hour" | "minute" | "second";

/**
 * Platform-neutral civil date and time fields. Months are one-based.
 *
 * @public
 */
export type DateParts = {
  /** Day of month in the inclusive range supported by the selected month. */
  day: number;
  /** Hour of day using the 24-hour range 0–23. */
  hour: number;
  /** Millisecond within the current second, from 0 to 999. */
  millisecond: number;
  /** Minute within the current hour, from 0 to 59. */
  minute: number;
  /** One-based calendar month, where January is 1 and December is 12. */
  month: number;
  /** Second within the current minute, from 0 to 59. */
  second: number;
  /** Full signed calendar year rather than a two-digit year. */
  year: number;
};

/** Calendar fields required to determine the length of a month. @public */
export type DateCalendarParts = Pick<DateParts, "month" | "year">;

/** Contract revision implemented by this adapter package. @public */
export const meuDateAdapterContractVersion = "2" as const;

/**
 * Platform-neutral date operations used by Meu date components.
 *
 * Month values are one-based (January is 1). Weekdays use the JavaScript convention where
 * Sunday is 0 and Saturday is 6. Implementations own their timezone semantics; Meu's native
 * adapter uses the host's local civil time.
 *
 * @public
 */
export interface DateAdapter<TDate> {
  /** Returns a new value moved by a signed amount without mutating the input. */
  add(value: TDate, amount: number, unit: DateUnit): TDate;
  /** Orders two values chronologically using a negative, zero, or positive result. */
  compare(left: TDate, right: TDate): number;
  /** Formats a valid value with the adapter's documented token pattern and optional locale. */
  format(value: TDate, pattern: string, locale?: string): string;
  /** Creates a value from validated civil fields, or `null` when the fields cannot form a date. */
  fromParts(parts: DateParts): TDate | null;
  /** Returns the JavaScript weekday index, where Sunday is 0 and Saturday is 6. */
  getDayOfWeek(value: TDate): number;
  /** Returns the number of days in the supplied one-based month and full year. */
  getDaysInMonth(parts: DateCalendarParts): number;
  /** Decomposes a value into platform-neutral local civil fields. */
  getParts(value: TDate): DateParts;
  /** Reports whether the value can safely participate in adapter operations. */
  isValid(value: TDate): boolean;
  /** Returns the adapter's current instant using its configured timezone semantics. */
  now(): TDate;
  /** Parses a string with the documented token pattern, returning `null` for invalid input. */
  parse(value: string, pattern: string, locale?: string): TDate | null;
  /** Returns a new value truncated to the beginning of the requested unit. */
  startOf(value: TDate, unit: DateUnit): TDate;
}

const datePartKeys: ReadonlyArray<keyof DateParts> = [
  "year",
  "month",
  "day",
  "hour",
  "minute",
  "second",
  "millisecond"
];

/** Compares every civil field without converting through a platform date object. @public */
export function sameDateParts(left: DateParts, right: DateParts) {
  return datePartKeys.every((key) => left[key] === right[key]);
}

/** Builds complete civil fields with January 1 at midnight as the omitted-field defaults. @public */
export function createDateParts(parts: Partial<DateParts> & Pick<DateParts, "year">): DateParts {
  return {
    day: parts.day === undefined ? 1 : parts.day,
    hour: parts.hour === undefined ? 0 : parts.hour,
    millisecond: parts.millisecond === undefined ? 0 : parts.millisecond,
    minute: parts.minute === undefined ? 0 : parts.minute,
    month: parts.month === undefined ? 1 : parts.month,
    second: parts.second === undefined ? 0 : parts.second,
    year: parts.year
  };
}

function pad(value: number, length: number) {
  return String(Math.abs(value)).padStart(length, "0");
}

const formatTokens = [
  "YYYY",
  "SSS",
  "YY",
  "MM",
  "DD",
  "HH",
  "mm",
  "ss",
  "M",
  "D",
  "H",
  "m",
  "s"
] as const;
type FormatToken = (typeof formatTokens)[number];

const tokenPatterns: Record<FormatToken, string> = {
  D: "(\\d{1,2})",
  DD: "(\\d{2})",
  H: "(\\d{1,2})",
  HH: "(\\d{2})",
  M: "(\\d{1,2})",
  MM: "(\\d{2})",
  SSS: "(\\d{1,3})",
  YY: "(\\d{2})",
  YYYY: "(-?\\d{4,})",
  m: "(\\d{1,2})",
  mm: "(\\d{2})",
  s: "(\\d{1,2})",
  ss: "(\\d{2})"
};

function tokenValue(token: FormatToken, parts: DateParts) {
  switch (token) {
    case "YYYY":
      return parts.year < 0 ? `-${pad(parts.year, 4)}` : pad(parts.year, 4);
    case "YY":
      return pad(parts.year % 100, 2);
    case "MM":
      return pad(parts.month, 2);
    case "M":
      return String(parts.month);
    case "DD":
      return pad(parts.day, 2);
    case "D":
      return String(parts.day);
    case "HH":
      return pad(parts.hour, 2);
    case "H":
      return String(parts.hour);
    case "mm":
      return pad(parts.minute, 2);
    case "m":
      return String(parts.minute);
    case "ss":
      return pad(parts.second, 2);
    case "s":
      return String(parts.second);
    case "SSS":
      return pad(parts.millisecond, 3);
  }
}

function tokenizePattern(pattern: string) {
  const segments: Array<{ literal?: string; token?: FormatToken }> = [];
  let index = 0;

  while (index < pattern.length) {
    if (pattern[index] === "[") {
      const end = pattern.indexOf("]", index + 1);
      if (end === -1) {
        segments.push({ literal: pattern.slice(index) });
        break;
      }
      segments.push({ literal: pattern.slice(index + 1, end) });
      index = end + 1;
      continue;
    }

    const token = formatTokens.find((candidate) => pattern.startsWith(candidate, index));
    if (token) {
      segments.push({ token });
      index += token.length;
      continue;
    }

    const previous = segments[segments.length - 1];
    const character = pattern[index]!;
    if (previous && previous.literal !== undefined) previous.literal += character;
    else segments.push({ literal: character });
    index += 1;
  }

  return segments;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function daysInMonth(year: number, month: number) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return 0;
  const date = new Date(0);
  date.setHours(0, 0, 0, 0);
  date.setFullYear(year, month, 0);
  return date.getDate();
}

function isFiniteInteger(value: number) {
  return Number.isFinite(value) && Number.isInteger(value);
}

function validParts(parts: DateParts) {
  return (
    datePartKeys.every((key) => isFiniteInteger(parts[key])) &&
    parts.month >= 1 &&
    parts.month <= 12 &&
    parts.day >= 1 &&
    parts.day <= daysInMonth(parts.year, parts.month) &&
    parts.hour >= 0 &&
    parts.hour <= 23 &&
    parts.minute >= 0 &&
    parts.minute <= 59 &&
    parts.second >= 0 &&
    parts.second <= 59 &&
    parts.millisecond >= 0 &&
    parts.millisecond <= 999
  );
}

function nativeParts(value: Date): DateParts {
  return {
    day: value.getDate(),
    hour: value.getHours(),
    millisecond: value.getMilliseconds(),
    minute: value.getMinutes(),
    month: value.getMonth() + 1,
    second: value.getSeconds(),
    year: value.getFullYear()
  };
}

function nativeFromParts(parts: DateParts) {
  if (!validParts(parts)) return null;
  const value = new Date(0);
  value.setHours(0, 0, 0, 0);
  value.setFullYear(parts.year, parts.month - 1, parts.day);
  value.setHours(parts.hour, parts.minute, parts.second, parts.millisecond);
  return sameDateParts(nativeParts(value), parts) ? value : null;
}

function moveMonth(value: Date, amount: number) {
  const parts = nativeParts(value);
  const monthIndex = parts.year * 12 + (parts.month - 1) + amount;
  const year = Math.floor(monthIndex / 12);
  const month = monthIndex - year * 12 + 1;
  const next = nativeFromParts({
    ...parts,
    day: Math.min(parts.day, daysInMonth(year, month)),
    month,
    year
  });
  return next || new Date(value.getTime());
}

function parseToken(token: FormatToken, value: number, parts: DateParts) {
  switch (token) {
    case "YYYY":
      parts.year = value;
      break;
    case "YY":
      parts.year = value + (value >= 70 ? 1900 : 2000);
      break;
    case "MM":
    case "M":
      parts.month = value;
      break;
    case "DD":
    case "D":
      parts.day = value;
      break;
    case "HH":
    case "H":
      parts.hour = value;
      break;
    case "mm":
    case "m":
      parts.minute = value;
      break;
    case "ss":
    case "s":
      parts.second = value;
      break;
    case "SSS":
      parts.millisecond = value;
      break;
  }
}

/**
 * Date adapter backed by JavaScript `Date` and the host's local civil timezone.
 *
 * @public
 */
export const nativeDateAdapter: DateAdapter<Date> = {
  add(value, amount, unit) {
    const next = new Date(value.getTime());
    if (!this.isValid(next) || !Number.isFinite(amount)) return next;

    switch (unit) {
      case "second":
        next.setSeconds(next.getSeconds() + amount);
        return next;
      case "minute":
        next.setMinutes(next.getMinutes() + amount);
        return next;
      case "hour":
        next.setHours(next.getHours() + amount);
        return next;
      case "day":
        next.setDate(next.getDate() + amount);
        return next;
      case "week":
        next.setDate(next.getDate() + amount * 7);
        return next;
      case "month":
        return moveMonth(next, amount);
      case "quarter":
        return moveMonth(next, amount * 3);
      case "year":
        return moveMonth(next, amount * 12);
    }
  },

  compare(left, right) {
    const difference = left.getTime() - right.getTime();
    return difference === 0 ? 0 : difference < 0 ? -1 : 1;
  },

  format(value, pattern) {
    if (!this.isValid(value)) return "";
    const parts = nativeParts(value);
    return tokenizePattern(pattern)
      .map((segment) => (segment.token ? tokenValue(segment.token, parts) : segment.literal || ""))
      .join("");
  },

  fromParts(parts) {
    return nativeFromParts(parts);
  },

  getDayOfWeek(value) {
    return value.getDay();
  },

  getDaysInMonth(parts) {
    return daysInMonth(parts.year, parts.month);
  },

  getParts(value) {
    return nativeParts(value);
  },

  isValid(value) {
    return value instanceof Date && Number.isFinite(value.getTime());
  },

  now() {
    return new Date();
  },

  parse(value, pattern) {
    const segments = tokenizePattern(pattern);
    const tokens: FormatToken[] = [];
    const source = segments
      .map((segment) => {
        if (segment.token) {
          tokens.push(segment.token);
          return tokenPatterns[segment.token];
        }
        return escapeRegExp(segment.literal || "");
      })
      .join("");
    const match = new RegExp(`^${source}$`).exec(value);
    if (!match) return null;
    const parts = createDateParts({ year: 1970 });
    tokens.forEach((token, index) => {
      parseToken(token, Number(match[index + 1]), parts);
    });
    return nativeFromParts(parts);
  },

  startOf(value, unit) {
    if (!this.isValid(value)) return new Date(value.getTime());
    const parts = nativeParts(value);
    if (unit === "year") {
      parts.month = 1;
      parts.day = 1;
    } else if (unit === "quarter") {
      parts.month = Math.floor((parts.month - 1) / 3) * 3 + 1;
      parts.day = 1;
    } else if (unit === "month") {
      parts.day = 1;
    } else if (unit === "week") {
      const start = new Date(value.getTime());
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      return start;
    }

    if (unit !== "second") parts.second = 0;
    if (unit !== "second" && unit !== "minute") parts.minute = 0;
    if (unit !== "second" && unit !== "minute" && unit !== "hour") parts.hour = 0;
    parts.millisecond = 0;
    return nativeFromParts(parts) || new Date(value.getTime());
  }
};
