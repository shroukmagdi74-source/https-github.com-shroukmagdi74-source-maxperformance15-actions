import React from "react";

interface AuthorizedDevicesEmptyStateProps {
  loading: boolean;
}

export const AuthorizedDevicesEmptyState: React.FC<AuthorizedDevicesEmptyStateProps> = ({
  loading,
}) => {
  return (
    <div className="p-12 text-center text-sm text-muted-foreground">
      {loading
        ? "جاري جلب قائمة الأجهزة المسجلة…"
        : "لم يتم العثور على أجهزة مسجلة مطابقة للبحث."}
    </div>
  );
};
