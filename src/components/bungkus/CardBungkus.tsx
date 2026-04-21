import Button from "@/src/components/ui/Button";

export interface OrderItem {
  n: string;
  q: number;
}

export interface CardBungkusProps {
  id: string;
  totalPrice: number;
  status: string;
  items: OrderItem[];
}

export default function CardBungkus({ id, totalPrice, status, items }: CardBungkusProps) {
  return (
    <section className="w-full h-60 bg-white dark:bg-neutral-700 rounded-xl border border-neutral-300 dark:border-neutral-600 flex items-center justify-between">
      <main className="w-full h-full flex items-center justify-between">
        <div className="w-2 h-full bg-orange rounded-l-xl flex items-center justify-center"></div>
        <div className="w-full h-full flex flex-col justify-between">
          <div className="flex flex-col items-center justify-between px-5 py-3">
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
              <h4 className="animate-pulse text-sm text-left font-semibold text-orange">
                {status}
              </h4>
            </div>
            <div className="w-full flex flex-wrap content-start gap-2 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 rounded-lg p-2.5 mt-3 overflow-y-auto max-h-24 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-2.5 py-1 bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm hover:border-orange-400/50 dark:hover:border-orange-500/50 transition-colors cursor-default"
                >
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    {item.n}
                  </span>
                  <span className="flex items-center justify-center min-w-[20px] h-5 bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 font-bold rounded text-[10px]">
                    {item.q}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Button className="h-20 bg-black uppercase font-bold rounded-br-xl mt-auto">
            Bayar
          </Button>
        </div>
      </main>
    </section>
  );
}
