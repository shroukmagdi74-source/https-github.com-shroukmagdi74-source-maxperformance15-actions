import React from "react";
import { NavigateFunction } from "react-router-dom";
import { Loader2, History, Smartphone, Cloud } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapNode,
  ReEngagementLine,
  CustomerListState,
  TimelineStage,
  NodeDetail,
} from "./types";
import { fmt } from "./formatters";
import { LoyaltyNodeDetailSheet } from "./LoyaltyNodeDetailSheet";

interface LoyaltyModalsProps {
  pendingToggle: ReEngagementLine | null;
  setPendingToggle: (line: ReEngagementLine | null) => void;
  savingToggle: boolean;
  saveLoopToggle: (id: string, enabled: boolean) => Promise<void>;
  customerList: CustomerListState | null;
  setCustomerList: (state: CustomerListState | null) => void;
  backfillConfirm: boolean;
  setBackfillConfirm: (open: boolean) => void;
  backfillBusy: boolean;
  runBackfill: () => Promise<void>;
  systemAnalytics: any;
  channelDialog: boolean;
  setChannelDialog: (open: boolean) => void;
  channelDraft: string;
  setChannelDraft: (val: string) => void;
  saveChannel: () => Promise<void>;
  selectedNode: MapNode | null;
  setSelectedNode: (node: MapNode | null) => void;
  nodeDetails: Record<string, NodeDetail>;
  navigate: NavigateFunction;
  timelineLog: TimelineStage | null;
  setTimelineLog: (tl: TimelineStage | null) => void;
}

export const LoyaltyModals: React.FC<LoyaltyModalsProps> = ({
  pendingToggle,
  setPendingToggle,
  savingToggle,
  saveLoopToggle,
  customerList,
  setCustomerList,
  backfillConfirm,
  setBackfillConfirm,
  backfillBusy,
  runBackfill,
  systemAnalytics,
  channelDialog,
  setChannelDialog,
  channelDraft,
  setChannelDraft,
  saveChannel,
  selectedNode,
  setSelectedNode,
  nodeDetails,
  navigate,
  timelineLog,
  setTimelineLog,
}) => {
  return (
    <>
      <Dialog open={!!pendingToggle} onOpenChange={(o) => !o && setPendingToggle(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تفعيل حلقة إعادة استهداف</DialogTitle>
            <DialogDescription>
              مراجعة الرسالة وعدد المستهدفين قبل تفعيل الحلقة.
            </DialogDescription>
          </DialogHeader>
          {pendingToggle && (
            <div className="space-y-3 text-sm">
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                <p className="text-[10px] font-semibold uppercase text-gray-400">
                  الشرط
                </p>
                <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                  {pendingToggle.trigger}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                <p className="text-[10px] font-semibold uppercase text-gray-400">
                  الرسالة (قالب)
                </p>
                <p className="mt-1 text-gray-700 dark:text-gray-300">
                  {pendingToggle.message}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                <p className="text-[10px] font-semibold uppercase text-gray-400">
                  المستهدفون دلوقتي
                </p>
                <p className="mt-1 font-bold font-mono tabular-nums text-gray-900 dark:text-gray-100">
                  {pendingToggle.count === null ? "غير محدد" : fmt(pendingToggle.count)}
                </p>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                التفعيل بيخلّي الحلقة «مجدولة» — الرسالة هتتبعت من أداة {pendingToggle.tool}.
              </p>
            </div>
          )}
          <DialogFooter>
            <button
              onClick={() => setPendingToggle(null)}
              disabled={savingToggle}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              إلغاء
            </button>
            <button
              onClick={() => pendingToggle && void saveLoopToggle(pendingToggle.id, true)}
              disabled={savingToggle}
              className="inline-flex items-center gap-1 rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-700 disabled:opacity-50"
            >
              {savingToggle && <Loader2 className="h-4 w-4 animate-spin" />}
              تفعيل
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!customerList} onOpenChange={(o) => !o && setCustomerList(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{customerList?.title || "العملاء"}</DialogTitle>
            <DialogDescription>
              {customerList?.loading
                ? "جاري جلب العملاء..."
                : `${fmt(customerList?.rows.length || 0)} عميل معروض من القائمة المطابقة`}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-y-auto">
            {customerList?.loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              </div>
            ) : customerList?.rows.length ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {customerList.rows.map((row, i) => (
                  <div key={`${row.name}-${i}`} className="flex items-center justify-between gap-2 py-2 text-sm">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{row.name}</p>
                      <p className="text-xs text-gray-400 font-mono" dir="ltr">{row.phone}</p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{row.extra}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">لا يوجد عملاء مطابقين حالياً</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={backfillConfirm} onOpenChange={(o) => !o && setBackfillConfirm(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إصدار الكوبونات الناقصة</DialogTitle>
            <DialogDescription>
              هتتعمل معالجة Backfill: إصدار كوبون خصم تلقائي للأوردرات المسلّمة اللي اتسلمت قبل
              تفعيل النظام ومأخدتش كوبون (<span className="font-mono tabular-nums">{fmt(systemAnalytics?.preActivationCustomers ?? 0)}</span> عميل).
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            هذه عملية فعلية على بيانات الشركة — تأكد قبل التنفيذ.
          </div>
          <DialogFooter>
            <button
              onClick={() => setBackfillConfirm(false)}
              disabled={backfillBusy}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              إلغاء
            </button>
            <button
              onClick={() => void runBackfill()}
              disabled={backfillBusy}
              className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {backfillBusy && <Loader2 className="h-4 w-4 animate-spin" />}
              {backfillBusy ? "جاري الإصدار..." : "نعم، أصدر الكوبونات"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={channelDialog} onOpenChange={(o) => !o && setChannelDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>قناة عيد ميلاد العملاء</DialogTitle>
            <DialogDescription>
              حدد مصدر إرسال رسائل عيد الميلاد التلقائية.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "whatsapp_session", label: "واتساب عادي (Baileys)", icon: Smartphone },
              { value: "meta_api", label: "Meta Cloud API", icon: Cloud },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setChannelDraft(opt.value)}
                className={`flex items-center gap-2 rounded-lg border-2 p-3 text-sm font-medium ${
                  channelDraft === opt.value
                    ? "border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/20 dark:text-fuchsia-300"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <opt.icon className="h-4 w-4" />
                {opt.label}
              </button>
            ))}
          </div>
          <DialogFooter>
            <button
              onClick={() => setChannelDialog(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              إلغاء
            </button>
            <button
              onClick={() => void saveChannel()}
              className="rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-700"
            >
              حفظ القناة
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LoyaltyNodeDetailSheet
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        nodeDetails={nodeDetails}
        navigate={navigate}
      />

      <Dialog open={!!timelineLog} onOpenChange={(o) => !o && setTimelineLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-4 w-4 text-fuchsia-500" />
              سجل أحداث — {timelineLog?.label || ""}
            </DialogTitle>
            <DialogDescription>
              الأحداث المسجلة في هذه المرحلة من الداتا المتاحة.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] space-y-2 overflow-y-auto">
            {timelineLog?.events.length ? (
              timelineLog.events.map((ev, i) => (
                <div
                  key={`${ev.label}-${i}`}
                  className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-900/40"
                >
                  <span className="font-medium text-gray-800 dark:text-gray-200">{ev.label}</span>
                  {ev.date ? (
                    <span className="text-xs text-gray-500 font-mono" dir="ltr">{ev.date}</span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">
                لا توجد أحداث مسجلة في هذه المرحلة
              </p>
            )}
          </div>
          {timelineLog?.note && (
            <p className="text-xs text-gray-400">{timelineLog.note}</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
