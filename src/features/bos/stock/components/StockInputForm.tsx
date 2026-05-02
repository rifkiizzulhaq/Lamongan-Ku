"use client";

import { useState } from "react";
import { useWarungStore } from "@/src/store/warungStore";
import Button from "@/src/components/ui/Button";
import { LuInfo, LuSave } from "react-icons/lu";

interface StockItem {
  id: string;
  nama: string;
  sisaKemarin: number;
}

const STOCK_ITEMS: StockItem[] = [
  { id: "ayam", nama: "Ayam", sisaKemarin: 15 },
  { id: "lele", nama: "Lele", sisaKemarin: 8 },
  { id: "bebek", nama: "Bebek", sisaKemarin: 5 },
  { id: "nasi", nama: "Nasi Putih", sisaKemarin: 0 },
  { id: "tempe", nama: "Tempe", sisaKemarin: 30 },
  { id: "tahu", nama: "Tahu", sisaKemarin: 25 },
  { id: "ati", nama: "Ati Ampela", sisaKemarin: 10 },
  { id: "kepalan", nama: "Kepalan Ayam", sisaKemarin: 12 },
  { id: "kepala_bebek", nama: "Kepala Bebek", sisaKemarin: 4 },
  { id: "esteh_tawar", nama: "Es Teh Tawar", sisaKemarin: 0 },
  { id: "esteh_manis", nama: "Es Teh Manis", sisaKemarin: 0 },
  { id: "sambal", nama: "Sambal", sisaKemarin: 5 },
];

export default function StockInputForm() {
  const { isBuka } = useWarungStore();
  const [useSisaKemarin, setUseSisaKemarin] = useState(false);
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({});

  const handleToggleSisaKemarin = () => {
    if (!isBuka) return;
    
    const newValue = !useSisaKemarin;
    setUseSisaKemarin(newValue);

    if (newValue) {
      const newInputs: Record<string, string> = {};
      STOCK_ITEMS.forEach((item) => {
        if (item.sisaKemarin > 0) {
          newInputs[item.id] = item.sisaKemarin.toString();
        }
      });
      setStockInputs(newInputs);
    } else {
      setStockInputs({});
    }
  };

  const handleInputChange = (id: string, value: string) => {
    setStockInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleSimpan = () => {
    console.log("Menyimpan stock:", stockInputs);
    alert("Data stock berhasil disimpan!");
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {!isBuka && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex gap-3 items-start">
          <LuInfo className="shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-bold text-sm">Warung Sedang Tutup</p>
            <p className="text-xs mt-1">
              Anda tidak dapat mengubah data stock atau menggunakan sisa kemarin. Silakan buka warung terlebih dahulu di halaman Dashboard.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-neutral-800 dark:text-white">Gunakan Sisa Kemarin</h3>
            <p className="text-xs text-neutral-500">Otomatis isi stock berdasarkan sisa bahan hari sebelumnya</p>
          </div>
          <Button
            onClick={handleToggleSisaKemarin}
            disabled={!isBuka}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out focus:outline-none shrink-0 border-2 disabled:opacity-50 ${
              useSisaKemarin
                ? "bg-hijau border-hijau"
                : "bg-neutral-200 dark:bg-neutral-700 border-neutral-200 dark:border-neutral-700"
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out flex items-center justify-center ${
                useSisaKemarin ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-2xl flex flex-col gap-6">
        <div>
          <h3 className="font-extrabold text-lg text-neutral-800 dark:text-white">Input Stock Hari Ini</h3>
          <p className="text-xs text-neutral-500 mt-1">Masukkan jumlah ketersediaan bahan/menu.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STOCK_ITEMS.map((item) => (
            <div key={item.id} className="flex flex-col gap-1.5">
              <label htmlFor={item.id} className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                {item.nama}
                {useSisaKemarin && item.sisaKemarin > 0 && (
                  <span className="ml-2 text-[10px] text-orange bg-orange/10 px-2 py-0.5 rounded-full">
                    Sisa: {item.sisaKemarin}
                  </span>
                )}
              </label>
              <input
                id={item.id}
                type="number"
                disabled={!isBuka}
                value={stockInputs[item.id] || ""}
                onChange={(e) => handleInputChange(item.id, e.target.value)}
                placeholder="0"
                className="w-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange/50 rounded-lg p-3 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          ))}
        </div>

        <Button 
          disabled={!isBuka}
          onClick={handleSimpan}
          className="mt-2 w-full flex items-center justify-center gap-2 bg-hijau hover:bg-emerald-600 disabled:bg-neutral-300 disabled:dark:bg-neutral-700 disabled:text-neutral-500 text-white font-bold py-3 rounded-xl transition-colors duration-300"
        >
          <LuSave size={18} />
          Simpan Stock
        </Button>
      </div>
    </div>
  );
}
