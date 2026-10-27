import React from "react";
import { Loader2, CheckCircle2, UserPlus } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { ResponsiveOverlay, FormField } from "./ResponsiveOverlay";
import { FollowUpHistoryList } from "./FollowUpHistoryList";
import { FollowUpAutomationCard } from "./FollowUpAutomationCard";
import { formatDateTime, getDefaultFollowUpScheduleValue, addHoursToDateTimeLocal } from "../utils";
import { FOLLOW_UP_STATUS_OPTIONS, CALL_STATUS_OPTIONS } from "../constants";
import type { Company, FollowUpFormData, FollowUpState, FollowUpReminder, FollowUpAutomation } from "../types";

interface FollowUpModalProps {
  isOpen: boolean;
  isMobile: boolean;
  company: Company | null;
  followUp: FollowUpState | null;
  reminder: FollowUpReminder | null;
  automation: FollowUpAutomation | null;
  owners: { id: string; firstName: string; lastName: string; role: string }[];
  loadingOwners: boolean;
  form: FollowUpFormData;
  saving: boolean;
  currentAdminId: string | null;
  onClose: () => void;
  onChangeForm: React.Dispatch<React.SetStateAction<FollowUpFormData>>;
  onSave: () => void;
  onLogReminder: () => void;
  onLogEscalation: () => void;
  onAssignSelf: () => void;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  isMobile,
  company,
  followUp,
  reminder,
  automation,
  owners,
  loadingOwners,
  form,
  saving,
  currentAdminId,
  onClose,
  onChangeForm,
  onSave,
  onLogReminder,
  onLogEscalation,
  onAssignSelf,
}) => {
  return (
    <ResponsiveOverlay
      mobile={isMobile}
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      title={`متابعة ${company?.name || "الشركة"}`}
      description="عيّن مسؤولًا للحالة وسجل آخر متابعة."
      bodyClassName="space-y-4"
    >
      {company && followUp ? (
        <div className="space-y-6">
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">
                الحالة الحالية
              </p>
              <Badge
                variant="outline"
                className={cn("mt-2 px-2.5 py-1 text-xs font-black", followUp.statusMeta.className)}
              >
                {followUp.statusMeta.label}
              </Badge>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">
                المسؤول الحالي
              </p>
              <p className="mt-1.5 text-sm font-black text-foreground">
                {followUp.assignedOwner.label || "بدون مسؤول"}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">
                آخر تحديث
              </p>
              <p className="mt-1.5 text-xs font-bold text-foreground/80">
                {formatDateTime(followUp.updatedAt)}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">
                المتابعة القادمة
              </p>
              <Badge
                variant="outline"
                className={cn("mt-2 px-2.5 py-1 text-xs font-black", reminder?.badgeClassName)}
              >
                {reminder?.nextActionLabel || "لا يوجد موعد"}
              </Badge>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">
                الأتمتة الحالية
              </p>
              <Badge
                variant="outline"
                className={cn("mt-2 px-2.5 py-1 text-xs font-black", automation?.badgeClassName)}
              >
                {automation?.label || "لا توجد أتمتة"}
              </Badge>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FormField label="مسؤول المتابعة">
              <div className="space-y-3">
                <Select
                  value={form.assignedOwnerId || "__none"}
                  onValueChange={(value) =>
                    onChangeForm((prev) => ({
                      ...prev,
                      assignedOwnerId: value === "__none" ? "" : value,
                      status:
                        value === "__none"
                          ? "pending"
                          : prev.status === "unassigned"
                          ? "pending"
                          : prev.status,
                      nextActionAt:
                        value === "__none"
                          ? ""
                          : prev.nextActionAt || getDefaultFollowUpScheduleValue(prev.status),
                    }))
                  }
                >
                  <SelectTrigger
                    aria-label="مسؤول المتابعة"
                    className="h-12 w-full rounded-lg border-border/60 bg-background px-4 text-sm font-bold shadow-sm"
                  >
                    <SelectValue placeholder="بدون مسؤول" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="__none">بدون مسؤول</SelectItem>
                    {owners.length ? (
                      owners.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.firstName} {o.lastName} - {o.role}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__empty" disabled>
                        {loadingOwners ? "جاري التحميل..." : "لا يوجد أعضاء"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {currentAdminId ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg border-primary/20 px-4 text-xs font-black text-primary hover:bg-primary/5"
                    onClick={onAssignSelf}
                  >
                    <UserPlus className="ml-1.5 size-3" /> اسندها لي
                  </Button>
                ) : null}
              </div>
            </FormField>

            <FormField label="حالة المتابعة">
              <Select
                value={form.assignedOwnerId ? form.status : "unassigned"}
                onValueChange={(value) =>
                  onChangeForm((prev) => ({
                    ...prev,
                    status: value,
                    nextActionAt:
                      value === "resolved"
                        ? ""
                        : prev.nextActionAt || getDefaultFollowUpScheduleValue(value),
                  }))
                }
                disabled={!form.assignedOwnerId}
              >
                <SelectTrigger
                  aria-label="حالة المتابعة"
                  className="h-12 w-full rounded-lg border-border/60 bg-background px-4 text-sm font-bold shadow-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {!form.assignedOwnerId ? (
                    <SelectItem value="unassigned">بدون مسؤول</SelectItem>
                  ) : (
                    FOLLOW_UP_STATUS_OPTIONS.filter((o) => o.value !== "unassigned").map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FormField label="حالة الاتصال الهاتفي">
              <Select
                value={form.callStatus || "not_called"}
                onValueChange={(v) => onChangeForm((prev) => ({ ...prev, callStatus: v }))}
              >
                <SelectTrigger
                  aria-label="حالة الاتصال الهاتفي"
                  className="h-12 w-full rounded-lg border-border/60 bg-background px-4 text-sm font-bold shadow-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {CALL_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="مدة المكالمة (ثانية)">
              <input
                aria-label="مدة المكالمة بالثواني"
                type="number"
                min="0"
                className="h-12 w-full rounded-lg border-border/60 bg-background px-5 text-sm font-bold shadow-sm transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                value={form.callDuration}
                onChange={(e) => onChangeForm((prev) => ({ ...prev, callDuration: e.target.value }))}
                placeholder="0"
              />
            </FormField>
          </div>

          <FormField label="ملاحظة المتابعة">
            <textarea
              aria-label="ملاحظة المتابعة"
              className="min-h-[140px] w-full rounded-lg border-border/60 bg-background p-5 text-sm font-medium shadow-sm transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
              value={form.note}
              onChange={(e) => onChangeForm((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="أدخل ملاحظاتك هنا... مثال: تواصلنا مع العميل وسيضيف أول منتج اليوم."
            />
          </FormField>

          <FormField label="موعد المتابعة القادم">
            <div className="space-y-4">
              <input
                aria-label="موعد المتابعة القادم"
                type="datetime-local"
                className="h-12 w-full rounded-lg border-border/60 bg-background px-4 text-sm font-bold shadow-sm transition-all disabled:opacity-50 focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                value={form.nextActionAt}
                onChange={(e) => onChangeForm((prev) => ({ ...prev, nextActionAt: e.target.value }))}
                disabled={!form.assignedOwnerId || form.status === "resolved"}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-lg border-border/60 text-xs font-black hover:bg-muted"
                  disabled={!form.assignedOwnerId}
                  onClick={() =>
                    onChangeForm((prev) => ({
                      ...prev,
                      nextActionAt: addHoursToDateTimeLocal(24),
                    }))
                  }
                >
                  بعد 24 ساعة
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-lg border-border/60 text-xs font-black hover:bg-muted"
                  disabled={!form.assignedOwnerId}
                  onClick={() =>
                    onChangeForm((prev) => ({
                      ...prev,
                      nextActionAt: addHoursToDateTimeLocal(72),
                    }))
                  }
                >
                  بعد 72 ساعة
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-lg border-border/60 text-xs font-black text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                  disabled={!form.nextActionAt}
                  onClick={() => onChangeForm((prev) => ({ ...prev, nextActionAt: "" }))}
                >
                  مسح الموعد
                </Button>
              </div>
            </div>
          </FormField>

          <FollowUpAutomationCard
            followUp={followUp}
            automation={automation}
            saving={saving}
            onLogReminder={onLogReminder}
            onLogEscalation={onLogEscalation}
          />

          <FollowUpHistoryList history={followUp.history} />

          <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
            <Button
              type="button"
              className="h-11 rounded-lg px-8 text-sm font-black shadow-sm shadow-primary/20"
              onClick={onSave}
              disabled={saving}
            >
              {saving ? <Loader2 className="ml-2 size-4 animate-spin" /> : <CheckCircle2 className="ml-2 size-4" />}
              حفظ التغييرات
            </Button>
          </div>
        </div>
      ) : null}
    </ResponsiveOverlay>
  );
};
