"use client";

import Button from "@/src/components/ui/Button";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">
        Terjadi Kesalahan!
      </h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
        Sistem mengalami gangguan teknis. Silakan coba lagi.
      </p>
      <Button
        onClick={() => reset()}
        className="px-6 py-2.5 bg-orange hover:bg-orange/90 text-white font-bold rounded-xl active:scale-95 transition-all"
      >
        Coba Lagi
      </Button>
    </div>
  );
}
