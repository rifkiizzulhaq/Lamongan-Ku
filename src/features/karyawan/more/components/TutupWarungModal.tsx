"use client";

import Button from "@/src/components/ui/Button";
import { useState, ReactNode } from "react";
import {
  LuSun,
  LuCloud,
  LuCloudDrizzle,
  LuCloudLightning,
  LuX,
  LuSend,
  LuLoader,
} from "react-icons/lu";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  saveClosingReport,
  checkIfReportedToday,
  getTodayOrderCount,
} from "@/src/server/karyawan/more/more.server";
import { CuacaSlot } from "@/interfaces/cuaca";
import { useUiStore } from "@/src/store/uiStore";

type CuacaOption = "Cerah" | "Mendung" | "Gerimis" | "Hujan";

const CUACA_OPTIONS: { label: CuacaOption; icon: ReactNode }[] = [
  {
    label: "Cerah",
    icon: <LuSun size={20} strokeWidth={2.5} />,
  },
  {
    label: "Mendung",
    icon: <LuCloud size={20} strokeWidth={2.5} />,
  },
  {
    label: "Gerimis",
    icon: <LuCloudDrizzle size={20} strokeWidth={2.5} />,
  },
  {
    label: "Hujan",
    icon: <LuCloudLightning size={20} strokeWidth={2.5} />,
  },
];

const JAM_SLOTS = [
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
  "17:00-18:00",
  "18:00-19:00",
  "19:00-20:00",
  "20:00-21:00",
  "21:00-22:00",
  "22:00-23:00",
  "23:00-00:00",
  "00:00-01:00",
  "01:00-02:00",
  "02:00-03:00",
  "03:00-04:00",
  "04:00-05:00",
  "05:00-06:00",
];

const OWNER_PHONE = process.env.NEXT_PUBLIC_OWNER_PHONE || "6285156630893";

export default function TutupWarungModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const { addToast } = useUiStore();
  const queryClient = useQueryClient();
  const { data: isAlreadyReported, isLoading: isCheckingReport } = useQuery({
    queryKey: ["check-reported-today"],
    queryFn: () => checkIfReportedToday(),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const { data: orderCount = 0, isLoading: isCheckingOrders } = useQuery({
    queryKey: ["today-order-count"],
    queryFn: () => getTodayOrderCount(),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const hasEnoughOrders = orderCount >= 10;

  const getFilteredSlots = () => {
    const now = new Date();
    const wibStr = now.toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
      hour: "numeric",
      hour12: false,
    });
    let currentHour = parseInt(wibStr);
    if (currentHour === 24) currentHour = 0;

    const mapHour = (h: number) => (h - 6 < 0 ? h - 6 + 24 : h - 6);
    const absCurrent = mapHour(currentHour);

    return JAM_SLOTS.filter((slot) => {
      const [startStr] = slot.split("-");
      const slotHour = parseInt(startStr);
      return mapHour(slotHour) <= absCurrent;
    });
  };

  const [slots, setSlots] = useState<CuacaSlot[]>(() =>
    getFilteredSlots().map((jam) => ({ jam, cuaca: null })),
  );
  const [catatan, setCatatan] = useState("");

  const today = new Date()
    .toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();

  const { mutate: kirim, isPending } = useMutation({
    mutationFn: async () => {
      const missingWeather = slots.find((s) => s.cuaca === null);
      if (missingWeather) {
        throw new Error(`Cuaca pada jam ${missingWeather.jam} wajib diisi!`);
      }

      const res = await saveClosingReport({
        note: catatan,
        weatherSlots: slots,
      });

      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      const waText = `Laporan harian pada\nTanggal: ${today}\n\nCatatan: ${catatan || "-"}`;

      const waUrl = `https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, "_blank");

      queryClient.invalidateQueries({ queryKey: ["stock-list"] });
      queryClient.invalidateQueries({ queryKey: ["check-reported-today"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      addToast("Warung berhasil ditutup!", "success");
      onClose();
    },
    onError: (err: Error) => {
      addToast(err.message || "Gagal mengirim laporan", "error");
    },
  });

  const setCuacaSlot = (idx: number, cuaca: CuacaOption) => {
    setSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, cuaca } : s)));
  };



  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-t-3xl shadow-2xl z-10 flex flex-col max-h-[94dvh]">
        <div className="px-6 pt-6 pb-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-black text-neutral-900 dark:text-white uppercase tracking-wide">
                Laporan Tutup Warung
              </h2>
              <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 mt-0.5 tracking-widest">
                {today}
              </p>
            </div>
            <Button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors mt-0.5"
            >
              <LuX size={22} strokeWidth={2.5} />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-7 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">
              Cuaca Per Jam
            </p>
            <div className="flex gap-3 my-3 flex-wrap">
              {CUACA_OPTIONS.map((o) => (
                <span
                  key={o.label}
                  className="text-[10px] text-neutral-400 dark:text-neutral-600 font-semibold flex items-center gap-1"
                >
                  <span className="scale-[0.8]">{o.icon}</span> {o.label}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {slots.map((slot, idx) => (
                <div key={slot.jam} className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 w-24 shrink-0">
                    {slot.jam}
                  </span>
                  <div className="flex gap-1.5 flex-1">
                    {CUACA_OPTIONS.map((opt) => (
                      <Button
                        key={opt.label}
                        onClick={() => setCuacaSlot(idx, opt.label)}
                        title={opt.label}
                        className={`flex-1 flex justify-center items-center py-1.5 rounded-lg transition-all border-2 text-[0px] ${slot.cuaca === opt.label
                            ? "border-orange bg-orange/10 dark:bg-orange/20 text-orange"
                            : "border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:border-neutral-300 text-neutral-500 dark:text-neutral-400"
                          }`}
                      >
                        {opt.icon}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">
              Catatan Kejadian Hari Ini (Opsional)
            </p>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              placeholder="Cth: Hujan deras.."
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 resize-none focus:outline-none focus:border-orange transition-colors"
            />
          </div>
        </div>

        <Button
          onClick={() => kirim()}
          disabled={
            isPending ||
            isCheckingReport ||
            isCheckingOrders ||
            !!isAlreadyReported ||
            !hasEnoughOrders
          }
          className="w-full bg-orange hover:bg-orange/90 active:scale-[0.99] text-white font-black uppercase tracking-widest py-5 text-sm transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:bg-neutral-400"
        >
          {isPending || isCheckingReport || isCheckingOrders ? (
            <LuLoader className="animate-spin" size={20} />
          ) : isAlreadyReported ? (
            "Laporan Sudah Terkirim"
          ) : !hasEnoughOrders ? (
            `Minimal 10 Pesanan (Saat ini: ${orderCount})`
          ) : (
            <>
              Kirim Laporan
              <LuSend size={16} strokeWidth={2.5} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
