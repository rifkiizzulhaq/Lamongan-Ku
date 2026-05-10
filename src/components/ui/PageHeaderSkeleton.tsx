export default function PageHeaderSkeleton({ hasTag = false }: { hasTag?: boolean }) {
  return (
    <div className="w-full h-16 bg-black px-8 flex items-center justify-between shrink-0 z-10 animate-pulse">
      <div className="w-32 h-6 bg-neutral-700 rounded-md"></div>
      {hasTag && (
        <div className="w-36 h-8 bg-neutral-700 rounded-full"></div>
      )}
    </div>
  );
}
