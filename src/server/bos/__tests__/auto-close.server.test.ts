import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkAndRunAutoClose } from "@/src/server/bos/laporan/auto-close.server";

vi.mock("@/db", () => {
  return {
    db: {
      query: {
        stock: {
          findFirst: vi.fn(),
          findMany: vi.fn(),
        },
        orders: {
          findFirst: vi.fn(),
          findMany: vi.fn(),
        },
        daily_reports: {
          findMany: vi.fn(),
        },
        shop_status: {
          findFirst: vi.fn(),
        },
      },
      select: vi.fn(() => ({
        from: vi.fn().mockResolvedValue([]),
      })),
      delete: vi.fn(() => ({
        where: vi.fn(),
      })),
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([{ id: 1 }]),
        })),
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(),
        })),
      })),
    },
  };
});

describe("Auto Close Logic", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should skip if no stock updates exist (launch check)", async () => {
    const { db } = await import("@/db");
    vi.mocked(db.query.stock.findFirst).mockResolvedValueOnce(undefined);

    await checkAndRunAutoClose();

    expect(db.select).not.toHaveBeenCalled();
  });

  it("should process correctly when past 18:30", async () => {
    const { db } = await import("@/db");
    vi.mocked(db.query.stock.findFirst).mockResolvedValueOnce({
      id: 1,
      name: "Mock Stock",
      price: 10000,
      quantity: 50,
      createdAt: new Date("2024-05-01"),
      updatedAt: new Date("2024-05-02"),
    });

    vi.mocked(db.query.orders.findFirst).mockResolvedValueOnce({
      id: 1,
      label: "Mock Order",
      totalPrice: 20000,
      status: "selesai",
      orderType: "makan",
      customerType: "Sendiri",
      diningTableId: 1,
      createdAt: new Date("2024-05-01T08:00:00Z"),
    });

    vi.setSystemTime(new Date("2024-05-20T12:00:00.000Z"));

    vi.mocked(db.query.daily_reports.findMany).mockResolvedValue([]);
    vi.mocked(db.query.orders.findMany).mockResolvedValue([]);
    vi.mocked(db.query.stock.findMany).mockResolvedValue([]);
    vi.mocked(db.query.shop_status.findFirst).mockResolvedValue({
      id: 1,
      isBuka: 1,
      reason: null,
      updatedAt: new Date("2024-05-19"),
    });

    vi.mocked(db.query.stock.findFirst).mockResolvedValue(undefined);

    await checkAndRunAutoClose();
    expect(db.insert).toHaveBeenCalled();
    expect(db.update).toHaveBeenCalled();
  });
});
