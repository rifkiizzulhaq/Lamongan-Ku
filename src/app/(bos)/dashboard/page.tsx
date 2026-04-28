"use client";

import { useState } from "react";
import { LuDollarSign, LuShoppingBag, LuPen, LuCloud } from "react-icons/lu";
import PageHeader from "@/src/components/ui/PageHeader";
import Button from "@/src/components/ui/Button";
import StatCard from "@/src/features/bos/dashboard/components/StatCard";
import RevenueChart from "@/src/features/bos/dashboard/components/RevenueChart";

interface SisaItem {
  nama: string;
  sisa?: number;
}

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

export default function Page() {
  const [isBuka, setIsBuka] = useState(true);

  return (
    <section className="h-[calc(100dvh-45px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title="Dashboard" />
      <main className="relative max-w-87.5 mx-auto w-full flex flex-col h-full pt-2 overflow-y-auto pb-8">
        <div className="w-full flex justify-between items-center px-4 py-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-sm">
          <div className="flex flex-col">
            <p className="text-sm font-extrabold text-neutral-800 dark:text-white">
              Status Warung
            </p>
            <p
              className={`text-[11px] font-bold uppercase tracking-widest mt-0.5 ${isBuka ? "text-hijau" : "text-red-500"}`}
            >
              {isBuka ? "Sedang Buka" : "Sedang Libur"}
            </p>
          </div>

          <Button
            onClick={() => setIsBuka(!isBuka)}
            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ease-in-out focus:outline-none shrink-0 border-2 ${
              isBuka
                ? "bg-hijau border-hijau"
                : "bg-neutral-200 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-900"
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out flex items-center justify-center ${
                isBuka ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </Button>
        </div>
        {!isBuka && (
          <div className="w-full mt-4 px-4 py-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-sm flex flex-col gap-4">
            <h2>Alasan Libur *</h2>
            <textarea
              name="catatan"
              id="catatan"
              className="border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange/50 rounded-md p-3 resize-none h-24 transition-colors duration-300"
              placeholder="Cth sakit, capek..."
            ></textarea>
            <Button className="self-end bg-orange hover:bg-orange-600 text-white py-2 px-4 rounded-md transition-colors duration-300">
              Simpan
            </Button>
          </div>
        )}
        <div className="w-full mt-4 flex flex-col gap-4">
          <StatCard
            title="Total Pendapatan"
            value="Rp 12.500.000"
            icon={<LuDollarSign size={20} strokeWidth={2.5} />}
            edit={<LuPen size={20} strokeWidth={2.5} />}
            editHref="/dashboard/edit-pendapatan"
          />

          <StatCard
            title="Total Pesanan"
            value="432 Porsi"
            icon={<LuShoppingBag size={20} strokeWidth={2.5} />}
          />

          <StatCard
            title="Sisa Bahan Baku Hari Ini"
            icon={<LuShoppingBag size={20} strokeWidth={2.5} />}
            edit={<LuPen size={20} strokeWidth={2.5} />}
            editHref="/dashboard/sisa-bahan"
          >
            <div className="grid grid-cols-2 gap-2 mt-1">
              {MENU_AWAL.slice(0, 6).map((item) => (
                <div
                  key={item.nama}
                  className="flex items-center justify-between p-2.5 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-100 dark:border-neutral-700/80"
                >
                  <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 truncate">
                    {item.nama}
                  </span>
                  <span className="text-xs font-black text-neutral-800 dark:text-white">
                    {item.sisa !== undefined ? item.sisa : "N/A"}
                  </span>
                </div>
              ))}
            </div>
          </StatCard>

          <StatCard
            title="Cuaca pada saat penjualan hari Ini"
            value="Cerah, mendung, hujan"
            icon={<LuCloud size={20} strokeWidth={2.5} />}
          />
        </div>
        <div className="w-full mt-4">
          <RevenueChart />
        </div>
      </main>
    </section>
  );
}
