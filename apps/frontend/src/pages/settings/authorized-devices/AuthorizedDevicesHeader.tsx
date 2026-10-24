import React from "react";
import { Button } from "@/components/ui/button";
import { Building2, RefreshCw } from "lucide-react";

interface AuthorizedDevicesHeaderProps {
  loading: boolean;
  onRefresh: () => void;
}

export const AuthorizedDevicesHeader: React.FC<AuthorizedDevicesHeaderProps> = ({
  loading,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          إدارة أجهزة الموظفين وتحديد نوعها
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          التمييز بين أجهزة المكتب المعتمدة والأجهزة الشخصية لحماية بيانات الشركة وعزل الشيفتات.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={loading}
        className="gap-2 self-start sm:self-auto"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        تحديث
      </Button>
    </div>
  );
};
