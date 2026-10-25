import React from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AutoCloseSummary, AutoCloseReviewStatus } from "./types";

interface AttendanceAutoCloseBannerProps {
  autoCloseSummary: AutoCloseSummary;
  autoClosedOnly: boolean;
  setAutoClosedOnly: (val: boolean) => void;
  setAutoCloseReviewStatus: (val: "ALL" | AutoCloseReviewStatus) => void;
  setPagination: React.Dispatch<React.SetStateAction<any>>;
}

export const AttendanceAutoCloseBanner: React.FC<AttendanceAutoCloseBannerProps> = ({
  autoCloseSummary,
  autoClosedOnly,
  setAutoClosedOnly,
  setAutoCloseReviewStatus,
  setPagination,
}) => {
  return (
    <Card className="border-amber-100 bg-gradient-to-l from-amber-50 via-white to-white dark:from-amber-950/20 dark:via-gray-800 dark:to-gray-800 dark:border-amber-900/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          مراجعة الإغلاق التلقائي
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "إجمالي مغلق تلقائيًا", value: autoCloseSummary.total, accent: "text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300" },
            { label: "بانتظار المراجعة", value: autoCloseSummary.pending, accent: "text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300" },
            { label: "تمت المراجعة", value: autoCloseSummary.reviewed, accent: "text-sky-700 bg-sky-100 dark:bg-sky-900/30 dark:text-sky-300" },
            { label: "تم التعديل", value: autoCloseSummary.adjusted, accent: "text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300" },
            { label: "اعتماد كما هو", value: autoCloseSummary.dismissed, accent: "text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
              <div className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${item.accent}`}>
                {item.label}
              </div>
              <div className="mt-3 text-3xl font-black text-gray-900 dark:text-white font-mono tabular-nums">
                {item.value || 0}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={autoClosedOnly ? "default" : "outline"}
            onClick={() => {
              setAutoClosedOnly(true);
              setPagination((p: any) => ({ ...p, page: 1 }));
            }}
            className={autoClosedOnly ? "bg-amber-600 hover:bg-amber-700" : ""}
          >
            السجلات المغلقة تلقائيًا
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setAutoClosedOnly(true);
              setAutoCloseReviewStatus("PENDING");
              setPagination((p: any) => ({ ...p, page: 1 }));
            }}
          >
            السجلات المنتظرة
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setAutoClosedOnly(false);
              setAutoCloseReviewStatus("ALL");
              setPagination((p: any) => ({ ...p, page: 1 }));
            }}
          >
            عرض كل السجلات
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
