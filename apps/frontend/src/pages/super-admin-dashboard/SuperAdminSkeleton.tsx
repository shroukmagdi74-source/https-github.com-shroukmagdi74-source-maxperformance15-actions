import React from "react";

export const SuperAdminSkeleton: React.FC = () => {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
        <p className="text-sm font-black text-muted-foreground animate-pulse">
          جاري تحميل البيانات الأساسية...
        </p>
      </div>
    </div>
  );
};
