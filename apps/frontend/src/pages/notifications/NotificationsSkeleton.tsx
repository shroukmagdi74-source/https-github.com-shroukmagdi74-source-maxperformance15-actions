import React from "react";

export const NotificationsSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-3" />
      <p className="text-xs font-mono text-muted-foreground">جاري استدعاء مركز الإشعارات...</p>
    </div>
  );
};
