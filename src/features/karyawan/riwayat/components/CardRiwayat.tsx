import { OrderItem } from "@/interfaces/order";

export interface CardRiwayatProps {
  id: string;
  date: string;
  totalPrice: number;
  orderType: string;
  items: OrderItem[];
}

export default function CardRiwayat({
  id,
  date,
  totalPrice,
  orderType,
  items,
}: CardRiwayatProps) {
  const hasTakeaway = items.some((item) => item.isTakeaway);

  return (
    <section className="w-full bg-white dark:bg-neutral-700 rounded-xl border border-neutral-300 dark:border-neutral-600 flex items-stretch shadow-sm hover:border-orange-500/50 transition-colors cursor-default">
      <div className="w-2 bg-orange rounded-l-xl shrink-0"></div>
      <div className="flex flex-col px-5 py-4 w-full">
        <div className="w-full flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wide">
            {id}
          </h1>
          <p className="text-lg font-bold text-neutral-800 dark:text-white">
            Rp {totalPrice.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-1 mb-3">
          <p className="text-[13px] font-semibold text-neutral-500 dark:text-neutral-300">
            {date}
          </p>
          {hasTakeaway && orderType === "makan" && (
            <span className="flex items-center justify-center h-5 bg-hijau text-white text-[10px] font-bold px-2 rounded-full">
              Bungkus
            </span>
          )}
        </div>

        <div
          className={`w-full flex flex-wrap content-start gap-2 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 rounded-lg p-2.5 ${
            items.length > 5
              ? "max-h-30 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 pr-1"
              : ""
          }`}
        >
          {[...items]
            .sort((a, b) =>
              a.isTakeaway === b.isTakeaway ? 0 : a.isTakeaway ? 1 : -1,
            )
            .map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-2.5 py-1 border rounded-md shadow-sm transition-colors ${
                  item.isTakeaway
                    ? "bg-neutral-800 border-neutral-700 text-white"
                    : "bg-white dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700"
                }`}
              >
                <span
                  className={`text-xs font-medium ${
                    item.isTakeaway
                      ? "text-neutral-200"
                      : "text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  {item.isTakeaway && orderType === "makan"
                    ? `Bungkus: ${item.n}`
                    : item.n}
                </span>
                <span className="flex items-center justify-center min-w-5 h-5 bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 font-bold rounded text-[10px]">
                  {item.q}
                </span>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
