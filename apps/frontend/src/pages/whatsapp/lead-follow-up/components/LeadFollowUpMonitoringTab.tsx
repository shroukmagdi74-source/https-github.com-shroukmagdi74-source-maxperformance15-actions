import React from "react";
import { Users } from "lucide-react";

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
import { cn } from "@/lib/utils";

import { WhatsAppSurfaceCard } from "../../components/WhatsAppPageShell";
import {
  STATUSES,
  statusCfg,
  type Flow,
  type Journey,
  type LegacyEnrollment,
} from "../types";

interface LeadFollowUpMonitoringTabProps {
  journeys: Journey[];
  enrollments: LegacyEnrollment[];
  flows: Flow[];
  monFilter: { status: string; flowId: string };
  tx: (key: string) => string;
  formatDate: (d: string) => string;
  onSetMonFilter: React.Dispatch<
    React.SetStateAction<{ status: string; flowId: string }>
  >;
  onCancelEnrollment: (id: string) => void;
}

export const LeadFollowUpMonitoringTab: React.FC<LeadFollowUpMonitoringTabProps> = ({
  journeys,
  enrollments,
  flows,
  monFilter,
  tx,
  formatDate,
  onSetMonFilter,
  onCancelEnrollment,
}) => {
  const filteredJourneys = journeys.filter(
    (j) => !monFilter.flowId || j.flowId === monFilter.flowId
  );
  const isEmpty = filteredJourneys.length === 0 && enrollments.length === 0;

  return (
    <WhatsAppSurfaceCard
      title={tx("tabs.monitoring")}
      action={
        <div className="flex gap-2">
          <Select
            value={monFilter.status || "ALL"}
            onValueChange={(v) =>
              onSetMonFilter((p) => ({
                ...p,
                status: v && v !== "ALL" ? v : "",
              }))
            }
          >
            <SelectTrigger className="h-8 min-w-[8rem] rounded-full text-xs">
              <SelectValue placeholder={tx("monitoring.allStatuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{tx("monitoring.allStatuses")}</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {tx(`monitoring.${s.toLowerCase()}`) || s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={monFilter.flowId || "ALL"}
            onValueChange={(v) =>
              onSetMonFilter((p) => ({
                ...p,
                flowId: v && v !== "ALL" ? v : "",
              }))
            }
          >
            <SelectTrigger className="h-8 min-w-[8rem] rounded-full text-xs">
              <SelectValue placeholder={tx("monitoring.allFlows")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{tx("monitoring.allFlows")}</SelectItem>
              {flows.map((f) => (
                <SelectItem key={f.id} value={f.id} className="text-xs">
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      {isEmpty ? (
        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <Users className="size-12 opacity-30" />
          <p className="text-xs font-medium">{tx("monitoring.empty")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/70 hover:bg-transparent">
                <TableHead className="text-xs font-medium text-muted-foreground">
                  {tx("monitoring.customer")}
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  {tx("monitoring.flow")}
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  {tx("monitoring.status")}
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  {tx("monitoring.currentStep")}
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  {tx("monitoring.nextMessage")}
                </TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJourneys.map((j) => {
                const cfg = statusCfg[j.status] ?? statusCfg.CANCELLED ?? { dot: "", bg: "" };
                const name = j.customer.firstName
                  ? `${j.customer.firstName} ${j.customer.lastName || ""}`
                  : j.customer.phone;
                const totalSteps = j.flow.steps?.length || 1;

                return (
                  <TableRow
                    key={j.id}
                    className="hover:bg-muted/20 border-b border-border/40 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-medium text-xs text-foreground">{name}</p>
                          {j.customer.phone && (
                            <p className="text-[10px] text-muted-foreground font-mono tabular-nums">
                              {j.customer.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{j.flow.name}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                          cfg.bg
                        )}
                      >
                        <span className={cn("mr-1.5 inline-block size-1.5 rounded-full", cfg.dot)} />
                        {tx(`monitoring.${j.status.toLowerCase()}`) || j.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono tabular-nums">
                      {tx("monitoring.step")
                        .replace("{{current}}", String(j.currentStep + 1))
                        .replace("{{total}}", String(totalSteps))}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono tabular-nums">
                      {formatDate(j.nextSendAt)}
                    </TableCell>
                    <TableCell className="text-right" />
                  </TableRow>
                );
              })}

              {enrollments.map((e) => {
                const cfg = statusCfg[e.status] ?? statusCfg.CANCELLED ?? { dot: "", bg: "" };
                const name = e.customer.firstName
                  ? `${e.customer.firstName} ${e.customer.lastName || ""}`
                  : e.whatsAppContact.name ||
                    e.whatsAppContact.pushName ||
                    e.whatsAppContact.phoneNumber;

                return (
                  <TableRow
                    key={e.id}
                    className="hover:bg-muted/20 border-b border-border/40 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-medium text-xs text-foreground">{name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono tabular-nums">
                            {e.whatsAppContact.phoneNumber}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">—</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                          cfg.bg
                        )}
                      >
                        <span className={cn("mr-1.5 inline-block size-1.5 rounded-full", cfg.dot)} />
                        {tx(`monitoring.${e.status.toLowerCase()}`) || e.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono tabular-nums">
                      {e.status === "ACTIVE" ? `${e.currentStep + 1}/${e.totalSteps}` : "-"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono tabular-nums">
                      {formatDate(e.nextSendAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {e.status === "ACTIVE" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 rounded-full border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-xs"
                          onClick={() => onCancelEnrollment(e.id)}
                        >
                          {tx("monitoring.cancel")}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </WhatsAppSurfaceCard>
  );
};
