import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getDashboardStats,
  updateShopStatus,
} from "@/src/server/bos/dashboard/dashboard.server";

vi.mock("@/lib/auth-guard", () => ({
  requireAuth: vi.fn(),
}));
vi.mock("next/cache", () => ({
  unstable_noStore: vi.fn(),
  revalidatePath: vi.fn(),
}));
vi.mock("@/db", () => ({
  db: {
    query: {
      shop_status: { findFirst: vi.fn() },
      daily_reports: { findFirst: vi.fn() },
    },
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(),
        orderBy: vi.fn(),
      })),
    })),
  },
}));

vi.mock("@/src/server/bos/laporan/auto-close.server", () => ({
  checkAndRunAutoClose: vi.fn().mockResolvedValue(undefined),
}));

describe("Security Tests: Server Actions Authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw an error if a Karyawan attempts to access Bos dashboard stats", async () => {
    const { requireAuth } = await import("@/lib/auth-guard");

    vi.mocked(requireAuth).mockRejectedValueOnce(
      new Error("Forbidden: Anda tidak memiliki akses untuk aksi ini."),
    );

    await expect(getDashboardStats()).rejects.toThrow(
      "Forbidden: Anda tidak memiliki akses untuk aksi ini.",
    );
  });

  it("should block Karyawan from updating shop status and return a generic safe error", async () => {
    const { requireAuth } = await import("@/lib/auth-guard");

    vi.mocked(requireAuth).mockRejectedValueOnce(
      new Error("Forbidden: Anda tidak memiliki akses untuk aksi ini."),
    );
    const result = await updateShopStatus(false);

    expect(requireAuth).toHaveBeenCalledWith(["bos"]);
    expect(result).toEqual({
      success: false,
      error: "Gagal memperbarui status warung",
    });
  });
});
