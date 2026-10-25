import React from "react";
import { Button } from "../../../components/ui/button";
import { Shield, Download } from "lucide-react";

interface AuditLogsHeaderProps {
  onExport: () => void;
  disabled: boolean;
}

export const AuditLogsHeader: React.FC<AuditLogsHeaderProps> = ({
  onExport,
  disabled,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          سجلات التدقيق
        </h1>
        <p className="text-muted-foreground mt-1">
          سجل التغييرات ومراقبة النظام
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="gap-2"
          onClick={onExport}
          disabled={disabled}
        >
          <Download className="h-4 w-4" />
          تصدير CSV
        </Button>
      </div>
    </div>
  );
};
