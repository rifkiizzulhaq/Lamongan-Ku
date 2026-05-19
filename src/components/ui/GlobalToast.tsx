"use client";

import { useUiStore } from "@/src/store/uiStore";
import { LuCheck, LuTriangleAlert, LuInfo, LuX } from "react-icons/lu";
import { useSyncExternalStore, useState, useEffect } from "react";

function ToastItem({
  toast,
  removeToast,
}: {
  toast: { id: string; message: string; type: string };
  removeToast: (id: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;

    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isHovered, toast.id, removeToast]);

  let bgColor = "bg-blue-500";
  let Icon = LuInfo;

  if (toast.type === "success") {
    bgColor = "bg-green-500";
    Icon = LuCheck;
  } else if (toast.type === "error") {
    bgColor = "bg-red-500";
    Icon = LuTriangleAlert;
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex items-start sm:items-center gap-3 w-full px-4 py-3 text-white rounded-xl shadow-lg pointer-events-auto transform transition-all animate-in slide-in-from-top-4 fade-in ${bgColor}`}
    >
      <Icon size={20} className="shrink-0 mt-0.5 sm:mt-0" />
      <p className="text-sm font-medium flex-1 overflow-hidden">
        {toast.message}
      </p>
      <button
        onClick={() => removeToast(toast.id)}
        className="ml-2 hover:bg-white/20 p-1 rounded-full transition-colors focus:outline-none"
      >
        <LuX size={16} />
      </button>
    </div>
  );
}

export default function GlobalToast() {
  const toasts = useUiStore((state) => state.toasts);
  const removeToast = useUiStore((state) => state.removeToast);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-9999 flex flex-col items-center gap-2 pointer-events-none w-full max-w-[90%] sm:max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
}
