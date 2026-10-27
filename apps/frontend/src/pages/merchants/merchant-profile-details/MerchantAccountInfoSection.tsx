import React from "react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import {
  Badge,
  formatDate,
  InfoRow,
  MerchantRecord,
  MerchantUser,
  statusTone,
} from "./types";

interface MerchantAccountInfoSectionProps {
  merchant: MerchantRecord;
  user?: MerchantUser | null;
}

export const MerchantAccountInfoSection: React.FC<MerchantAccountInfoSectionProps> = ({
  merchant,
  user,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <UserCircleIcon className="h-5 w-5 text-slate-500" />
        <h2 className="text-lg font-bold">بيانات الحساب</h2>
      </div>
      <div className="mt-4">
        <InfoRow label="اسم التاجر" value={merchant.name} />
        <InfoRow label="البريد" value={merchant.email} />
        <InfoRow label="الهاتف" value={merchant.phone} />
        <InfoRow label="العنوان" value={merchant.address} />
        <InfoRow
          label="حساب الدخول"
          value={
            user ? (
              <Badge
                label={user.isActive ? "نشط" : "غير نشط"}
                tone={statusTone(user.isActive ? "ACTIVE" : "INACTIVE")}
              />
            ) : (
              "غير مربوط بمستخدم"
            )
          }
        />
        <InfoRow
          label="آخر دخول"
          value={user ? formatDate(user.lastLoginAt) : "غير محدد"}
        />
      </div>
    </section>
  );
};
