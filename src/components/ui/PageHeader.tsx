import React from "react";
import Button from "./Button";

export interface PageHeaderProps {
  title: string | React.ReactNode;
  tag?: string;
  onTagClick?: () => void;
}

export default function PageHeader({
  title,
  tag,
  onTagClick,
}: PageHeaderProps) {
  if (tag) {
    return (
      <header className="w-full h-18 bg-black p-4 shrink-0 z-10">
        <div className="max-w-87.5 mx-auto w-full flex items-center justify-between">
          {typeof title === "string" ? (
            <h1 className="text-2xl font-bold text-white dark:text-white uppercase truncate pr-2">
              {title}
            </h1>
          ) : (
            <h1 className="text-2xl font-bold text-white dark:text-white uppercase pr-2 flex-1 min-w-0">
              {title}
            </h1>
          )}
          {onTagClick ? (
            <Button
              onClick={onTagClick}
              className="relative flex items-center w-36 h-8 bg-neutral-800 border border-neutral-700 rounded-full p-1 shrink-0 cursor-pointer active:scale-95 transition-transform"
            >
              <div
                className={`absolute w-[calc(50%-4px)] top-1 bottom-1 rounded-full transition-transform duration-300 ease-in-out ${
                  tag === "Bungkus"
                    ? "translate-x-full bg-neutral-600 border border-neutral-500"
                    : "translate-x-0 bg-orange"
                }`}
              />
              <div className="relative z-10 flex w-full h-full text-[9px] font-bold tracking-widest uppercase text-white pointer-events-none">
                <div className="flex-1 flex items-center justify-center text-center leading-none">
                  Makan
                </div>
                <div className="flex-1 flex items-center justify-center text-center leading-none">
                  Bungkus
                </div>
              </div>
            </Button>
          ) : (
            <div
              className={`px-4 h-7 flex items-center justify-center rounded-full text-[10px] font-bold tracking-widest uppercase text-white ${tag === "Bungkus" ? "bg-neutral-800 border border-neutral-700" : "bg-orange"}`}
            >
              {tag}
            </div>
          )}
        </div>
      </header>
    );
  }

  return (
    <div className="w-full bg-black h-16 flex items-center px-8 shrink-0 z-10">
      {typeof title === "string" ? (
        <h1 className="text-2xl text-white font-bold uppercase dark:text-white truncate">
          {title}
        </h1>
      ) : (
        <h1 className="text-2xl text-white font-bold uppercase dark:text-white flex-1 min-w-0">
          {title}
        </h1>
      )}
    </div>
  );
}
