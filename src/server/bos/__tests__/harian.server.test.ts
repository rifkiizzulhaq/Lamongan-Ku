import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getDailyAnalytics } from "@/src/server/bos/laporan/harian.server";
import { getWibDate } from "@/src/server/bos/laporan/utils";

vi.mock("@/src/server/bos/laporan/auto-close.server", () => ({
  checkAndRunAutoClose: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/auth-guard", () => ({
  requireAuth: vi.fn().mockResolvedValue(undefined),
}));

const createChainableQuery = (data: unknown[]) => {
  const query = Promise.resolve(data) as Promise<unknown[]> & {
    where: () => unknown;
    orderBy: () => unknown;
    groupBy: () => unknown;
    leftJoin: () => unknown;
    limit: () => unknown;
  };
  query.where = vi.fn(() => query);
  query.orderBy = vi.fn(() => query);
  query.groupBy = vi.fn(() => query);
  query.leftJoin = vi.fn(() => query);
  query.limit = vi.fn(() => query);
  return query;
};

vi.mock("@/db", () => {
  return {
    db: {
      query: {
        orders: {
          findFirst: vi.fn(),
          findMany: vi.fn(),
        },
        shop_status: {
          findFirst: vi.fn(),
        },
      },
      select: vi.fn(() => ({
        from: vi.fn(() => createChainableQuery([])),
      })),
    },
  };
});

describe("Daily Analytics Logic", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should compare today's data with the exact same day 7 days ago", async () => {
    const { db } = await import("@/db");

    const currentSystemDate = new Date("2024-05-24T12:00:00.000Z");
    vi.setSystemTime(currentSystemDate);

    const targetDate = new Date(currentSystemDate);
    const prevReportDate = new Date(
      targetDate.getTime() - 7 * 24 * 60 * 60 * 1000,
    );

    const getRange = (d: Date) => {
      const wib = getWibDate(d);
      const y = wib.getFullYear();
      const m = String(wib.getMonth() + 1).padStart(2, "0");
      const dStr = String(wib.getDate()).padStart(2, "0");
      const start = new Date(`${y}-${m}-${dStr}T15:00:00+07:00`);
      const end = new Date(start.getTime() + 11 * 60 * 60 * 1000);
      return { start, end };
    };

    const currentRange = getRange(targetDate);
    const previousRange = getRange(prevReportDate);

    const mockCurrentOrders = [
      {
        id: 1,
        label: "O1",
        totalPrice: 120000,
        status: "selesai",
        orderType: "makan",
        paymentMethod: "cash",
        paymentAmount: 120000,
        changeAmount: 0,
        tableId: 1,
        createdAt: new Date(currentRange.start.getTime() + 3600000),
        updatedAt: new Date(currentRange.start.getTime() + 3600000),
      },
      {
        id: 2,
        label: "O2",
        totalPrice: 50000,
        status: "selesai",
        orderType: "bungkus",
        paymentMethod: "cash",
        paymentAmount: 50000,
        changeAmount: 0,
        tableId: null,
        createdAt: new Date(currentRange.start.getTime() + 7200000),
        updatedAt: new Date(currentRange.start.getTime() + 7200000),
      },
    ];

    const mockPreviousOrders = [
      {
        id: 3,
        label: "O3",
        totalPrice: 80000,
        status: "selesai",
        orderType: "makan",
        paymentMethod: "cash",
        paymentAmount: 80000,
        changeAmount: 0,
        tableId: 1,
        createdAt: new Date(previousRange.start.getTime() + 3600000),
        updatedAt: new Date(previousRange.start.getTime() + 3600000),
      },
    ];

    vi.mocked(db.query.orders.findMany)
      .mockResolvedValueOnce(mockCurrentOrders)
      .mockResolvedValueOnce(mockPreviousOrders);

    vi.mocked(db.query.shop_status.findFirst).mockResolvedValueOnce({
      id: 1,
      isBuka: 1,
      reason: null,
      updatedAt: new Date(),
    });

    const result = await getDailyAnalytics();

    expect(result.totalRevenueCurrent).toBe(170000);
    expect(result.portionCurrent).toBe(2);
    expect(result.dineInCurrent).toBe(1);
    expect(result.takeawayCurrent).toBe(1);

    expect(result.totalRevenuePrevious).toBe(80000);
    expect(result.portionPrevious).toBe(1);
    expect(result.dineInPrevious).toBe(1);
    expect(result.takeawayPrevious).toBe(0);

    expect(result.timeLabel).toContain("Ini");
    expect(result.prevTimeLabel).toContain("Lalu");
  });
});
