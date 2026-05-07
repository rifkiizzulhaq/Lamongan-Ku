"use client";

import { useState } from "react";
import PageHeader from "@/src/components/ui/PageHeader";
import Button from "@/src/components/ui/Button";
import Link from "next/link";

import { SisaItem } from "@/interfaces/models";

const MENU_AWAL: SisaItem[] = [
  { nama: "Ayam", sisa: 15 },
  { nama: "Lele", sisa: 8 },
  { nama: "Bebek", sisa: 5 },
  { nama: "Nasi Putih" },
  { nama: "Tempe", sisa: 30 },
  { nama: "Tahu", sisa: 25 },
  { nama: "Ati Ampela", sisa: 10 },
  { nama: "Kepalan Ayam", sisa: 12 },
  { nama: "Kepala Bebek", sisa: 4 },
  { nama: "Es Teh Tawar" },
  { nama: "Es Teh Manis" },
  { nama: "Sambal" },
];

export default function SisaBahanPage() {
  const [sisa, setSisa] = useState<SisaItem[]>(
    MENU_AWAL.map((m) => ({ ...m })),
  );

  const setSisaItem = (idx: number, val: number) => {
    setSisa((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, sisa: Math.max(0, val) } : m)),
    );
  };

  return (
    <section className="h-[calc(100dvh-45px)] w-full md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title="Sisa Bahan Baku" />
      <main className="relative max-w-87.5 mx-auto w-full flex-1 flex flex-col overflow-y-auto pt-4 pb-8">
        <div className="flex flex-col p-5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] w-full">
          <p className="text-xs font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-4">
            Sisa Menu Hari Ini
          </p>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {sisa.map((item, idx) => (
              <div
                key={item.nama}
                className="flex items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2"
              >
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 truncate">
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
                  className="w-14 h-8 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-center text-sm font-black rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:border-orange transition-colors placeholder:text-neutral-400 shrink-0"
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex w-full justify-between gap-3">
            <Link
              href="/dashboard"
              className="flex items-center justify-center bg-neutral-200 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white flex-1 py-3.5 rounded-xl font-bold transition-all"
            >
              Batal
            </Link>
            <Button className="bg-orange hover:bg-orange-600 text-white flex-1 py-3.5 rounded-xl font-bold shadow-md shadow-orange/20 transition-all">
              Simpan Data
            </Button>
          </div>
        </div>
      </main>
    </section>
  );
}
