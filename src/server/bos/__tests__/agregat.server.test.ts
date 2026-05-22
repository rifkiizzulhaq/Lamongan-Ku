import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getAggregatedAnalytics } from "@/src/server/bos/laporan/agregat.server";

vi.mock("@/src/server/bos/laporan/auto-close.server", () => ({
  checkAndRunAutoClose: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/auth-guard", () => ({
  requireAuth: vi.fn().mockResolvedValue(undefined),
}));

const createChainableQuery = (data: unknown[]) => {
  const query: unknown = Promise.resolve(data);
  (query as any).where = vi.fn(() => query);
  (query as any).orderBy = vi.fn(() => query);
  (query as any).groupBy = vi.fn(() => query);
  (query as any).leftJoin = vi.fn(() => query);
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
      },
      select: vi.fn(() => ({
        from: vi.fn(() => createChainableQuery([])),
      })),
    },
  };
});

describe("Aggregated Analytics Logic", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should calculate correct current and previous trends for Mingguan (Weekly) report", async () => {
    const { db } = await import("@/db");

    vi.setSystemTime(new Date("2024-05-15T12:00:00.000Z"));
    vi.mocked(db.query.orders.findFirst).mockResolvedValueOnce({
      id: 999,
      label: "First Order",
      totalPrice: 10000,
      status: "selesai",
      orderType: "makan",
      paymentMethod: "cash",
      paymentAmount: 10000,
      changeAmount: 0,
      tableId: 1,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    });

    vi.mocked(db.query.orders.findMany).mockResolvedValueOnce([
      {
        id: 1,
        label: "O1",
        totalPrice: 50000,
        status: "selesai",
        orderType: "makan",
        paymentMethod: "cash",
        paymentAmount: 50000,
        changeAmount: 0,
        tableId: 1,
        createdAt: new Date("2024-05-14T08:00:00Z"),
        updatedAt: new Date("2024-05-14T08:00:00Z"),
      },
      {
        id: 2,
        label: "O2",
        totalPrice: 30000,
        status: "selesai",
        orderType: "bungkus",
        paymentMethod: "cash",
        paymentAmount: 30000,
        changeAmount: 0,
        tableId: null,
        createdAt: new Date("2024-05-13T08:00:00Z"),
        updatedAt: new Date("2024-05-13T08:00:00Z"),
      },
    ]);

    vi.mocked(db.query.orders.findMany).mockResolvedValueOnce([
      {
        id: 3,
        label: "O3",
        totalPrice: 100000,
        status: "selesai",
        orderType: "makan",
        paymentMethod: "cash",
        paymentAmount: 100000,
        changeAmount: 0,
        tableId: 2,
        createdAt: new Date("2024-05-07T08:00:00Z"),
        updatedAt: new Date("2024-05-07T08:00:00Z"),
      },
    ]);

    const result = await getAggregatedAnalytics("Mingguan");

    expect(result.totalRevenueCurrent).toBe(80000);
    expect(result.totalRevenuePrevious).toBe(100000);

    expect(result.totalPortionCurrent).toBe(2);
    expect(result.totalPortionPrevious).toBe(1);

    expect(result.dineInCurrent).toBe(1);
    expect(result.takeawayCurrent).toBe(1);
    expect(result.dineInPrevious).toBe(1);

    expect(result.revenueCurrentTrend).toHaveLength(7);
    expect(result.revenuePreviousTrend).toHaveLength(7);
    expect(result.labels).toHaveLength(7);
  });

  it("should calculate correct current and previous trends for Bulanan (Monthly) report", async () => {
    const { db } = await import("@/db");

    vi.setSystemTime(new Date("2024-05-15T12:00:00.000Z"));

    vi.mocked(db.query.orders.findFirst).mockResolvedValueOnce({
      id: 999,
      label: "First Order",
      totalPrice: 10000,
      status: "selesai",
      orderType: "makan",
      paymentMethod: "cash",
      paymentAmount: 10000,
      changeAmount: 0,
      tableId: 1,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    });

    vi.mocked(db.query.orders.findMany).mockResolvedValueOnce([
      {
        id: 1,
        label: "O1",
        totalPrice: 100000,
        status: "selesai",
        orderType: "makan",
        paymentMethod: "cash",
        paymentAmount: 100000,
        changeAmount: 0,
        tableId: 1,
        createdAt: new Date("2024-05-14T08:00:00Z"),
        updatedAt: new Date("2024-05-14T08:00:00Z"),
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
        createdAt: new Date("2024-05-01T08:00:00Z"),
        updatedAt: new Date("2024-05-01T08:00:00Z"),
      },
    ]);

    vi.mocked(db.query.orders.findMany).mockResolvedValueOnce([
      {
        id: 3,
        label: "O3",
        totalPrice: 200000,
        status: "selesai",
        orderType: "makan",
        paymentMethod: "cash",
        paymentAmount: 200000,
        changeAmount: 0,
        tableId: 2,
        createdAt: new Date("2024-04-14T08:00:00Z"),
        updatedAt: new Date("2024-04-14T08:00:00Z"),
      },
    ]);

    const result = await getAggregatedAnalytics("Bulanan");

    expect(result.totalRevenueCurrent).toBe(150000);
    expect(result.totalRevenuePrevious).toBe(200000);
    expect(result.revenueCurrentTrend).toHaveLength(30);
    expect(result.revenuePreviousTrend).toHaveLength(30);
    expect(result.labels).toHaveLength(30);
  });

  it("should calculate correct current and previous trends for Tahunan (Yearly) report", async () => {
    const { db } = await import("@/db");

    vi.setSystemTime(new Date("2024-12-31T12:00:00.000Z"));

    vi.mocked(db.query.orders.findFirst).mockResolvedValueOnce({
      id: 999,
      label: "First Order",
      totalPrice: 10000,
      status: "selesai",
      orderType: "makan",
      paymentMethod: "cash",
      paymentAmount: 10000,
      changeAmount: 0,
      tableId: 1,
      createdAt: new Date("2023-01-01T00:00:00Z"),
      updatedAt: new Date("2023-01-01T00:00:00Z"),
    });

    vi.mocked(db.query.orders.findMany).mockResolvedValueOnce([
      {
        id: 1,
        label: "O1",
        totalPrice: 500000,
        status: "selesai",
        orderType: "makan",
        paymentMethod: "cash",
        paymentAmount: 500000,
        changeAmount: 0,
        tableId: 1,
        createdAt: new Date("2024-06-14T08:00:00Z"),
        updatedAt: new Date("2024-06-14T08:00:00Z"),
      },
    ]);

    vi.mocked(db.query.orders.findMany).mockResolvedValueOnce([
      {
        id: 2,
        label: "O2",
        totalPrice: 800000,
        status: "selesai",
        orderType: "makan",
        paymentMethod: "cash",
        paymentAmount: 800000,
        changeAmount: 0,
        tableId: 2,
        createdAt: new Date("2023-06-14T08:00:00Z"),
        updatedAt: new Date("2023-06-14T08:00:00Z"),
      },
    ]);

    const result = await getAggregatedAnalytics("Tahunan");

    expect(result.totalRevenueCurrent).toBe(500000);
    expect(result.totalRevenuePrevious).toBe(800000);
    expect(result.revenueCurrentTrend).toHaveLength(12);
    expect(result.revenuePreviousTrend).toHaveLength(12);
    expect(result.labels).toHaveLength(12);
  });
});
