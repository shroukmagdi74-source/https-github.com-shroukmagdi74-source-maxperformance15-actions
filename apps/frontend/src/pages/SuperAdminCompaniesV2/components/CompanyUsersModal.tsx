import React from "react";
import { Users } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { ResponsiveOverlay } from "./ResponsiveOverlay";
import { useCompanyUsers } from "../hooks/useCompanies";
import type { Company } from "../types";

interface CompanyUsersModalProps {
  isOpen: boolean;
  isMobile: boolean;
  company: Company | null;
  onClose: () => void;
}

export function CompanyUsersList({ companyId }: { companyId: string }) {
  const { data: users, isLoading } = useCompanyUsers(companyId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!users?.length) {
    return (
      <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-16 text-center text-sm font-black text-muted-foreground/60">
        لا يوجد أعضاء في هذه الشركة حالياً.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div
          key={user.id}
          className="rounded-lg border border-border/60 bg-white p-5 shadow-sm dark:bg-card"
        >
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/8 text-primary shadow-inner">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-base font-black text-foreground">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[13px] font-bold text-muted-foreground/80">{user.email}</p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "rounded-full border-primary/20 bg-primary/5 px-3 py-1 text-xs font-black text-primary"
              )}
            >
              {user.role === "OWNER"
                ? "مالك الشركة"
                : user.role === "COMPANY_ADMIN"
                ? "مدير شركة"
                : user.role === "MANAGER"
                ? "مدير قسم"
                : "موظف"}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

export const CompanyUsersModal: React.FC<CompanyUsersModalProps> = ({
  isOpen,
  isMobile,
  company,
  onClose,
}) => {
  return (
    <ResponsiveOverlay
      mobile={isMobile}
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      title={`أعضاء ${company?.name || ""}`}
      bodyClassName="space-y-3"
      footer={
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-2xl"
          onClick={onClose}
        >
          إغلاق
        </Button>
      }
    >
      {company ? <CompanyUsersList companyId={company.id} /> : null}
    </ResponsiveOverlay>
  );
};
