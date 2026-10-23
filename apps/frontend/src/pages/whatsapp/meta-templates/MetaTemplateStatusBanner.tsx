import React from "react";
import { Clock, RefreshCw, XCircle } from "lucide-react";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface MetaTemplateStatusBannerProps {
  statusCounts: {
    approved: number;
    pending: number;
    rejected: number;
    disabled: number;
    paused: number;
    total: number;
  };
  loading: boolean;
  onRefresh: () => void;
}

export const MetaTemplateStatusBanner: React.FC<MetaTemplateStatusBannerProps> = ({
  statusCounts,
  loading,
  onRefresh,
}) => {
  if (
    loading ||
    statusCounts.total === 0 ||
    (statusCounts.rejected === 0 && statusCounts.pending === 0)
  ) {
    return null;
  }

  const isRejected = statusCounts.rejected > 0;

  return (
    <Alert
      className={
        isRejected
          ? "border-red-300/70 bg-red-500/[0.06] text-red-800 dark:border-red-500/30 dark:bg-red-500/[0.06] dark:text-red-200"
          : "border-amber-300/70 bg-amber-500/[0.06] text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/[0.06] dark:text-amber-200"
      }
    >
      {isRejected ? (
        <XCircle className="size-4 shrink-0" aria-hidden="true" />
      ) : (
        <Clock className="size-4 shrink-0" aria-hidden="true" />
      )}
      <AlertTitle className="text-sm font-semibold">
        {isRejected
          ? `${statusCounts.rejected} قالب${statusCounts.rejected === 1 ? "" : "ات"} مرفوض${statusCounts.rejected === 1 ? "" : "ة"} من Meta — يحتاج تعديل`
          : `${statusCounts.pending} قالب${statusCounts.pending === 1 ? "" : "ات"} في انتظار موافقة Meta`}
      </AlertTitle>
      <AlertDescription className="text-xs leading-relaxed">
        {isRejected
          ? "افتح القالب لقراءة سبب الرفض، عدّل المحتوى، ثم أعد إرساله للمراجعة."
          : "عادةً تتم الموافقة خلال بضع دقائق إلى 24 ساعة."}
        {statusCounts.approved > 0 ? (
          <>
            {" · "}
            <span className="font-medium tabular-nums font-mono text-emerald-700 dark:text-emerald-300">
              {statusCounts.approved} معتمدة
            </span>
          </>
        ) : null}
      </AlertDescription>
      <AlertAction>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-8 rounded-full"
        >
          <RefreshCw
            className={`size-3.5 ${loading ? "animate-spin" : ""}`}
          />
          تحقق الآن
        </Button>
      </AlertAction>
    </Alert>
  );
};
