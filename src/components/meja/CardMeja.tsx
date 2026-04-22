import Link from "next/link";
import Button from "@/src/components/ui/Button";

export default function CardMeja() {
  return (
    <div className="w-[calc(50%-0.5rem)] h-36 flex bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm hover:border-orange-400 dark:hover:border-orange-500/50 transition-colors cursor-pointer group">
      <div className="w-2 h-full bg-orange shrink-0"></div>
      <div className="flex-1 flex flex-col justify-between w-full h-full">
        <Link href="/meja/makan" className="flex flex-col pt-3 px-3 w-full">
          <h2 className="text-neutral-800 dark:text-white text-xl font-black uppercase tracking-wider">
            Meja 1
          </h2>
          <div className="flex flex-col gap-0.5 mt-1">
            <div className="flex items-center gap-1.5">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange opacity-75"></span>
                <span className="relative inline-flex rounded-full w-2 h-2 bg-orange"></span>
              </span>
              <p className="text-[11px] font-bold uppercase tracking-widest text-orange">
                Active
              </p>
            </div>
            <h3 className="text-neutral-600 dark:text-neutral-300 font-extrabold text-base">
              Rp 60.000
            </h3>
          </div>
        </Link>
        <Button className="h-10 w-full bg-black text-white hover:bg-neutral-800 dark:bg-neutral-900 dark:hover:bg-black uppercase font-bold rounded-none text-xs transition-colors mt-auto z-10 relative">
          Bayar
        </Button>
      </div>
    </div>
  );
}
