import React from "react";
import { AlertTriangle, ArrowLeftRight, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { ResponsiveOverlay, FormField } from "./ResponsiveOverlay";
import { useCompanyUsers } from "../hooks/useCompanies";
import type { Company } from "../types";

interface CompanyTransferOwnershipModalProps {
  isOpen: boolean;
  isMobile: boolean;
  company: Company | null;
  targetUserId: string;
  transferring: boolean;
  onClose: () => void;
  onChangeTarget: (userId: string) => void;
  onConfirm: () => void;
}

export function CompanyUsersOptions({ companyId }: { companyId: string }) {
  const { data: users, isLoading } = useCompanyUsers(companyId);
  if (isLoading) return <SelectItem value="" disabled>جاري التحميل...</SelectItem>;
  if (!users?.length) return <SelectItem value="" disabled>لا يوجد أعضاء</SelectItem>;
  return users.map((user) => (
    <SelectItem key={user.id} value={user.id}>
      {user.firstName} {user.lastName} -{" "}
      {user.role === "OWNER"
        ? "مالك"
        : user.role === "COMPANY_ADMIN"
        ? "مدير شركة"
        : user.role === "MANAGER"
        ? "مدير"
        : "موظف"}
    </SelectItem>
  ));
}

export const CompanyTransferOwnershipModal: React.FC<CompanyTransferOwnershipModalProps> = ({
  isOpen,
  isMobile,
  company,
  targetUserId,
  transferring,
  onClose,
  onChangeTarget,
  onConfirm,
}) => {
  return (
    <ResponsiveOverlay
      mobile={isMobile}
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      title={`نقل ملكية ${company?.name || ""}`}
      description="سيتم تحويل المالك الحالي إلى مدير شركة."
      bodyClassName="space-y-4"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-2xl"
            onClick={onClose}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            className="h-11 rounded-2xl"
            onClick={onConfirm}
            disabled={transferring || !targetUserId}
          >
            {transferring ? (
              <Loader2 className="size-4 animate-spin ml-2" />
            ) : (
              <ArrowLeftRight className="size-4 ml-2" />
            )}
            تأكيد النقل
          </Button>
        </>
      }
    >
      <Alert className="rounded-lg border-amber-200/60 bg-amber-50/50 p-4 text-amber-900 shadow-sm dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-100">
        <AlertTriangle className="size-4" />
        <AlertTitle className="text-sm font-black">إجراء حساس للغاية</AlertTitle>
        <AlertDescription className="text-xs font-medium opacity-80">
          سيتم نقل جميع صلاحيات الملكية إلى المستخدم المختار. المالك الحالي سيصبح مديراً للشركة.
        </AlertDescription>
      </Alert>
      <FormField label="اختيار المالك الجديد" required>
        <Select value={targetUserId} onValueChange={onChangeTarget}>
          <SelectTrigger
            aria-label="اختيار المالك الجديد"
            className="h-12 w-full rounded-lg border-border/60 bg-background px-5 text-sm font-black shadow-sm"
          >
            <SelectValue placeholder="-- اختر المستخدم من القائمة --" />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            <SelectItem value="">-- اختر المستخدم من القائمة --</SelectItem>
            {company ? <CompanyUsersOptions companyId={company.id} /> : null}
          </SelectContent>
        </Select>
      </FormField>
    </ResponsiveOverlay>
  );
};
