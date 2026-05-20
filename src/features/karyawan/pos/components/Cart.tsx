import Button from "@/src/components/ui/Button";

import { CartItem } from "@/interfaces/order";
import { LuLoader } from "react-icons/lu";

export interface CartProps {
  mode?: "create" | "update";
  cart: CartItem[];
  totalPrice: number;
  onSave?: () => void;
  isPending?: boolean;
  isClosed?: boolean;
}

export default function Cart({
  mode = "create",
  cart,
  totalPrice,
  onSave,
  isPending = false,
  isClosed = false,
}: CartProps) {
  return (
    <div className="w-full bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 p-5 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-50 mt-auto shrink-0">
      <div className="max-w-87.5 mx-auto">
        <div className="flex flex-col gap-4 mb-5">
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
            {mode === "create" && (
              <Button
                onClick={onSave}
                disabled={cart.length === 0 || isPending || isClosed}
                className="w-full flex justify-center items-center bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-black py-4 rounded-xl transition-colors shadow-lg shadow-black/20 dark:shadow-white/10 uppercase tracking-widest text-sm disabled:opacity-40 disabled:cursor-not-allowed text-center"
              >
                {isPending ? (
                  <LuLoader className="animate-spin text-xl" />
                ) : isClosed ? (
                  "Warung Tutup"
                ) : (
                  "Simpan"
                )}
              </Button>
            )}
            {mode === "update" && (
              <Button
                onClick={onSave}
                disabled={isPending || isClosed}
                className="w-full flex justify-center items-center bg-orange text-white hover:bg-orange-600 font-black py-4 rounded-xl transition-colors shadow-lg shadow-orange-500/20 uppercase tracking-widest text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <LuLoader className="animate-spin text-xl" />
                ) : isClosed ? (
                  "Warung Tutup"
                ) : (
                  "Update"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
