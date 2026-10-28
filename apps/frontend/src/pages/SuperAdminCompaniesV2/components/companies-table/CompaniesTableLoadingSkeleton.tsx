import React from "react";
import { Skeleton } from "../../../../components/ui/skeleton";

interface CompaniesTableLoadingSkeletonProps {
  isMobile: boolean;
}

export const CompaniesTableLoadingSkeleton: React.FC<CompaniesTableLoadingSkeletonProps> = ({
  isMobile,
}) => {
  return (
    <div className="space-y-2">
      {[...Array(isMobile ? 4 : 8)].map((_, i) =>
        isMobile ? (
          <div key={i} className="rounded-xl border border-border/60 bg-white p-3.5 dark:bg-card">
            <div className="flex items-start gap-3">
              <Skeleton className="mt-1 size-4 rounded" />
              <div className="flex-1 space-y-2.5">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-3 w-48 rounded" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-10 rounded-lg" />
                  <Skeleton className="h-10 rounded-lg" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1 rounded-lg" />
                  <Skeleton className="h-8 flex-1 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-border/40 bg-white px-3 py-2.5 dark:bg-card"
          >
            <Skeleton className="size-4 rounded" />
            <Skeleton className="size-5 rounded-md" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-32 rounded" />
              <Skeleton className="h-3 w-40 rounded" />
            </div>
            <Skeleton className="h-6 w-24 rounded-md hidden md:block" />
            <Skeleton className="h-6 w-24 rounded-md hidden lg:block" />
            <Skeleton className="h-6 w-20 rounded-md hidden sm:block" />
            <Skeleton className="h-7 w-20 rounded-md" />
          </div>
        ),
      )}
    </div>
  );
};
