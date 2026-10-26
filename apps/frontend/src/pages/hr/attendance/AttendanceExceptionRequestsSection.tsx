import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RefreshCw,
  MapPin,
  Radio,
  Network,
  Clock,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface AttendanceExceptionRequestItem {
  id: string;
  companyId: string;
  userId: string;
  employeeName?: string;
  employee?: {
    employeeNumber?: string;
    department?: { id: string; name: string };
    position?: { id: string; title: string };
  };
  attendanceDate: string;
  requestedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reason: string;
  distanceMeters?: number | null;
  accuracyMeters?: number | null;
  clientIp?: string | null;
  decidedById?: string | null;
  decidedAt?: string | null;
  decisionNote?: string | null;
  attendanceId?: string | null;
}

interface AttendanceExceptionRequestsSectionProps {
  onDecisionSuccess?: () => void;
}

export const AttendanceExceptionRequestsSection: React.FC<AttendanceExceptionRequestsSectionProps> = ({
  onDecisionSuccess,
}) => {
  const [requests, setRequests] = useState<AttendanceExceptionRequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeRequest, setActiveRequest] = useState<AttendanceExceptionRequestItem | null>(null);
  const [decisionAction, setDecisionAction] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [decisionNote, setDecisionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPendingRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/hr/attendance/exception-requests", {
        params: { status: "PENDING" },
      });
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err: unknown) {
      console.error("Error fetching attendance exception requests:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const handleOpenDecisionDialog = (
    req: AttendanceExceptionRequestItem,
    action: "APPROVED" | "REJECTED"
  ) => {
    setActiveRequest(req);
    setDecisionAction(action);
    setDecisionNote("");
  };

  const handleCloseDecisionDialog = () => {
    if (submitting) return;
    setActiveRequest(null);
    setDecisionAction(null);
    setDecisionNote("");
  };

  const handleSubmitDecision = async () => {
    if (!activeRequest || !decisionAction) return;

    try {
      setSubmitting(true);
      await api.post(`/hr/attendance/exception-requests/${activeRequest.id}/decide`, {
        decision: decisionAction,
        note: decisionNote.trim() || undefined,
      });

      toast.success(
        decisionAction === "APPROVED"
          ? "تمت الموافقة على طلب استثناء البصمة واعتماد الحضور بنجاح"
          : "تم رفض طلب استثناء البصمة"
      );

      handleCloseDecisionDialog();
      await fetchPendingRequests();
      if (onDecisionSuccess) {
        onDecisionSuccess();
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      toast.error(
        errorObj?.response?.data?.error || "فشل اتخاذ القرار بشأن طلب الاستثناء"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Card className="border-indigo-100 bg-gradient-to-l from-indigo-50/70 via-white to-white dark:from-indigo-950/20 dark:via-gray-800 dark:to-gray-800 dark:border-indigo-900/40 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>طلبات استثناء البصمة</span>
              {requests.length > 0 && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-mono">
                  {requests.length} معلق
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs">
              مراجعة واعتماد أو رفض طلبات الاستثناء المقدمة من الموظفين عند تعذر البصمة الجغرافية
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchPendingRequests}
            disabled={loading}
            className="h-8 px-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
            title="تحديث القائمة"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          </Button>
        </CardHeader>

        <CardContent>
          {loading && requests.length === 0 ? (
            <div className="py-6 flex items-center justify-center text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin ml-2 text-indigo-600" />
              جاري تحميل طلبات الاستثناء...
            </div>
          ) : requests.length === 0 ? (
            <div className="py-4 text-center text-xs text-muted-foreground">
              لا توجد طلبات استثناء معلقة حالياً.
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-xl bg-white dark:bg-gray-800/80">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b bg-gray-50/70 dark:bg-gray-900/50 text-gray-500 font-medium">
                    <th className="p-3">الموظف</th>
                    <th className="p-3">تاريخ البصمة</th>
                    <th className="p-3">المسافة</th>
                    <th className="p-3">دقة الجهاز</th>
                    <th className="p-3">عنوان IP</th>
                    <th className="p-3">سبب الاستثناء</th>
                    <th className="p-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {requests.map((req) => {
                    const dateFormatted = req.attendanceDate
                      ? new Date(req.attendanceDate).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "-";

                    return (
                      <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                        <td className="p-3 font-semibold text-gray-900 dark:text-gray-100">
                          <div>{req.employeeName || "موظف"}</div>
                          {req.employee?.department?.name && (
                            <span className="text-[10px] text-gray-400 block font-normal">
                              {req.employee.department.name}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-gray-600 dark:text-gray-300 font-mono">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            {dateFormatted}
                          </span>
                        </td>
                        <td className="p-3 font-mono">
                          {req.distanceMeters != null ? (
                            <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                              <MapPin className="h-3 w-3" />
                              {req.distanceMeters} م
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3 font-mono">
                          {req.accuracyMeters != null ? (
                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <Radio className="h-3 w-3" />
                              ±{req.accuracyMeters} م
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-gray-600 dark:text-gray-300">
                          {req.clientIp ? (
                            <span className="inline-flex items-center gap-1">
                              <Network className="h-3 w-3 text-gray-400" />
                              {req.clientIp}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3 max-w-xs text-gray-700 dark:text-gray-200">
                          <div className="flex items-start gap-1">
                            <MessageSquare className="h-3 w-3 mt-0.5 text-gray-400 flex-shrink-0" />
                            <span className="line-clamp-2" title={req.reason}>
                              {req.reason}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenDecisionDialog(req, "APPROVED")}
                              className="h-7 px-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800 text-xs"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 ml-1" />
                              قبول
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenDecisionDialog(req, "REJECTED")}
                              className="h-7 px-2.5 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800 text-xs"
                            >
                              <XCircle className="h-3.5 w-3.5 ml-1" />
                              رفض
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Decision Dialog with Note */}
      <Dialog open={Boolean(activeRequest)} onOpenChange={handleCloseDecisionDialog}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {decisionAction === "APPROVED" ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>اعتماد طلب استثناء البصمة</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span>رفض طلب استثناء البصمة</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {activeRequest && (
            <div className="space-y-3 py-2 text-sm">
              <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                <p>
                  <strong className="text-gray-700 dark:text-gray-300">الموظف:</strong>{" "}
                  {activeRequest.employeeName}
                </p>
                <p>
                  <strong className="text-gray-700 dark:text-gray-300">سبب الاستثناء المقدم:</strong>{" "}
                  {activeRequest.reason}
                </p>
              </div>

              {decisionAction === "APPROVED" ? (
                <div className="flex items-start gap-2 p-3 text-xs text-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-300 rounded-lg border border-emerald-200">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    عند الاعتماد، سيتم تسجيل حضور الموظف آلياً لطريقة البصمة (استثناء معتمد) وتوثيق تفاصيل الموقع وسبب الاستثناء في سجل التدقيق.
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-3 text-xs text-red-800 bg-red-50 dark:bg-red-950/20 dark:text-red-300 rounded-lg border border-red-200">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    عند الرفض، سيتم حفظ قرار الرفض دون إنشاء سجل حضور.
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  ملاحظة القرار (اختياري)
                </label>
                <Textarea
                  rows={2}
                  value={decisionNote}
                  onChange={(e) => setDecisionNote(e.target.value)}
                  placeholder="اكتب ملاحظة توضيحية حول سبب القبول أو الرفض..."
                  disabled={submitting}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-start">
            <Button
              onClick={handleSubmitDecision}
              disabled={submitting}
              className={
                decisionAction === "APPROVED"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              {submitting ? (
                "جاري المعالجة..."
              ) : decisionAction === "APPROVED" ? (
                "تأكيد الاعتماد"
              ) : (
                "تأكيد الرفض"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleCloseDecisionDialog}
              disabled={submitting}
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
