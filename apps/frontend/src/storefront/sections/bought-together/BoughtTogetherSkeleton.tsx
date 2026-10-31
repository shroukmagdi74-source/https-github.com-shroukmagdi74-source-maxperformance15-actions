import React from 'react';

export const BoughtTogetherSkeleton: React.FC = () => (
  <section className="w-full border-t border-border bg-background py-12 md:py-16">
    <div className="container px-4 md:px-6">
      <div className="rounded-[1.5rem] border border-border bg-card p-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-4 w-28 rounded bg-muted" />
          <div className="h-8 w-72 rounded bg-muted" />
          <div className="h-4 w-96 max-w-full rounded bg-muted" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`bundle-skeleton-${index}`}
              className="rounded-[1.25rem] border border-border bg-background p-4"
            >
              <div className="aspect-square rounded-xl bg-muted" />
              <div className="mt-4 space-y-2">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-4 w-2/3 rounded bg-muted" />
                <div className="h-4 w-20 rounded bg-muted" />
                <div className="h-10 rounded-xl bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default BoughtTogetherSkeleton;
