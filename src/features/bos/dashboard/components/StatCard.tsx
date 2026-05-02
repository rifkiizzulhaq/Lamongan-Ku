import { ReactNode } from "react";
import Link from "next/link";

export interface StatCardProps {
  title?: string;
  value?: string | ReactNode;
  icon?: ReactNode;
  edit?: ReactNode;
  editHref?: string;
  children?: ReactNode;
}

export default function StatCard({
  title,
  value,
  icon,
  edit,
  editHref,
  children,
}: StatCardProps) {
  return (
    <div className="flex flex-col p-5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] w-full">
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 mb-4 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-xl flex items-center justify-center text-neutral-600 dark:text-neutral-300">
          {icon}
        </div>
        {edit && editHref ? (
          <Link
            href={editHref}
            className="w-10 h-10 mb-4 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-xl flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors cursor-pointer"
          >
            {edit}
          </Link>
        ) : edit ? (
          <div className="w-10 h-10 mb-4 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-xl flex items-center justify-center text-neutral-600 dark:text-neutral-300">
            {edit}
          </div>
        ) : null}
      </div>

      <p className="text-neutral-600 dark:text-neutral-400 text-sm font-medium mb-1">
        {title}
      </p>

      {value !== undefined && (
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            {value}
          </h2>
        </div>
      )}

      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
