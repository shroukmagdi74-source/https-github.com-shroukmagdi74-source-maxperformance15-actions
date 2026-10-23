import React from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, CheckCheck, Eye } from "lucide-react";

interface CustomerWhatsAppChatPreviewProps {
  message: string;
  mediaUrl: string;
}

export const CustomerWhatsAppChatPreview: React.FC<CustomerWhatsAppChatPreviewProps> = ({
  message,
  mediaUrl,
}) => {
  const { t } = useTranslation();

  const previewText = message
    ? message
        .replace(/{customerName}/g, "محمد أحمد")
        .replace(/{coupon_code}/g, "VIP20")
        .replace(/{customer_link}/g, "https://maxp.online/c/123")
        .replace(/{productName}/g, "حذاء رياضي أنيق")
        .replace(/{price}/g, "450 ج.م")
    : t(
        "whatsappNotify.previewDefault",
        "مرحباً محمد أحمد، هذه معاينة حية لشكل الرسالة كما ستظهر على تطبيق واتساب لدى العميل.",
      );

  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/50 pb-2.5">
        <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <h4 className="text-xs font-semibold text-foreground">
          {t("whatsappNotify.previewTitle", "معاينة الرسالة الحية على واتساب")}
        </h4>
      </div>

      {/* Mock Chat Container */}
      <div className="rounded-lg border border-border/60 bg-[#efeae2] dark:bg-zinc-900/80 p-3.5 space-y-2">
        {/* Header bar inside preview */}
        <div className="flex items-center gap-2 pb-2 border-b border-black/5 dark:border-white/5">
          <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
            <MessageSquare className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100">
              خدمة العملاء
            </p>
            <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">
              متصل الآن
            </p>
          </div>
        </div>

        {/* Message Bubble */}
        <div className="max-w-[85%] rounded-lg bg-white dark:bg-emerald-950/40 border border-emerald-500/20 p-2.5 shadow-sm space-y-2">
          {mediaUrl && (
            <div className="overflow-hidden rounded-md border border-border/40">
              <img
                src={mediaUrl}
                alt="Attachment preview"
                className="max-h-36 w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          )}

          <p className="text-xs whitespace-pre-wrap text-zinc-900 dark:text-zinc-100 leading-relaxed">
            {previewText}
          </p>

          <div className="flex items-center justify-end gap-1 text-[10px] text-zinc-500 font-mono tabular-nums">
            <span>{currentTime}</span>
            <CheckCheck className="h-3 w-3 text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
