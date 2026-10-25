import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Shield, Calendar, Clock, Globe, ListChecks } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { AuditLog } from "./types";
import {
  getActionBadge,
  getEntityName,
  formatFieldName,
  parseDetails,
} from "./helpers";

interface AuditLogDetailsDialogProps {
  selectedLog: AuditLog | null;
  onClose: () => void;
}

export const AuditLogDetailsDialog: React.FC<AuditLogDetailsDialogProps> = ({
  selectedLog,
  onClose,
}) => {
  return (
    <Dialog open={!!selectedLog} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            تفاصيل العملية
          </DialogTitle>
          <DialogDescription>
            المعلومات الكاملة عن هذا الإجراء
          </DialogDescription>
        </DialogHeader>

        {selectedLog && (
          <div className="mt-4 space-y-6">
            {/* Actor Info */}
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg border">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedLog.actor?.avatar} />
                <AvatarFallback>
                  {selectedLog.actorName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg">{selectedLog.actorName}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedLog.actor?.email || "System User"}
                </p>
              </div>
              <div className="mr-auto">
                {getActionBadge(selectedLog.action)}
              </div>
            </div>

            {/* Meta Info grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 p-3 bg-muted/30 rounded border">
                <span className="text-xs text-muted-foreground block mb-1">
                  التاريخ
                </span>
                <div className="font-medium flex items-center gap-2 text-sm font-mono tabular-nums">
                  <Calendar className="h-4 w-4 text-primary" />
                  {format(new Date(selectedLog.createdAt), "dd MMMM yyyy", {
                    locale: ar,
                  })}
                </div>
              </div>
              <div className="space-y-1 p-3 bg-muted/30 rounded border">
                <span className="text-xs text-muted-foreground block mb-1">
                  الوقت
                </span>
                <div className="font-medium flex items-center gap-2 text-sm font-mono tabular-nums">
                  <Clock className="h-4 w-4 text-primary" />
                  {format(new Date(selectedLog.createdAt), "HH:mm:ss a")}
                </div>
              </div>
              <div className="space-y-1 p-3 bg-muted/30 rounded border">
                <span className="text-xs text-muted-foreground block mb-1">
                  IP Address
                </span>
                <div className="font-medium flex items-center gap-2 font-mono tabular-nums text-sm">
                  <Globe className="h-4 w-4 text-primary" />
                  {selectedLog.ipAddress || "غير متوفر"}
                </div>
              </div>
              <div className="space-y-1 p-3 bg-muted/30 rounded border">
                <span className="text-xs text-muted-foreground block mb-1">
                  الكيان
                </span>
                <div className="font-medium flex items-center gap-2 text-sm text-primary">
                  <div className="h-4 w-4" />
                  {getEntityName(selectedLog.entityType)}
                  {selectedLog.entityType !== "SETTINGS" && (
                    <span className="text-[10px] text-muted-foreground bg-muted px-1 rounded font-mono tabular-nums">
                      #{selectedLog.entityId?.substring(0, 8)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Human Readable Details */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm border-b pb-2 flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-primary" />
                بيانات العملية التفصيلية
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(parseDetails(selectedLog.details)).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center p-2 bg-muted/20 rounded-md border border-transparent hover:border-muted-foreground/10 transition-all"
                    >
                      <span className="text-sm text-muted-foreground">
                        {formatFieldName(key)}
                      </span>
                      <span className="text-sm font-semibold">
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value)}
                      </span>
                    </div>
                  ),
                )}
                {Object.keys(parseDetails(selectedLog.details)).length === 0 && (
                  <div className="text-center p-4 text-muted-foreground text-sm italic">
                    لا توجد بيانات إضافية لهذه العملية
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={onClose} variant="outline">
                إغلاق
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
