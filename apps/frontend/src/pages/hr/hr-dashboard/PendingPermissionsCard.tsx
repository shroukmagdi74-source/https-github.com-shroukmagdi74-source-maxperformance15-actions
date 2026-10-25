import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Clock, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { PermissionRequest } from "./types";

interface PendingPermissionsCardProps {
  pendingPermissions?: PermissionRequest[];
  onAction: (id: string, action: "approve" | "reject") => void;
}

export const PendingPermissionsCard: React.FC<PendingPermissionsCardProps> = ({
  pendingPermissions = [],
  onAction,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card className="border-none shadow-xl overflow-hidden bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10">
      <CardHeader className="flex flex-row items-center justify-between border-b border-blue-100/20 dark:border-blue-800/20 px-6 py-5">
        <CardTitle className="flex items-center gap-3 text-lg font-bold text-blue-900 dark:text-blue-100">
          <div className="p-2.5 bg-blue-500 shadow-lg shadow-blue-500/20 rounded-xl">
            <Clock className="h-5 w-5 text-white" />
          </div>
          {t("hrDashboard.pendingPermissions")}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-100/50 transition-all rounded-lg"
          onClick={() => navigate("/hr/permissions")}
        >
          <span className="hidden sm:inline">{t("hrDashboard.viewAll")}</span>
          <ChevronRight className="h-4 w-4 ms-1" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        {pendingPermissions.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4 transform rotate-12">
              <Clock className="h-8 w-8 text-blue-200" />
            </div>
            <p className="text-gray-400 font-medium text-sm">
              {t("hrDashboard.noPendingPermissions")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPermissions.map((perm) => (
              <div
                key={perm.id}
                className="group p-4 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-gray-50">
                      <AvatarImage src={perm.employee?.avatar} />
                      <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                        {perm.employee?.firstName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">
                        {perm.employee?.firstName} {perm.employee?.lastName}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">
                        {perm.type}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 text-[10px] font-bold font-mono tabular-nums"
                  >
                    {perm.duration} {t("dashboard.minutes")}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onAction(perm.id, "approve")}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-bold"
                  >
                    {t("hrDashboard.approve")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAction(perm.id, "reject")}
                    className="flex-1 h-8 text-xs font-bold border-gray-200 dark:border-gray-600"
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
