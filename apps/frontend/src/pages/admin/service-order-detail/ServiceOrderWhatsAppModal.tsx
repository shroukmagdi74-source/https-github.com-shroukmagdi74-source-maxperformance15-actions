import React from "react";
import { MessageCircle, X, ExternalLink, Loader2, Send } from "lucide-react";

interface ServiceOrderWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  waDetection: any;
  selectedWaSessionId: string;
  setSelectedWaSessionId: (val: string) => void;
  waMessageText: string;
  setWaMessageText: (val: string) => void;
  sendingWa: boolean;
  handleSendWhatsAppSystem: () => void;
  openWhatsAppExternal: () => void;
  applyTemplate: (type: "CONFIRM" | "PROGRESS" | "INVOICE" | "DELIVERY") => void;
}

export const ServiceOrderWhatsAppModal: React.FC<ServiceOrderWhatsAppModalProps> = ({
  isOpen,
  onClose,
  waDetection,
  selectedWaSessionId,
  setSelectedWaSessionId,
  waMessageText,
  setWaMessageText,
  sendingWa,
  handleSendWhatsAppSystem,
  openWhatsAppExternal,
  applyTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl space-y-4 my-auto"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              إرسال واتساب من النظام للعميل
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Session Info & Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
            الإرسال من جلسة الواتساب:
          </label>
          <select
            value={selectedWaSessionId}
            onChange={(e) => setSelectedWaSessionId(e.target.value)}
            className="w-full p-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40"
          >
            {waDetection?.session && (
              <option value={waDetection.session.id}>
                {waDetection.isPreviousChat
                  ? "⭐ جلسة العميل السابقة: "
                  : "الجلسة المختارة: "}
                {waDetection.session.name || "واتساب"} (
                {waDetection.session.phoneNumber})
              </option>
            )}
            {waDetection?.companySessions?.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.phoneNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Template Buttons */}
        <div className="space-y-1">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">
            قوالب جاهزة:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => applyTemplate("CONFIRM")}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 font-medium"
            >
              تأكيد الطلب
            </button>
            <button
              type="button"
              onClick={() => applyTemplate("PROGRESS")}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 font-medium"
            >
              بدء التنفيذ
            </button>
            <button
              type="button"
              onClick={() => applyTemplate("INVOICE")}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 hover:bg-indigo-100 font-medium"
            >
              إشعار الفاتورة والحساب
            </button>
            <button
              type="button"
              onClick={() => applyTemplate("DELIVERY")}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 hover:bg-emerald-100 font-medium"
            >
              جاهزية التسليم
            </button>
          </div>
        </div>

        {/* Message Area */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            نص الرسالة:
          </label>
          <textarea
            rows={5}
            value={waMessageText}
            onChange={(e) => setWaMessageText(e.target.value)}
            placeholder="اكتب الرسالة المراد إرسالها للعميل..."
            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={openWhatsAppExternal}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>أو افتح wa.me</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-gray-500 hover:bg-gray-100"
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={sendingWa}
              onClick={handleSendWhatsAppSystem}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              {sendingWa ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>إرسال الآن من النظام</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
