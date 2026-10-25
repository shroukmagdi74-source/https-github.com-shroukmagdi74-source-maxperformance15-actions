import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { LeaveRequest } from "./types";

interface PendingLeavesCardProps {
  pendingLeaves?: LeaveRequest[];
  onAction: (id: string, action: "approve" | "reject") => void;
}

export const PendingLeavesCard: React.FC<PendingLeavesCardProps> = ({
  pendingLeaves = [],
  onAction,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50 dark:bg-gray-900/20 px-6 py-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Calendar className="h-5 w-5 text-amber-600" />
          </div>
          {t("hrDashboard.leavesRequests")}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-colors gap-2"
          onClick={() => navigate("/hr/leaves")}
        >
          {t("hrDashboard.viewAll")}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        {pendingLeaves.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-400 opacity-50" />
            </div>
            <p className="text-gray-500 font-medium">
              {t("hrDashboard.noPendingRequests")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingLeaves.map((leave) => (
              <div
                key={leave.id}
                className="group p-4 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12 ring-2 ring-gray-50 dark:ring-gray-600">
                    <AvatarImage src={leave.employee?.avatar} />
                    <AvatarFallback className="bg-amber-50 text-amber-600 text-sm font-bold uppercase">
                      {leave.employee?.firstName?.[0]}
                      {leave.employee?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">
                      {leave.employee?.firstName} {leave.employee?.lastName}
                    </p>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-tighter">
                      {leave.employee?.department?.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold gap-2 mb-4">
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      {leave.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-primary/5 text-primary px-3 py-1.5 rounded-lg font-mono tabular-nums">
                    <Clock className="h-3 w-3" />
                    <span>
                      {leave.totalDays} {t("common.days") || "أيام"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onAction(leave.id, "approve")}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 shadow-sm shadow-emerald-200 dark:shadow-none transition-all active:scale-95"
                  >
                    {t("hrDashboard.approve")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAction(leave.id, "reject")}
                    className="flex-1 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold h-9 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-95"
                  >
                    {t("hrDashboard.reject")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
