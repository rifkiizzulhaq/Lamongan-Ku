import Button from "@/src/components/ui/Button";

export interface CardOrderingProps {
  name: string;
  price: number;
  quantity: number;
  sisa?: number;
  disabled?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
}

export default function CardOrdering({
  name,
  price,
  quantity,
  sisa,
  disabled = false,
  onAdd,
  onRemove,
}: CardOrderingProps) {
  const inCart = quantity > 0;

  return (
    <div
      onClick={disabled ? undefined : onAdd}
      className={`select-none bg-white flex w-full h-30 dark:bg-neutral-800 rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98] group ${
        inCart
          ? "border-orange dark:border-orange shadow-orange/20"
          : disabled
            ? "border-neutral-200 dark:border-neutral-700 opacity-60 cursor-not-allowed"
            : "border-neutral-200 dark:border-neutral-700"
      }`}
    >
      <div
        className={`w-2 h-full shrink-0 transition-colors ${inCart ? "bg-orange" : "bg-neutral-300 dark:bg-neutral-600"}`}
      />
      <div className="relative w-full h-full flex flex-col justify-between">
        {sisa !== undefined && (
          <div className="absolute top-1 left-2 bg-orange-100/70 dark:bg-orange-500/20 border border-orange-300 dark:border-orange-500/40 px-1.5 py-0.5 rounded z-10">
            <p className="text-[10px] font-bold text-orange dark:text-orange-400">
              Sisa: {sisa}
            </p>
          </div>
        )}

        {inCart && (
          <div className="absolute top-1 right-2 bg-orange border border-orange px-2 py-0.5 rounded-md shadow-sm z-10">
            <p className="text-[11px] font-extrabold text-white">{quantity}x</p>
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center pt-2">
          <h3 className="text-sm font-black text-neutral-800 dark:text-white uppercase tracking-wider text-center px-1">
            {name}
          </h3>
          <p className="text-[13px] font-semibold text-neutral-500 dark:text-neutral-400 mt-1">
            Rp {price.toLocaleString("id-ID")}
          </p>
        </div>

        <Button
          onClick={(e) => {
            e?.stopPropagation();
            onRemove?.();
          }}
          disabled={disabled && !inCart}
          className={`h-8 w-full rounded-none text-xs font-bold uppercase tracking-widest transition-colors ${
            inCart
              ? "bg-red-100 text-red-600 hover:bg-red-600 hover:text-white dark:bg-red-500/30 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
              : disabled
                ? "bg-neutral-100 text-neutral-400 dark:bg-neutral-700 dark:text-neutral-500 cursor-not-allowed"
                : "bg-neutral-100 text-neutral-400 dark:bg-neutral-700 dark:text-neutral-500 cursor-default"
          }`}
        >
          {inCart ? "Hapus" : disabled ? "Habis" : "+"}
        </Button>
      </div>
    </div>
  );
}
