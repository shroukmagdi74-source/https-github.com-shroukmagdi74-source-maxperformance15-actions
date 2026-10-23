import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WhatsAppSurfaceCard } from "../../components/WhatsAppPageShell";
import {
  STATUS_BADGE_CLASSES,
  type NotificationLog,
} from "../types";

interface WhatsAppAnalyticsLogsTableProps {
  logs: NotificationLog[];
  categoryFilter: string;
  statusFilter: string;
  page: number;
  rowsPerPage: number;
  totalLogs: number;
  totalPages: number;
  from: number;
  to: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  summaryHint: string;
  unknownRecipient: string;
  categoryLabels: Record<string, string>;
  statusLabels: Record<string, string>;
  eventLabels: Record<string, string>;
  t: (key: string, options?: Record<string, unknown>) => string;
  formatLocaleDate: (val: string) => string;
  onSetPage: (page: number | ((prev: number) => number)) => void;
  onSetRowsPerPage: (size: number) => void;
  onSetCategoryFilter: (cat: string) => void;
  onSetStatusFilter: (status: string) => void;
}

export const WhatsAppAnalyticsLogsTable: React.FC<
  WhatsAppAnalyticsLogsTableProps
> = ({
  logs,
  categoryFilter,
  statusFilter,
  page,
  rowsPerPage,
  totalLogs,
  totalPages,
  from,
  to,
  canGoPrevious,
  canGoNext,
  summaryHint,
  unknownRecipient,
  categoryLabels,
  statusLabels,
  eventLabels,
  t,
  formatLocaleDate,
  onSetPage,
  onSetRowsPerPage,
  onSetCategoryFilter,
  onSetStatusFilter,
}) => {
  return (
    <WhatsAppSurfaceCard
      title={t("whatsappAnalytics.logs.title")}
      description={t("whatsappAnalytics.description")}
      action={
        <div className="flex flex-wrap gap-2">
          <Select
            value={categoryFilter || "__all__"}
            onValueChange={(value) => {
              onSetPage(0);
              onSetCategoryFilter(value === "__all__" ? "" : (value ?? ""));
            }}
          >
            <SelectTrigger className="h-8 min-w-[10rem] text-xs">
              <SelectValue placeholder={t("whatsappAnalytics.logs.type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{t("common.all")}</SelectItem>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter || "__all__"}
            onValueChange={(value) => {
              onSetPage(0);
              onSetStatusFilter(value === "__all__" ? "" : (value ?? ""));
            }}
          >
            <SelectTrigger className="h-8 min-w-[10rem] text-xs">
              <SelectValue placeholder={t("whatsappAnalytics.logs.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{t("common.all")}</SelectItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/60">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/70 hover:bg-transparent">
              <TableHead className="text-xs font-medium text-muted-foreground">
                {t("whatsappAnalytics.logs.recipient")}
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                {t("whatsappAnalytics.logs.type")}
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                {t("whatsappAnalytics.logs.status")}
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                {t("whatsappAnalytics.logs.error")}
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                {t("whatsappAnalytics.logs.date")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/40">
            {logs.length > 0 ? (
              logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="font-medium text-xs text-foreground">
                        {log.recipientName || unknownRecipient}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono tabular-nums">
                        {log.recipientPhone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="rounded-full border-border/70 bg-muted/40 text-[10px]"
                    >
                      {eventLabels[log.eventType] || log.eventType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`rounded-full text-[10px] ${
                        STATUS_BADGE_CLASSES[log.status] ||
                        STATUS_BADGE_CLASSES.CANCELLED
                      }`}
                    >
                      {statusLabels[log.status] || log.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.status === "FAILED" && log.failureReason ? (
                      <span
                        className="max-w-[180px] truncate block text-[11px] text-rose-600 dark:text-rose-400"
                        title={log.failureReason}
                      >
                        {log.failureReason}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono tabular-nums">
                    {formatLocaleDate(log.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center">
                  <div className="space-y-1.5">
                    <p className="font-medium text-xs text-foreground">
                      {t("whatsappAnalytics.logs.noLogs")}
                    </p>
                    <p className="text-xs text-muted-foreground">{summaryHint}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Bar */}
      <div className="mt-4 flex flex-col gap-3 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between text-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="text-muted-foreground font-mono tabular-nums">
            {t("whatsappAnalytics.logs.displayedRows", {
              from,
              to,
              count: totalLogs,
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-sans">
              {t("whatsappAnalytics.logs.rowsPerPage")}
            </span>
            <Select
              value={String(rowsPerPage)}
              onValueChange={(value) => {
                onSetRowsPerPage(Number(value));
                onSetPage(0);
              }}
            >
              <SelectTrigger className="h-7 w-[5.5rem] text-xs font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50].map((size) => (
                  <SelectItem key={size} value={String(size)} className="font-mono text-xs">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetPage((current) => Math.max(0, current - 1))}
            disabled={!canGoPrevious}
            className="h-7 rounded-full text-xs"
          >
            {t("common.previous")}
          </Button>
          <div className="rounded-full border border-border/70 bg-muted/20 px-2.5 py-0.5 text-xs font-mono tabular-nums text-muted-foreground">
            {page + 1} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetPage((current) => current + 1)}
            disabled={!canGoNext}
            className="h-7 rounded-full text-xs"
          >
            {t("common.next")}
          </Button>
        </div>
      </div>
    </WhatsAppSurfaceCard>
  );
};
