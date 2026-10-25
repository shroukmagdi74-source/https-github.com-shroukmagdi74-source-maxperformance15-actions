import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { DollarSign, ChevronRight } from "lucide-react";
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
import { AdvanceRequest } from "./types";

interface PendingAdvancesCardProps {
  pendingAdvances?: AdvanceRequest[];
  onAction: (id: string, action: "approve" | "reject") => void;
}

export const PendingAdvancesCard: React.FC<PendingAdvancesCardProps> = ({
  pendingAdvances = [],
  onAction,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card className="border-none shadow-xl overflow-hidden bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-800 dark:to-emerald-900/10">
      <CardHeader className="flex flex-row items-center justify-between border-b border-emerald-100/20 dark:border-emerald-800/20 px-6 py-5">
        <CardTitle className="flex items-center gap-3 text-lg font-bold text-emerald-900 dark:text-emerald-100">
          <div className="p-2.5 bg-emerald-500 shadow-lg shadow-emerald-500/20 rounded-xl">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          {t("hrDashboard.pendingAdvances")}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100/50 transition-all rounded-lg"
          onClick={() => navigate("/hr/advances")}
        >
          <span className="hidden sm:inline">{t("hrDashboard.viewAll")}</span>
          <ChevronRight className="h-4 w-4 ms-1" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        {pendingAdvances.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-4 transform -rotate-12">
              <DollarSign className="h-8 w-8 text-emerald-200" />
            </div>
            <p className="text-gray-400 font-medium text-sm">
              {t("hrDashboard.noPendingAdvances")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingAdvances.map((adv) => (
              <div
                key={adv.id}
                className="group p-4 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-gray-50">
                      <AvatarImage src={adv.employee?.avatar} />
                      <AvatarFallback className="bg-emerald-50 text-emerald-600 font-bold">
                        {adv.employee?.firstName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">
                        {adv.employee?.firstName} {adv.employee?.lastName}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold font-mono tabular-nums">
                        {adv.createdAt
                          ? new Date(adv.createdAt).toLocaleDateString(
                              i18n.language === "ar" ? "ar-EG" : "en-US",
                            )
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-600 font-mono tabular-nums">
                      {adv.amount} {t("dashboard.egp")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onAction(adv.id, "approve")}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-bold"
                  >
                    {t("hrDashboard.approve")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAction(adv.id, "reject")}
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
