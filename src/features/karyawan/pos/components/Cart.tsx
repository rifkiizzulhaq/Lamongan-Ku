import Button from "@/src/components/ui/Button";

import { CartItem } from "@/interfaces/order";
import { LuLoader } from "react-icons/lu";

export interface CartProps {
  mode?: "create" | "update";
  cart: CartItem[];
  totalPrice: number;
  onSave?: () => void;
  onCancel?: () => void;
  isPending?: boolean;
  isClosed?: boolean;
}

export default function Cart({
  mode = "create",
  cart,
  totalPrice,
  onSave,
  onCancel,
  isPending = false,
  isClosed = false,
}: CartProps) {
  return (
    <>
      {isPending && (
        <div className="fixed inset-0 z-9999 bg-transparent cursor-wait touch-none pointer-events-auto" />
      )}
      <div className="w-full bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 px-5 pt-5 pb-3 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-60 mt-auto shrink-0 relative">
        <div className="max-w-87.5 mx-auto">
          {cart.some((item) => item.isTakeaway) && (
            <div className="bg-neutral-100 dark:bg-neutral-800/50 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 mb-4">
              <p className="text-[10px] font-bold text-neutral-500 mb-2 tracking-wider">
                DETAIL BUNGKUS:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {cart
                  .filter((item) => item.isTakeaway)
                  .map((item, idx) => (
                    <span
                      key={idx}
                      className="bg-neutral-800 dark:bg-neutral-700 text-white text-[10px] font-bold px-2 py-1 rounded"
                    >
                      {item.name} {item.quantity}x
                    </span>
                  ))}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">
                Total Harga
              </p>
              <p className="text-3xl font-black text-orange">
                {totalPrice > 0
                  ? `Rp ${totalPrice.toLocaleString("id-ID")}`
                  : "—"}
              </p>
            </div>

            <div className="flex gap-3 mt-1">
              {onCancel && (
                <Button
                  onClick={onCancel}
                  disabled={isPending}
                  className="flex-1 flex justify-center items-center bg-neutral-200 text-neutral-800 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 font-black py-4 rounded-xl transition-colors shadow-lg shadow-black/5 dark:shadow-white/5 uppercase tracking-widest text-[10px] sm:text-xs disabled:opacity-40 disabled:cursor-not-allowed text-center"
                >
                  Batal
                </Button>
              )}
              {mode === "create" && (
                <Button
                  onClick={onSave}
                  disabled={cart.length === 0 || isPending || isClosed}
                  className={`${onCancel ? "flex-2" : "w-full"} flex justify-center items-center bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-black py-4 rounded-xl transition-colors shadow-lg shadow-black/20 dark:shadow-white/10 uppercase tracking-widest text-sm disabled:opacity-40 disabled:cursor-not-allowed text-center`}
                >
                  {isPending ? (
                    <LuLoader className="animate-spin text-xl" />
                  ) : isClosed ? (
                    "Tutup"
                  ) : (
                    "Simpan"
                  )}
                </Button>
              )}
              {mode === "update" && (
                <Button
                  onClick={onSave}
                  disabled={isPending || isClosed}
                  className={`${onCancel ? "flex-2" : "w-full"} flex justify-center items-center bg-orange text-white hover:bg-orange-600 font-black py-4 rounded-xl transition-colors shadow-lg shadow-orange-500/20 uppercase tracking-widest text-sm disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {isPending ? (
                    <LuLoader className="animate-spin text-xl" />
                  ) : isClosed ? (
                    "Tutup"
                  ) : (
                    "Update"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
