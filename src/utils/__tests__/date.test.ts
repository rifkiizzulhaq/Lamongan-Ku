import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getShiftWaktu } from "../date";

describe("getShiftWaktu", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return correct shift for morning time (e.g., 10:00 WIB)", () => {
    const date = new Date("2024-05-20T03:00:00.000Z");
    vi.setSystemTime(date);

    const { startOfDay, endOfDay } = getShiftWaktu();

    expect(startOfDay.toISOString()).toBe("2024-05-19T23:00:00.000Z");
    expect(endOfDay.toISOString()).toBe("2024-05-20T22:59:59.999Z");
  });

  it("should return previous day shift for early morning time (e.g., 01:00 WIB)", () => {
    const date = new Date("2024-05-20T18:00:00.000Z");
    vi.setSystemTime(date);

    const { startOfDay, endOfDay } = getShiftWaktu();

    expect(startOfDay.toISOString()).toBe("2024-05-19T23:00:00.000Z");
    expect(endOfDay.toISOString()).toBe("2024-05-20T22:59:59.999Z");
  });
});
