import React from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { FileText, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { AuditLog, AuditPagination } from "./types";
import { getActionIcon, getActionBadge, getEntityName } from "./helpers";

interface AuditLogsTableProps {
  logs: AuditLog[];
  loading: boolean;
  pagination: AuditPagination;
  onPageChange: (page: number) => void;
  onSelectLog: (log: AuditLog) => void;
}

export const AuditLogsTable: React.FC<AuditLogsTableProps> = ({
  logs,
  loading,
  pagination,
  onPageChange,
  onSelectLog,
}) => {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">المستخدم</TableHead>
            <TableHead className="text-right">العملية</TableHead>
            <TableHead className="text-right">الكيان</TableHead>
            <TableHead className="text-right">التاريخ</TableHead>
            <TableHead className="text-left w-[100px]">التفاصيل</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                <div className="flex justify-center items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span>جاري التحميل...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-64 text-center text-muted-foreground"
              >
                <div className="flex flex-col items-center justify-center">
                  <FileText className="h-12 w-12 mb-4 opacity-20" />
                  <p>لا توجد سجلات مطابقة للبحث</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow
                key={log.id}
                className="group hover:bg-muted/50 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={log.actor?.avatar} />
                      <AvatarFallback>
                        {log.actorName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {log.actorName}
                      </span>
                      <span className="text-xs text-muted-foreground hidden group-hover:block transition-all">
                        {log.actor?.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getActionIcon(log.action)}
                    {getActionBadge(log.action)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-primary/80">
                      {getEntityName(log.entityType)}
                    </span>
                    {log.entityType !== "SETTINGS" && (
                      <span className="text-[10px] text-muted-foreground font-mono tabular-nums bg-muted px-1 rounded w-fit mt-1">
                        #{log.entityId?.substring(0, 8)}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium font-mono tabular-nums">
                      {format(new Date(log.createdAt), "dd MMM yyyy", {
                        locale: ar,
                      })}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono tabular-nums">
                      {format(new Date(log.createdAt), "HH:mm:ss", {
                        locale: ar,
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectLog(log)}
                  >
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t bg-muted/20">
        <div className="text-sm text-muted-foreground font-mono tabular-nums">
          صفحة {pagination.page} من {pagination.totalPages || 1}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
            disabled={pagination.page <= 1}
          >
            السابق
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            التالي
          </Button>
        </div>
      </div>
    </Card>
  );
};
