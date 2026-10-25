import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { FileText, CheckCircle, Edit, XCircle } from "lucide-react";
import { AuditStats } from "./types";

interface AuditLogsStatsProps {
  stats: AuditStats | null;
}

export const AuditLogsStats: React.FC<AuditLogsStatsProps> = ({ stats }) => {
  if (!stats) return null;

  const createCount =
    stats.actionStats.find((s) => s.action === "CREATE")?.count || 0;
  const updateCount =
    stats.actionStats.find((s) => s.action === "UPDATE")?.count || 0;
  const deleteCount =
    stats.actionStats.find((s) => s.action === "DELETE")?.count || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">إجمالي السجلات</p>
            <h3 className="text-2xl font-bold font-mono tabular-nums">
              {stats.totalLogs}
            </h3>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">عمليات الإنشاء</p>
            <h3 className="text-2xl font-bold font-mono tabular-nums">
              {createCount}
            </h3>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
            <Edit className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">عمليات التحديث</p>
            <h3 className="text-2xl font-bold font-mono tabular-nums">
              {updateCount}
            </h3>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">عمليات الحذف</p>
            <h3 className="text-2xl font-bold font-mono tabular-nums">
              {deleteCount}
            </h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
