import React from "react";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LookupResponse } from "./types";

interface EmployeeSmartDetectionCardProps {
  lookupResult: LookupResponse;
  onViewProfile: (userId: string) => void;
}

export const EmployeeSmartDetectionCard: React.FC<
  EmployeeSmartDetectionCardProps
> = ({ lookupResult, onViewProfile }) => {
  const { t } = useTranslation();
  const user = lookupResult.user;

  if (!lookupResult.exists || !user) return null;

  return (
    <div className="col-span-2 p-3.5 rounded-xl border transition-all duration-200 bg-muted/20 border-border/70">
      {lookupResult.status === "ALREADY_ACTIVE_EMPLOYEE" && (
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-amber-200 dark:border-amber-800">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-amber-100 text-amber-800 text-xs font-semibold">
                  {user.firstName?.[0] || "EMP"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm text-foreground flex items-center gap-2">
                  <span>
                    {user.firstName} {user.lastName}
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 text-[11px] py-0 px-1.5"
                  >
                    {t("employees.accountAlreadyEmployee")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("employees.accountAlreadyEmployeeDesc", {
                    employeeNumber: user.employeeNumber,
                  })}
                  {user.department ? ` • ${user.department}` : ""}
                  {user.position ? ` • ${user.position}` : ""}
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-xs h-8 shrink-0 gap-1.5"
              onClick={() => {
                if (user.id) {
                  onViewProfile(user.id);
                }
              }}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t("employees.viewEmployeeProfile")}
            </Button>
          </div>
        </div>
      )}

      {lookupResult.status === "COMPANY_USER_NOT_EMPLOYEE" && (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-blue-200 dark:border-blue-800">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-blue-100 text-blue-800 text-xs font-semibold">
              {user.firstName?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-foreground flex items-center gap-2">
              <span className="truncate">
                {user.firstName} {user.lastName}
              </span>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 text-[11px] py-0 px-1.5 shrink-0"
              >
                {t("employees.accountCompanyMember")}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {user.email} {user.phone ? `• ${user.phone}` : ""}
            </p>
          </div>
        </div>
      )}

      {lookupResult.status === "EXISTING_PLATFORM_USER" && (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-emerald-200 dark:border-emerald-800">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs font-semibold">
              {user.firstName?.[0] || "M"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-foreground flex items-center gap-2">
              <span className="truncate">
                {user.firstName} {user.lastName}
              </span>
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 text-[11px] py-0 px-1.5 shrink-0"
              >
                {t("employees.accountVerifiedPlatform")}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {user.email} {user.phone ? `• ${user.phone}` : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
