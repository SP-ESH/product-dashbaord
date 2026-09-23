import { Skeleton } from "@/components/ui/States";

/** Placeholder shown on the very first load of the list. */
export function ProductListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-lg bg-white p-4 ring-1 ring-slate-200"
        >
          <Skeleton className="h-12 w-12 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/5" />
          </div>
          <Skeleton className="hidden h-4 w-16 sm:block" />
          <Skeleton className="hidden h-4 w-20 sm:block" />
        </div>
      ))}
    </div>
  );
}
