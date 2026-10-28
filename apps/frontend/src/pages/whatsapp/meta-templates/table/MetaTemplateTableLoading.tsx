import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const MetaTemplateTableLoading: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-xl border border-[color:var(--shell-control-border)] p-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-[color:var(--shell-control-border)] p-3"
        >
          <Skeleton className="size-9 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
};
