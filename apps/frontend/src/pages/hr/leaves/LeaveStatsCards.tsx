import React from "react";
import { Clock, Check, X, Calendar } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { LeaveRequest } from "./types";

interface LeaveStatsCardsProps {
  t: (key: string) => string;
  requests: LeaveRequest[];
  pendingCount: number;
}

export const LeaveStatsCards: React.FC<LeaveStatsCardsProps> = ({
  t,
  requests,
  pendingCount,
}) => {
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = requests.filter((r) => r.status === "REJECTED").length;
  const totalDays = requests
    .filter((r) => r.status === "APPROVED")
    .reduce((sum, r) => sum + r.totalDays, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">{t("employee.leaves.pending")}</p>
              <h3 className="text-3xl font-bold mt-1 font-mono tabular-nums">{pendingCount}</h3>
            </div>
            <Clock className="h-10 w-10 opacity-80" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">{t("employee.leaves.approved")}</p>
              <h3 className="text-3xl font-bold mt-1 text-green-600 font-mono tabular-nums">
                {approvedCount}
              </h3>
            </div>
            <Check className="h-10 w-10 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">{t("employee.leaves.rejected")}</p>
              <h3 className="text-3xl font-bold mt-1 text-red-600 font-mono tabular-nums">
                {rejectedCount}
              </h3>
            </div>
            <X className="h-10 w-10 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">{t("employee.leaves.totalDays")}</p>
              <h3 className="text-3xl font-bold mt-1 text-blue-600 font-mono tabular-nums">
                {totalDays}
              </h3>
            </div>
            <Calendar className="h-10 w-10 text-blue-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
