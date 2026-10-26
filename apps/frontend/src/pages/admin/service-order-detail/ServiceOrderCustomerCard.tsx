import React from "react";
import { User, MessageCircle, Send, ExternalLink, Phone } from "lucide-react";

interface ServiceOrderCustomerCardProps {
  order: any;
  waDetection: any;
  onOpenWhatsAppModal: () => void;
  onOpenInternalChat: () => void;
  onOpenExternalWhatsApp: () => void;
}

export const ServiceOrderCustomerCard: React.FC<ServiceOrderCustomerCardProps> = ({
  order,
  waDetection,
  onOpenWhatsAppModal,
  onOpenInternalChat,
  onOpenExternalWhatsApp,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700/60">
        <User className="w-4 h-4 text-primary-600" />
        العميل والتواصل الذكي
      </h3>

      <div className="space-y-2">
        <div>
          <span className="text-[11px] text-gray-400 block">اسم العميل</span>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {order.customerName}
          </p>
        </div>

        <div>
          <span className="text-[11px] text-gray-400 block">رقم الهاتف</span>
          <p
            className="text-sm font-semibold text-gray-800 dark:text-gray-200 tabular-nums"
            dir="ltr"
          >
            {order.phone}
          </p>
        </div>

        {/* Detected WhatsApp Session Indicator */}
        <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              جلسة الواتساب المتصلة:
            </span>
            {waDetection?.isPreviousChat ? (
              <span className="px-1.5 py-0.5 bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded text-[10px]">
                محادثة سابقة للعميل
              </span>
            ) : (
              <span className="text-gray-500 dark:text-gray-400 text-[10px]">
                الجلسة الافتراضية
              </span>
            )}
          </div>
          <p className="text-emerald-700 dark:text-emerald-400 truncate">
            {waDetection?.session?.name || "واتساب الشركة"} (
            {waDetection?.session?.phoneNumber || "متصل"})
          </p>
        </div>
      </div>

      {/* Quick Contact Actions */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={onOpenWhatsAppModal}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <Send className="w-4 h-4" />
          <span>إرسال واتساب من النظام</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onOpenInternalChat}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-xl transition-colors"
            title="فتح محادثة العميل في شات الواتساب الداخلي للمنصة"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>شات المنصة</span>
          </button>

          <button
            type="button"
            onClick={onOpenExternalWhatsApp}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-xl transition-colors"
            title="فتح محادثة واتساب عبر wa.me"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
            <span>wa.me مباشر</span>
          </button>
        </div>

        <a
          href={`tel:${order.phone}`}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition-colors border border-gray-200 dark:border-gray-700"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>اتصال هاتفي</span>
        </a>
      </div>
    </div>
  );
};
