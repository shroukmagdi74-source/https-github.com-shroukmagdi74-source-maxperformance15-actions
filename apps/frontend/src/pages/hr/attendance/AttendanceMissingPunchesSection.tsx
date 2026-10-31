import React, { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Laptop,
  Clock,
  User,
  ShieldAlert,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export interface MissingPunchAttempt {
  id: string;
  userId: string;
  userName: string;
  employeeCode?: string | null;
  attendanceDate: string;
  attemptedAt: string;
  action: "CHECK_IN" | "CHECK_OUT";
  result: string;
  reason?: string | null;
  deviceType?: string | null;
  clientIp?: string | null;
  method?: string | null;
  branchIpMatch?: boolean;
  hasAttendanceRecord?: boolean;
  attendanceId?: string | null;
}

export interface MissingPunchesSummary {
  totalMissingPunches: number;
  totalAffectedEmployees: number;
  byEmployee: Array<{
    userId: string;
    userName: string;
    employeeCode?: string | null;
    count: number;
    latestAttemptAt: string;
  }>;
}

interface AttendanceMissingPunchesSectionProps {
  onResolveSuccess?: () => void;
}

export const AttendanceMissingPunchesSection: React.FC<AttendanceMissingPunchesSectionProps> = ({
  onResolveSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [checkingDaily, setCheckingDaily] = useState(false);
  const [summary, setSummary] = useState<MissingPunchesSummary | null>(null);
  const [attempts, setAttempts] = useState<MissingPunchAttempt[]>([]);
  const [activeAttempt, setActiveAttempt] = useState<MissingPunchAttempt | null>(null);
  const [resolveNotes, setResolveNotes] = useState("");
  const [submittingResolve, setSubmittingResolve] = useState(false);

  const fetchMissingReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/hr/attendance/missing-punches");
      if (res.data?.success) {
        setSummary(res.data.summary || null);
        setAttempts(res.data.attempts || []);
      }
    } catch (err: unknown) {
      console.error("Error fetching missing punches report:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerDailyCheck = async () => {
    try {
      setCheckingDaily(true);
      const res = await api.post("/hr/attendance/missing-punches/check-daily");
      if (res.data?.success) {
        toast.success("تم تشغيل فحص اليوم بنجاح", {
          description: `تم رصد ${res.data.missingCount || 0} بصمة مفقودة لـ ${res.data.affectedEmployeesCount || 0} موظف وإشعار الإدارة.`,
        });
        await fetchMissingReport();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "تعذر فحص البصمات المفقودة");
    } finally {
      setCheckingDaily(false);
    }
  };

  const handleResolveSubmit = async () => {
    if (!activeAttempt) return;
    try {
      setSubmittingResolve(true);
      const res = await api.post(`/hr/attendance/missing-punches/${activeAttempt.id}/resolve`, {
        notes: resolveNotes,
      });

      if (res.data?.success) {
        toast.success("تمت تسوية البصمة المفقودة بنجاح وتثبيت حضور الموظف ✅");
        setActiveAttempt(null);
        setResolveNotes("");
        await fetchMissingReport();
        if (onResolveSuccess) {
          onResolveSuccess();
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "فشل تسوية البصمة");
    } finally {
      setSubmittingResolve(false);
    }
  };

  useEffect(() => {
    void fetchMissingReport();
  }, [fetchMissingReport]);

  const totalMissing = summary?.totalMissingPunches || 0;

  return (
    <Card className="border-amber-200 dark:border-amber-900/40 shadow-sm bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 dark:from-amber-950/20 dark:via-gray-900 dark:to-gray-900">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  رصد ومطابقة البصمات المفقودة (Missing Punches)
                </CardTitle>
                {totalMissing > 0 ? (
                  <Badge variant="destructive" className="animate-pulse font-mono">
                    {totalMissing} محاولة غير مقيدة
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5 ml-1" /> جميع البصمات مطابقة
                  </Badge>
                )}
              </div>
              <CardDescription className="text-sm mt-0.5">
                فحص آلي يومي يرصد محاولات البصمة التي سُجلت من أجهزة الشركة المعتمدة أو التطبيقات ولم تُقيد في جدول الحضور.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={triggerDailyCheck}
              disabled={checkingDaily}
              className="text-amber-700 dark:text-amber-300 border-amber-300 hover:bg-amber-100/50"
            >
              <Send className={`h-4 w-4 ml-1.5 ${checkingDaily ? "animate-spin" : ""}`} />
              فحص اليوم وإرسال تنبيه
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchMissingReport}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ml-1.5 ${loading ? "animate-spin" : ""}`} />
              تحديث
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ملخص الموظفين المتأثرين */}
        {summary && summary.byEmployee.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-100/40 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
            <div className="text-xs font-semibold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-1.5">
              <User className="h-4 w-4" /> الموظفون الذين لديهم بصمات مفقودة:
            </div>
            <div className="flex flex-wrap gap-2">
              {summary.byEmployee.map((emp) => (
                <Badge
                  key={emp.userId}
                  variant="outline"
                  className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-amber-300 py-1 px-2.5 flex items-center gap-2"
                >
                  <span className="font-medium">{emp.userName}</span>
                  {emp.employeeCode && (
                    <span className="text-xs text-gray-500 font-mono">({emp.employeeCode})</span>
                  )}
                  <span className="px-1.5 py-0.2 bg-amber-500 text-white text-xs rounded-full font-bold">
                    {emp.count}
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* جدول المحاولات المفقودة */}
        {attempts.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
            لا توجد بصمات مفقودة حالياً. كافة محاولات الحضور مسجلة بشكل سليم.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-100/75 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="py-2.5 px-3">الموظف</th>
                  <th className="py-2.5 px-3">تاريخ ووقت المحاولة</th>
                  <th className="py-2.5 px-3">الجهاز والنوع</th>
                  <th className="py-2.5 px-3">النتيجة والسبب</th>
                  <th className="py-2.5 px-3">عنوان IP</th>
                  <th className="py-2.5 px-3">الحالة والإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {attempts.map((att) => {
                  const attemptDate = new Date(att.attemptedAt);
                  const formattedTime = attemptDate.toLocaleTimeString("ar-EG", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const formattedDate = attemptDate.toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <tr key={att.id} className="hover:bg-amber-50/20 dark:hover:bg-gray-800/40">
                      <td className="py-2.5 px-3 font-medium text-gray-900 dark:text-white">
                        <div className="flex flex-col">
                          <span>{att.userName}</span>
                          {att.employeeCode ? (
                            <span className="text-[10px] text-gray-400 font-mono">
                              {att.employeeCode}
                            </span>
                          ) : (
                            <span className="text-[10px] text-rose-500 font-medium">
                              (غير مقيد كموظف)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span>{formattedDate} {formattedTime}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Laptop className="h-3.5 w-3.5 text-gray-400" />
                          <span className="font-mono text-gray-700 dark:text-gray-300">
                            {att.deviceType || "جهاز شركة"}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                            {att.result}
                          </span>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-xs" title={att.reason || ""}>
                            {att.reason || "محاولة بصمة غير مقيدة"}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-gray-500">
                        {att.clientIp || "-"}
                      </td>
                      <td className="py-2.5 px-3">
                        {att.attendanceId ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                            تمت التسوية ✅
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="default"
                            className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={() => {
                              setActiveAttempt(att);
                              setResolveNotes(`تسوية اعتماد بصمة الجهاز بتاريخ ${formattedDate}`);
                            }}
                          >
                            تسوية وتثبيت الحضور
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* نافذة تأكيد تسوية البصمة */}
      <Dialog open={Boolean(activeAttempt)} onOpenChange={(open) => !open && setActiveAttempt(null)}>
        <DialogContent className="sm:max-w-[480px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              تسوية وتثبيت بصمة الحضور
            </DialogTitle>
          </DialogHeader>

          {activeAttempt && (
            <div className="space-y-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-1">
                <p><strong>الموظف:</strong> {activeAttempt.userName}</p>
                <p>
                  <strong>وقت المحاولة المسجل:</strong>{" "}
                  {new Date(activeAttempt.attemptedAt).toLocaleString("ar-EG")}
                </p>
                <p><strong>سبب عدم التقييد:</strong> {activeAttempt.reason || activeAttempt.result}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  ملاحظات الاعتماد والتسوية:
                </label>
                <Textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="اكتب ملاحظات التسوية (مثل: تم التأكد من تواجد الموظف على جهاز المكتب)"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setActiveAttempt(null)}>
              إلغاء
            </Button>
            <Button
              variant="default"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleResolveSubmit}
              disabled={submittingResolve}
            >
              {submittingResolve ? "جاري التسوية..." : "تأكيد التسوية وتسجيل الحضور"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
