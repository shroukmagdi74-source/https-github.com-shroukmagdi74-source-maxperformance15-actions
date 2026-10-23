import React from "react";
import { ChevronRight, Clock, Trophy, UserCheck, Users, UserX } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeeStat } from "./types";

const itemSlide = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 24 },
  },
} as const;

const noMotion = {
  hidden: { opacity: 1 },
  show: { opacity: 1 },
} as const;

export interface EmployeeAnalyticsDetailTableProps {
  employees: EmployeeStat[];
  activeEmployeesCount: number;
  avgAssignedConv: number;
  reducedMotion?: boolean;
}

export const EmployeeAnalyticsDetailTable: React.FC<EmployeeAnalyticsDetailTableProps> = ({
  employees,
  activeEmployeesCount,
  avgAssignedConv,
  reducedMotion = false,
}) => {
  return (
    <motion.div
      variants={reducedMotion ? noMotion : itemSlide}
      className="relative overflow-hidden rounded-2xl border border-[color:var(--shell-control-border)] bg-[color:var(--color-card)]/80 shadow-sm backdrop-blur-xl sm:rounded-3xl"
    >
      <div className="flex items-center justify-between border-b border-[color:var(--shell-control-border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">جدول الأداء التفصيلي</h3>
            <p className="text-[11px] text-muted-foreground">إحصائيات لكل موظف</p>
          </div>
        </div>
        <Badge variant="outline" className="font-mono tabular-nums">
          <Users className="size-3.5" />
          {activeEmployeesCount} موظف
        </Badge>
      </div>

      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            لا توجد بيانات للموظفين في هذه الفترة
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">الموظف</TableHead>
                <TableHead className="text-center text-xs">معينة</TableHead>
                <TableHead className="text-center text-xs">رُدّ عليها</TableHead>
                <TableHead className="text-center text-xs">لم تُردّ</TableHead>
                <TableHead className="text-center text-xs">رسائل صادرة</TableHead>
                <TableHead className="text-center text-xs">نسبة الرد</TableHead>
                <TableHead className="text-center text-xs">متوسط الرد</TableHead>
                <TableHead className="text-center text-xs">الأداء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp, idx) => {
                const perfScore =
                  emp.responseRate * 0.7 +
                  Math.min(
                    100,
                    (emp.assignedConversations / Math.max(1, avgAssignedConv)) *
                      100,
                  ) *
                    0.3;
                const perfColor =
                  perfScore >= 70
                    ? "text-[color:var(--color-success)]"
                    : perfScore >= 40
                      ? "text-amber-500"
                      : "text-[color:var(--color-destructive)]";
                return (
                  <motion.tr
                    key={emp.userId}
                    initial={
                      reducedMotion ? { opacity: 1 } : { opacity: 0, x: -10 }
                    }
                    animate={{ opacity: 1, x: 0 }}
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : {
                            delay: idx * 0.04,
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                          }
                    }
                    className="group"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 text-sm font-semibold text-primary">
                            {emp.userName?.charAt(0) || "?"}
                          </div>
                          {idx === 0 && (
                            <div className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-amber-500 shadow-sm">
                              <Trophy className="size-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{emp.userName}</p>
                          {emp.userEmail && (
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {emp.userEmail}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-mono tabular-nums">
                        {emp.assignedConversations}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-success/15 font-mono tabular-nums text-[color:var(--color-success)]">
                        <UserCheck className="size-3" />
                        {emp.repliedConversations}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {emp.unrepliedConversations > 0 ? (
                        <Badge className="bg-destructive/15 font-mono tabular-nums text-[color:var(--color-destructive)]">
                          <UserX className="size-3" />
                          {emp.unrepliedConversations}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground font-mono tabular-nums">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-medium font-mono tabular-nums">
                        {emp.outgoingMessages}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${
                              emp.responseRate >= 70
                                ? "bg-success"
                                : emp.responseRate >= 40
                                  ? "bg-amber-500"
                                  : "bg-destructive"
                            }`}
                            style={{
                              width: `${Math.min(100, emp.responseRate)}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium font-mono tabular-nums ${perfColor}`}
                        >
                          {emp.responseRate}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {emp.avgResponseTimeMin != null ? (
                        <span className="flex items-center justify-center gap-1 text-sm font-mono tabular-nums">
                          <Clock className="size-3 text-muted-foreground" />
                          {emp.avgResponseTimeMin} د
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className={`text-sm font-bold font-mono tabular-nums ${perfColor}`}>
                          {Math.round(perfScore)}
                        </span>
                        <ChevronRight className="size-3 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </motion.div>
  );
};
