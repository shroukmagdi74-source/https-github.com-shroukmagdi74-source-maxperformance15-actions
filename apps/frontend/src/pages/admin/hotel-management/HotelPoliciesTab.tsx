import React from "react";
import { Clock, Shield, Users, Pencil } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { HotelPolicy } from "../hotel/shared";
import { HotelModalState } from "./types";

interface HotelPoliciesTabProps {
  policies: HotelPolicy | null;
  setModal: (modal: HotelModalState | null) => void;
}

export const HotelPoliciesTab: React.FC<HotelPoliciesTabProps> = ({
  policies,
  setModal,
}) => {
  return (
    <div className="max-w-2xl space-y-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-muted-foreground">
          سياسات الإلغاء والدخول والإقامة
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setModal({ type: "policy", data: policies })}
          className="h-8 text-xs gap-1.5"
        >
          <Pencil className="size-3" />
          <span>تعديل السياسات</span>
        </Button>
      </div>

      {!policies ? (
        <p className="text-xs text-muted-foreground">لا توجد سياسات مسجلة</p>
      ) : (
        <div className="space-y-3 text-xs">
          <div className="border border-border/70 rounded-xl p-3.5 bg-muted/10 space-y-2">
            <h3 className="font-semibold text-foreground flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" />
              <span>أوقات الدخول والخروج</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground font-mono">
              <span>تسجيل الوصول: {policies.checkInTime || "14:00"}</span>
              <span>تسجيل المغادرة: {policies.checkOutTime || "12:00"}</span>
              {policies.earlyCheckInFee > 0 && (
                <span>
                  رسوم الدخول المبكر:{" "}
                  <span className="tabular-nums">{policies.earlyCheckInFee}</span>{" "}
                  ج.م
                </span>
              )}
              {policies.lateCheckOutFee > 0 && (
                <span>
                  رسوم المغادرة المتأخرة:{" "}
                  <span className="tabular-nums">{policies.lateCheckOutFee}</span>{" "}
                  ج.م
                </span>
              )}
            </div>
          </div>

          <div className="border border-border/70 rounded-xl p-3.5 bg-muted/10 space-y-2">
            <h3 className="font-semibold text-foreground flex items-center gap-1.5">
              <Shield className="size-3.5 text-primary" />
              <span>سياسة الإلغاء</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              إلغاء مجاني قبل{" "}
              <span className="tabular-nums font-semibold">
                {policies.cancelFreeBefore}
              </span>{" "}
              أيام من تاريخ الوصول. بعد ذلك يتم خصم{" "}
              <span className="tabular-nums font-semibold">
                {policies.cancelPenaltyPct}%
              </span>{" "}
              من قيمة الحجز.
            </p>
          </div>

          <div className="border border-border/70 rounded-xl p-3.5 bg-muted/10 space-y-2">
            <h3 className="font-semibold text-foreground flex items-center gap-1.5">
              <Users className="size-3.5 text-primary" />
              <span>سياسة الأطفال والنزلاء</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {policies.childrenAllowed
                ? "مسموح بوجود أطفال"
                : "غير مسموح بوجود أطفال"}
              {policies.extraBedPrice > 0 &&
                ` | سرير إضافي: ${policies.extraBedPrice} ج.م`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
