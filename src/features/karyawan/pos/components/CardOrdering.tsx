import Button from "@/src/components/ui/Button";

export interface CardOrderingProps {
  name: string;
  price: number;
  quantity: number;
  sisa?: number;
}

export const dummyOrderData: CardOrderingProps[] = [
  { name: "Ayam", price: 16000, quantity: 1, sisa: 15 },
  { name: "Lele", price: 13000, quantity: 2, sisa: 8 },
  { name: "Bebek", price: 20000, quantity: 1, sisa: 5 },
  { name: "Nasi Putih", price: 5000, quantity: 1 },
  { name: "Tempe", price: 2000, quantity: 1, sisa: 30 },
  { name: "Tahu", price: 2000, quantity: 1, sisa: 25 },
  { name: "Ati Ampela", price: 3000, quantity: 1, sisa: 10 },
  { name: "Kepalan Ayam", price: 2000, quantity: 1, sisa: 12 },
  { name: "Kepala Bebek", price: 4000, quantity: 1, sisa: 4 },
  { name: "Es Teh Tawar", price: 2000, quantity: 1 },
  { name: "Es Teh Manis", price: 3000, quantity: 1 },
  { name: "Sambal", price: 2000, quantity: 1 },
];

export default function CardOrdering({ name, price, quantity, sisa }: CardOrderingProps) {
  return (
    <div className="select-none bg-white flex w-full h-30 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <div className="bg-orange w-2 h-full shrink-0"></div>
      <div className="relative w-full h-full flex flex-col justify-between">
        {sisa !== undefined && (
          <div className="absolute top-1 left-2 bg-orange-100/70 dark:bg-orange-500/20 border border-orange-300 dark:border-orange-500/40 px-1.5 py-0.5 flex items-center justify-center rounded z-10">
            <p className="text-[10px] font-bold text-orange dark:text-orange-400">
              Sisa: {sisa}
            </p>
          </div>
        )}
        <div className="absolute top-1 right-2 bg-neutral-100 dark:bg-[#E2E2E2] border border-neutral-200 dark:border-neutral-600 px-2 py-0.5 flex items-center justify-center rounded-md shadow-sm z-10">
          <p className="text-[11px] font-extrabold text-neutral-700 dark:text-neutral-800">
            {quantity}x
          </p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center pt-2">
          <h3 className="text-sm font-black text-neutral-800 dark:text-white uppercase tracking-wider text-center px-1">
            {name}
          </h3>
          <p className="text-[13px] font-semibold text-neutral-500 dark:text-neutral-400 mt-1">
            Rp {price.toLocaleString("id-ID")}
          </p>
        </div>
        <Button className="bg-red-100 text-red-600 hover:bg-red-600 hover:text-white dark:bg-red-500/30 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white h-8 w-full rounded-none text-xs font-bold uppercase tracking-widest transition-colors">
          Hapus
        </Button>
      </div>
    </div>
  );
}
