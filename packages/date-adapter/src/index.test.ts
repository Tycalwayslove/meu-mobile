import { describe, expect, it } from "vitest";

import {
  createDateParts,
  meuDateAdapterContractVersion,
  nativeDateAdapter,
  sameDateParts
} from "./index";

describe("nativeDateAdapter", () => {
  it("exposes the v2 platform-neutral contract", () => {
    expect(meuDateAdapterContractVersion).toBe("2");
    expect(createDateParts({ year: 2026 })).toEqual({
      day: 1,
      hour: 0,
      millisecond: 0,
      minute: 0,
      month: 1,
      second: 0,
      year: 2026
    });
  });

  it("round trips valid local civil time parts", () => {
    const parts = {
      day: 28,
      hour: 13,
      millisecond: 456,
      minute: 14,
      month: 8,
      second: 15,
      year: 2026
    };
    const value = nativeDateAdapter.fromParts(parts);

    expect(value).not.toBeNull();
    expect(sameDateParts(nativeDateAdapter.getParts(value!), parts)).toBe(true);
  });

  it("rejects overflow and invalid parts", () => {
    expect(
      nativeDateAdapter.fromParts({
        day: 29,
        hour: 0,
        millisecond: 0,
        minute: 0,
        month: 2,
        second: 0,
        year: 2025
      })
    ).toBeNull();
    expect(
      nativeDateAdapter.fromParts({
        day: 1,
        hour: 24,
        millisecond: 0,
        minute: 0,
        month: 1,
        second: 0,
        year: 2026
      })
    ).toBeNull();
  });

  it("reports leap-year month lengths", () => {
    expect(nativeDateAdapter.getDaysInMonth({ month: 2, year: 2024 })).toBe(29);
    expect(nativeDateAdapter.getDaysInMonth({ month: 2, year: 2025 })).toBe(28);
    expect(nativeDateAdapter.getDaysInMonth({ month: 13, year: 2025 })).toBe(0);
  });

  it("clamps month and year additions to the target month", () => {
    const january31 = nativeDateAdapter.fromParts(
      createDateParts({ day: 31, month: 1, year: 2024 })
    )!;
    const leapDay = nativeDateAdapter.fromParts(
      createDateParts({ day: 29, month: 2, year: 2024 })
    )!;

    expect(nativeDateAdapter.getParts(nativeDateAdapter.add(january31, 1, "month"))).toMatchObject({
      day: 29,
      month: 2,
      year: 2024
    });
    expect(nativeDateAdapter.getParts(nativeDateAdapter.add(leapDay, 1, "year"))).toMatchObject({
      day: 28,
      month: 2,
      year: 2025
    });
  });

  it("adds calendar days while preserving the local clock", () => {
    const source = nativeDateAdapter.fromParts(
      createDateParts({ day: 8, hour: 12, month: 3, year: 2026 })
    )!;
    const next = nativeDateAdapter.add(source, 1, "day");

    expect(nativeDateAdapter.getParts(next)).toMatchObject({
      day: 9,
      hour: 12,
      month: 3,
      year: 2026
    });
  });

  it("formats, parses, and rejects impossible dates", () => {
    const value = nativeDateAdapter.fromParts({
      day: 28,
      hour: 9,
      millisecond: 7,
      minute: 5,
      month: 8,
      second: 4,
      year: 2026
    })!;

    expect(nativeDateAdapter.format(value, "YYYY-MM-DD HH:mm:ss.SSS")).toBe(
      "2026-08-28 09:05:04.007"
    );
    expect(nativeDateAdapter.format(value, "YYYY年M月D日 [at] H:m:s")).toBe(
      "2026年8月28日 at 9:5:4"
    );
    expect(
      nativeDateAdapter.getParts(
        nativeDateAdapter.parse("2026-08-28 09:05:04", "YYYY-MM-DD HH:mm:ss")!
      )
    ).toMatchObject({
      day: 28,
      hour: 9,
      minute: 5,
      month: 8,
      second: 4,
      year: 2026
    });
    expect(nativeDateAdapter.parse("2025-02-29", "YYYY-MM-DD")).toBeNull();
  });

  it("starts values at each supported calendar boundary", () => {
    const value = nativeDateAdapter.fromParts({
      day: 28,
      hour: 13,
      millisecond: 456,
      minute: 14,
      month: 8,
      second: 15,
      year: 2026
    })!;

    expect(nativeDateAdapter.getParts(nativeDateAdapter.startOf(value, "quarter"))).toEqual({
      day: 1,
      hour: 0,
      millisecond: 0,
      minute: 0,
      month: 7,
      second: 0,
      year: 2026
    });
    expect(nativeDateAdapter.getDayOfWeek(nativeDateAdapter.startOf(value, "week"))).toBe(0);
    expect(nativeDateAdapter.getParts(nativeDateAdapter.startOf(value, "minute"))).toMatchObject({
      hour: 13,
      millisecond: 0,
      minute: 14,
      second: 0
    });
  });

  it("compares values without leaking their numeric representation", () => {
    const early = nativeDateAdapter.fromParts(createDateParts({ day: 1, year: 2026 }))!;
    const late = nativeDateAdapter.fromParts(createDateParts({ day: 2, year: 2026 }))!;

    expect(nativeDateAdapter.compare(early, late)).toBe(-1);
    expect(nativeDateAdapter.compare(late, early)).toBe(1);
    expect(nativeDateAdapter.compare(early, new Date(early.getTime()))).toBe(0);
  });
});
