"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LuTrash2, LuLoader } from "react-icons/lu";
import Button from "@/src/components/ui/Button";
import PaymentModal from "@/src/features/karyawan/pos/components/PaymentModal";
import { deleteMakanOrder, payMakanOrder } from "@/src/server/karyawan/meja/meja.server";
import { KursiItem } from "@/interfaces/models";

export interface CardKursiProps {
  id: string;
  tableId: number;
  orderId: string | number;
  totalPrice: number;
  status: string;
  items: KursiItem[];
}

export default function CardKursi({
  id,
  tableId,
  orderId,
  totalPrice,
  status,
  items,
  label,
  tipe,
}: CardKursiProps & { label: string; tipe: string }) {
  const [showPayment, setShowPayment] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: hapus, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteMakanOrder(typeof orderId === 'string' ? parseInt(orderId) : orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table-orders", tableId] });
      queryClient.invalidateQueries({ queryKey: ["tables-karyawan"] });
      queryClient.invalidateQueries({ queryKey: ["stock-list"] });
    }
  });

  const { mutate: bayar, isPending: isPaying } = useMutation({
    mutationFn: () => payMakanOrder(typeof orderId === 'string' ? parseInt(orderId) : orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table-orders", tableId] });
      queryClient.invalidateQueries({ queryKey: ["tables-karyawan"] });
      setShowPayment(false);
    }
  });

  const hasTakeaway = items.some(item => item.isTakeaway);
  const displayLabel = label || (hasTakeaway ? "Bungkus" : "");

  return (
    <>
      <section className="w-full h-60 bg-white dark:bg-neutral-700 rounded-xl border border-neutral-300 dark:border-neutral-600 flex items-center justify-between shadow-sm group-hover:border-orange-500/50 transition-colors">
        <main className="w-full h-full flex items-center justify-between">
          <div className="w-2 h-full bg-orange rounded-l-xl flex items-center justify-center shrink-0"></div>
          <div className="w-full h-full flex flex-col justify-between">
            <Link
              href={`/meja/${tableId}/makan?mode=update&orderId=${orderId}`}
              className="flex flex-col items-center justify-between px-5 py-3 flex-1 overflow-hidden"
            >
              <div className="w-full flex items-center justify-between">
                <h1 className="text-lg font-bold text-gray-800 dark:text-white uppercase">
                  {id}
                </h1>
                <span>
                  <p className="text-lg text-neutral-600 dark:text-neutral-100 dark:font-bold">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </p>
                </span>
              </div>
              <div className="w-full flex items-center justify-between mt-1">
                {tipe ? (
                  <div className="flex items-center justify-center w-fit h-5 bg-blue-500 text-white text-xs font-bold px-2 py-2 rounded-full">
                    <h3 className="text-xs text-left font-semibold">
                      Tipe: {tipe}
                    </h3>
                  </div>
                ) : null}
              </div>
              <div className="w-full flex items-center justify-between mt-1">
                <h4 className="animate-pulse text-sm text-left font-semibold text-orange">
                  {status}
                </h4>
                {displayLabel ? (
                  <div className="flex items-center justify-center w-fit h-5 bg-hijau text-hijau-700 dark:bg-hijau-500/30 dark:text-hijau-300 text-xs font-bold px-2 py-2 rounded-full">
                    <h3 className="text-xs text-left font-semibold text-white">
                      {displayLabel}
                    </h3>
                  </div>
                ) : null}
              </div>
              <div className="w-full flex flex-wrap content-start gap-2 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 rounded-lg p-2.5 mt-3 overflow-y-auto max-h-24 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-2.5 py-1 ${item.isTakeaway ? "bg-neutral-800 border-neutral-700 text-white" : "bg-white dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"} border rounded-md shadow-sm transition-colors cursor-default`}
                  >
                    <span className="text-xs font-medium">
                      {item.isTakeaway ? `Bungkus: ${item.n}` : item.n}
                    </span>
                    <span className="flex items-center justify-center min-w-5 h-5 bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 font-bold rounded text-[10px]">
                      {item.q}
                    </span>
                  </div>
                ))}
              </div>
            </Link>

            <div className="flex shrink-0">
              <Button 
                onClick={() => hapus()}
                disabled={isDeleting}
                className="h-12 w-16 shrink-0 bg-red-500 text-white hover:bg-red-600 dark:bg-red-900 dark:hover:bg-red-700 uppercase font-bold rounded-none text-xs transition-colors mt-auto z-10 relative flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? <LuLoader size={18} className="animate-spin" /> : <LuTrash2 size={18} strokeWidth={2.5} />}
              </Button>
              <Button
                onClick={() => setShowPayment(true)}
                className="h-12 flex-1 bg-black text-white hover:bg-neutral-800 dark:bg-neutral-900 dark:hover:bg-black uppercase font-bold rounded-br-xl mt-auto z-10 relative transition-colors"
              >
                Bayar
              </Button>
            </div>
          </div>
        </main>
      </section>

      {showPayment && (
        <PaymentModal
          id={id}
          totalPrice={totalPrice}
          loading={isPaying}
          onClose={() => setShowPayment(false)}
          onConfirm={async () => {
            bayar();
          }}
        />
      )}
    </>
  );
}
