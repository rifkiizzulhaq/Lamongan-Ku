import React from "react";

export interface PageHeaderProps {
  title: string | React.ReactNode;
  tag?: string;
}

export default function PageHeader({ title, tag }: PageHeaderProps) {
  if (tag) {
    return (
      <header className="w-full h-16 bg-black p-4 shrink-0 z-10">
        <div className="max-w-87.5 mx-auto w-full flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white dark:text-white uppercase truncate pr-2">
            {title}
          </h1>
          <span className="flex flex-row-reverse w-32 h-7 bg-white shrink-0">
            <p className="bg-orange font-bold w-30 h-full flex items-center justify-center uppercase text-[10px] tracking-widest text-white">
              {tag}
            </p>
          </span>
        </div>
      </header>
    );
  }

  return (
    <div className="w-full bg-black h-16 flex items-center px-8 shrink-0 z-10">
      <h1 className="text-2xl text-white font-bold uppercase dark:text-white truncate">
        {title}
      </h1>
    </div>
  );
}
