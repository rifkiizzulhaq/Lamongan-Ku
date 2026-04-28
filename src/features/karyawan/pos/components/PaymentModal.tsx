"use client";

import Button from "@/src/components/ui/Button";
import { useState } from "react";
import { LuX, LuCheck } from "react-icons/lu";

export interface PaymentModalProps {
  id: string;
  totalPrice: number;
  onClose: () => void;
}

export default function PaymentModal({
  id,
  totalPrice,
  onClose,
}: PaymentModalProps) {
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const presets = [
    { label: "UANG PAS", value: totalPrice },
    { label: "50.000", value: 50000 },
    { label: "100.000", value: 100000 },
  ];

  const received =
    selected === "UANG PAS"
      ? totalPrice
      : selected
        ? parseInt(selected.replace(".", ""))
        : input
          ? parseInt(input)
          : 0;

  const kembalian = received - totalPrice;

  const handleDigit = (d: string) => {
    if (selected) {
      setSelected(null);
      setInput(d);
      return;
    }
    setInput((prev) => prev + d);
  };

  const handleDel = () => {
    if (selected) {
      setSelected(null);
      return;
    }
    setInput((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-neutral-900 rounded-t-3xl overflow-hidden shadow-2xl z-10">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-800">
          <div>
            <h2 className="text-white font-black uppercase tracking-widest text-base">
              Pembayaran
            </h2>
            <p className="text-[11px] text-neutral-500 font-semibold uppercase tracking-widest mt-0.5">
              {id}
            </p>
          </div>
          <Button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <LuX size={22} strokeWidth={2.5} />
          </Button>
        </div>

        <div className="px-6 pt-4 pb-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
            Total Tagihan
          </p>
          <p className="text-3xl font-black text-orange">
            Rp {totalPrice.toLocaleString("id-ID")}
          </p>

          <div className="flex gap-2 mt-4">
            {presets.map((p) => (
              <Button
                key={p.label}
                onClick={() => setSelected(p.label)}
                className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-lg border transition-colors ${
                  selected === p.label
                    ? "border-orange text-orange bg-orange/10"
                    : "border-neutral-700 text-neutral-300 bg-neutral-800 hover:border-neutral-500"
                }`}
              >
                {p.label}
              </Button>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <div className="flex justify-between items-center py-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                Uang Diterima
              </p>
              <p className="text-sm font-bold text-white">
                {received > 0 ? `Rp ${received.toLocaleString("id-ID")}` : "—"}
              </p>
            </div>
            <div className="flex justify-between items-center bg-neutral-800 rounded-lg px-3 py-2.5 border-l-4 border-green-500">
              <p className="text-[11px] font-black uppercase tracking-widest text-green-400">
                Kembalian
              </p>
              <p
                className={`text-sm font-black ${kembalian < 0 ? "text-red-400" : "text-green-400"}`}
              >
                {received > 0 ? `Rp ${kembalian.toLocaleString("id-ID")}` : "—"}
              </p>
            </div>
          </div>

          {!selected && (
            <div className="mt-3 text-right min-h-9">
              <p className="text-2xl font-black text-white tracking-wider">
                {input ? `Rp ${parseInt(input).toLocaleString("id-ID")}` : ""}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-px bg-neutral-800 border-t border-neutral-800 mt-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "⌫"].map(
            (d) => (
              <Button
                key={d}
                onClick={() => (d === "⌫" ? handleDel() : handleDigit(d))}
                className="bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 text-white font-bold text-xl py-4 transition-colors"
              >
                {d}
              </Button>
            ),
          )}
        </div>

        <Button
          onClick={onClose}
          disabled={kembalian < 0}
          className={`w-full font-black uppercase tracking-widest py-5 text-sm transition-all flex items-center justify-center gap-3 ${
            kembalian < 0
              ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
              : "bg-orange hover:bg-orange/90 active:scale-[0.99] text-white"
          }`}
        >
          Selesai &amp; Tutup
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center ${
              kembalian < 0 ? "bg-neutral-700/50" : "bg-white/20"
            }`}
          >
            <LuCheck size={16} strokeWidth={3} />
          </span>
        </Button>
      </div>
    </div>
  );
}
