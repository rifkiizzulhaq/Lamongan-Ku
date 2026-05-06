"use client";

import PageHeader from "@/src/components/ui/PageHeader";
import Button from "@/src/components/ui/Button";
import { LuLogOut, LuChevronRight } from "react-icons/lu";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };
  return (
    <section className="h-[calc(100dvh-45px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title="Pengaturan" />
      <main className="relative max-w-87.5 mx-auto w-full flex flex-col h-full pt-4">
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-4 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-sm hover:border-red-500/40 dark:hover:border-red-500/40 active:scale-[0.99] transition-all text-left"
          >
            <span className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xl shrink-0 text-red-500">
              <LuLogOut size={22} strokeWidth={2} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-black uppercase tracking-wide text-red-500">
                Logout
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 font-medium">
                Keluar dari akun bos
              </p>
            </div>
            <LuChevronRight
              size={16}
              strokeWidth={2.5}
              className="text-neutral-300 dark:text-neutral-600 shrink-0"
            />
          </Button>
        </div>
      </main>
    </section>
  );
}
