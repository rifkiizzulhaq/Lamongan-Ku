"use client";

import { useUiStore } from "@/src/store/uiStore";
import Button from "./Button";
import { useSyncExternalStore } from "react";

export default function GlobalConfirmModal() {
  const confirmModal = useUiStore((state) => state.confirmModal);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted || !confirmModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-8888 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-5">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
            {confirmModal.title}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            {confirmModal.message}
          </p>
        </div>
        <div className="flex bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700/50 p-2">
          <Button
            onClick={confirmModal.onCancel}
            className="flex-1 rounded-xl bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 h-11"
          >
            Batal
          </Button>
          <Button
            onClick={confirmModal.onConfirm}
            className="flex-1 rounded-xl bg-orange hover:bg-orange-600 text-white font-bold h-11 ml-2"
          >
            Konfirmasi
          </Button>
        </div>
      </div>
    </div>
  );
}
