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
} from "@/src/server/karyawan/more/more.server";
import { CuacaSlot, SisaItem } from "@/interfaces/models";
import type { Stock } from "@/db/schema";

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
];

const EXCLUDED_ITEMS = ["sambal", "teh manis", "nasi"];

const OWNER_PHONE = "6285156630893";

export default function TutupWarungModal({
  onClose,
  stockList,
}: {
  onClose: () => void;
  stockList: Stock[];
}) {
  const queryClient = useQueryClient();
  const { data: isAlreadyReported, isLoading: isCheckingReport } = useQuery({
    queryKey: ["check-reported-today"],
    queryFn: () => checkIfReportedToday(),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const getFilteredSlots = () => {
    const now = new Date();
    const wibStr = now.toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
      hour: "numeric",
      hour12: false,
    });
    const currentHour = parseInt(wibStr);

    let absCurrent = currentHour;
    if (currentHour >= 0 && currentHour <= 16) {
      absCurrent = currentHour + 24;
    }

    return JAM_SLOTS.filter((jam) => {
      const startHourStr = jam.split(":")[0];
      const startHour = parseInt(startHourStr);
      let absStart = startHour;
      if (startHour >= 0 && startHour <= 16) {
        absStart = startHour + 24;
      }
      return absStart <= absCurrent;
    });
  };

  const [slots, setSlots] = useState<CuacaSlot[]>(() =>
    getFilteredSlots().map((jam) => ({ jam, cuaca: null })),
  );
  const [sisa, setSisa] = useState<SisaItem[]>(() =>
    stockList
      .filter(
        (s) => !EXCLUDED_ITEMS.some((ex) => s.name.toLowerCase().includes(ex)),
      )
      .map((s) => ({
        nama: s.name,
        sisa: s.quantity ?? 0,
        stockId: s.id,
      })),
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
        stockSnapshots: sisa.map((s) => ({
          stockId: s.stockId!,
          sisa: s.sisa ?? 0,
        })),
      });

      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      const waText = `*LAPORAN STOK HARIAN*\nTanggal: ${today}\n\n${sisa
        .map((s) => `- ${s.nama}: ${s.sisa ?? 0}`)
        .join("\n")}\n\nCatatan: ${catatan || "-"}`;

      const waUrl = `https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, "_blank");

      queryClient.invalidateQueries({ queryKey: ["stock-list"] });
      queryClient.invalidateQueries({ queryKey: ["check-reported-today"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      onClose();
    },
    onError: (err: Error) => {
      alert(err.message || "Gagal mengirim laporan");
    },
  });

  const setCuacaSlot = (idx: number, cuaca: CuacaOption) => {
    setSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, cuaca } : s)));
  };

  const setSisaItem = (idx: number, val: number) => {
    setSisa((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, sisa: Math.max(0, val) } : m)),
    );
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
              Cuaca Per Jam (15:00 - 02:00)
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
                        className={`flex-1 flex justify-center items-center py-1.5 rounded-lg transition-all border-2 text-[0px] ${
                          slot.cuaca === opt.label
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
            <p className="text-[11px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">
              Sisa Menu Hari Ini (Fisik)
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {sisa.map((item, idx) => (
                <div
                  key={item.nama}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 truncate">
                    {item.nama}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={item.sisa === 0 ? "" : item.sisa}
                    onChange={(e) =>
                      setSisaItem(idx, parseInt(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="w-12 h-7 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-center text-xs font-black rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:border-orange transition-colors placeholder:text-neutral-400 shrink-0"
                  />
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
          disabled={isPending || isCheckingReport || !!isAlreadyReported}
          className="w-full bg-orange hover:bg-orange/90 active:scale-[0.99] text-white font-black uppercase tracking-widest py-5 text-sm transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:bg-neutral-400"
        >
          {isPending || isCheckingReport ? (
            <LuLoader className="animate-spin" size={20} />
          ) : isAlreadyReported ? (
            "Laporan Sudah Terkirim"
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
