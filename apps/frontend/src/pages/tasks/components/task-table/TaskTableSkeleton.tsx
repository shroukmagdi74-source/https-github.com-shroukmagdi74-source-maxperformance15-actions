import React from "react";

export const SkeletonRow: React.FC = () => (
  <tr className="animate-pulse">
    <td className="px-3 py-3 text-center">
      <div className="mx-auto size-4 rounded bg-muted" />
    </td>
    <td className="px-3 py-3">
      <div className="space-y-2">
        <div className="h-4 w-48 rounded-full bg-muted" />
        <div className="h-3 w-72 rounded-full bg-muted" />
        <div className="flex gap-3">
          <div className="h-3 w-20 rounded-full bg-muted" />
          <div className="h-3 w-16 rounded-full bg-muted" />
        </div>
      </div>
    </td>
    <td className="px-3 py-3">
      <div className="space-y-1.5">
        <div className="h-5 w-16 rounded-full bg-muted" />
        <div className="h-5 w-12 rounded-full bg-muted" />
      </div>
    </td>
    <td className="px-3 py-3">
      <div className="space-y-1.5">
        <div className="h-3.5 w-20 rounded-full bg-muted" />
        <div className="h-3 w-16 rounded-full bg-muted" />
      </div>
    </td>
    <td className="px-3 py-3">
      <div className="space-y-1.5">
        <div className="h-3.5 w-12 rounded-full bg-muted" />
        <div className="h-1.5 w-28 rounded-full bg-muted" />
      </div>
    </td>
    <td className="px-3 py-3">
      <div className="flex gap-1.5">
        <div className="size-8 rounded-full bg-muted" />
        <div className="size-8 rounded-full bg-muted" />
        <div className="size-8 rounded-full bg-muted" />
      </div>
    </td>
  </tr>
);

export const MobileSkeletonCard: React.FC = () => (
  <div className="animate-pulse overflow-hidden rounded-[16px] border border-border/70 bg-background/80 px-3 py-3">
    <div className="space-y-3">
      <div className="flex gap-1.5">
        <div className="h-5 w-14 rounded-full bg-muted" />
        <div className="h-5 w-14 rounded-full bg-muted" />
      </div>
      <div className="h-4 w-52 rounded-full bg-muted" />
      <div className="h-3 w-full rounded-full bg-muted" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-3 w-20 rounded-full bg-muted" />
        <div className="h-3 w-16 rounded-full bg-muted" />
        <div className="h-3 w-24 rounded-full bg-muted" />
        <div className="h-3 w-10 rounded-full bg-muted" />
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted" />
      <div className="flex justify-between">
        <div className="h-8 w-24 rounded-full bg-muted" />
        <div className="flex gap-0.5">
          <div className="size-8 rounded-full bg-muted" />
          <div className="size-8 rounded-full bg-muted" />
          <div className="size-8 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  </div>
);
