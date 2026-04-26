import Button from "@/src/components/ui/Button";

export interface PayProps {
  mode?: "create" | "update" | "meja";
}

export default function Cart({ mode = "meja" }: PayProps) {
  return (
    <div className="w-full bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 p-5 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-50 mt-auto shrink-0">
      <div className="max-w-87.5 mx-auto">
        {/* <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 flex flex-col gap-2 mb-4 pr-2">
          <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-2">
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Ayam <span className="text-orange font-black ml-1">1x</span>
            </p>
            <p className="text-sm font-bold text-neutral-800 dark:text-white">
              Rp 20.000
            </p>
          </div>
          <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-2">
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Nasi <span className="text-orange font-black ml-1">1x</span>
            </p>
            <p className="text-sm font-bold text-neutral-800 dark:text-white">
              Rp 5.000
            </p>
          </div>
          <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-2">
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Nasi <span className="text-orange font-black ml-1">1x</span>
            </p>
            <p className="text-sm font-bold text-neutral-800 dark:text-white">
              Rp 5.000
            </p>
          </div>
          <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-2">
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Nasi <span className="text-orange font-black ml-1">1x</span>
            </p>
            <p className="text-sm font-bold text-neutral-800 dark:text-white">
              Rp 5.000
            </p>
          </div>
        </div> */}

        <div className="flex flex-col gap-4 mb-5">
          <div className="flex justify-between items-end">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">
              Total Harga
            </p>
            <p className="text-3xl font-black text-orange">Rp 25.000</p>
          </div>

          <div className="flex gap-3 mt-1">
            {mode === "create" && (
              <Button className="w-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-black py-4 rounded-xl transition-colors shadow-lg shadow-black/20 dark:shadow-white/10 uppercase tracking-widest text-sm">
                Simpan
              </Button>
            )}

            {mode === "update" && (
              <Button className="w-full bg-orange text-white hover:bg-orange-600 dark:bg-orange dark:hover:bg-orange-700 font-black py-4 rounded-xl transition-colors shadow-lg shadow-orange-500/20 uppercase tracking-widest text-sm">
                Update
              </Button>
            )}

            {mode === "meja" && (
              <>
                <Button className="flex-1 bg-orange text-white hover:bg-neutral-200  font-black py-4 rounded-xl transition-colors uppercase tracking-wider text-xs">
                  Update
                </Button>
                <Button className="flex-2 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-black py-4 rounded-xl transition-colors shadow-lg shadow-black/20 dark:shadow-white/10 uppercase tracking-widest text-sm">
                  Simpan
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
