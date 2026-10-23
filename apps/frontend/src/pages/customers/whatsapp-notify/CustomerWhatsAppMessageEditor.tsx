import React from "react";
import { useTranslation } from "react-i18next";
import {
  Send,
  ShoppingBag,
  Sparkles,
  Link2,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

interface CustomerWhatsAppMessageEditorProps {
  message: string;
  mediaUrl: string;
  showProducts: boolean;
  onMessageChange: (val: string) => void;
  onMediaUrlChange: (val: string) => void;
  onToggleProducts: () => void;
  onClearMessage: () => void;
}

export const CustomerWhatsAppMessageEditor: React.FC<CustomerWhatsAppMessageEditorProps> = ({
  message,
  mediaUrl,
  showProducts,
  onMessageChange,
  onMediaUrlChange,
  onToggleProducts,
  onClearMessage,
}) => {
  const { t } = useTranslation();

  const templates = [
    {
      label: t("whatsappNotify.templates.newProduct", "منتج جديد"),
      text: t(
        "whatsappNotify.templates.newProductText",
        "مرحباً {customerName}، يسعدنا إعلامك بوصول منتجات جديدة مميزة في متجرنا! تفقد الرابط التالي للاطلاع عليها: {customer_link}",
      ),
    },
    {
      label: t("whatsappNotify.templates.specialOffer", "عرض خاص"),
      text: t(
        "whatsappNotify.templates.specialOfferText",
        "أهلاً {customerName}، خصم حصري ينتظرك! استخدم كود الخصم {coupon_code} عند إتمام طلبك اليوم.",
      ),
    },
    {
      label: t("whatsappNotify.templates.generalContact", "تواصل عام"),
      text: t(
        "whatsappNotify.templates.generalContactText",
        "عزيزي {customerName}، نتمنى أن تكون في أفضل حال. نحن هنا لمساعدتك في أي استفسار أو طلب.",
      ),
    },
  ];

  const insertVariable = (variable: string) => {
    onMessageChange(message + " " + variable);
  };

  return (
    <div className="space-y-4 rounded-lg border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <Send className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-foreground">
            {t("whatsappNotify.notificationContent", "محتوى الرسالة والصياغة")}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleProducts}
            className="h-7 gap-1 text-[11px] font-medium"
          >
            <ShoppingBag className="h-3 w-3 text-muted-foreground" />
            {t("whatsappNotify.linkProduct", "إدراج منتج")}
          </Button>

          {templates.map((tpl, i) => (
            <Button
              key={i}
              variant="ghost"
              size="sm"
              onClick={() => onMessageChange(tpl.text)}
              className="h-7 text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              {tpl.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div className="space-y-1.5">
        <Textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          rows={6}
          placeholder={t(
            "whatsappNotify.messagePlaceholder",
            "اكتب نص رسالة الواتساب هنا... يمكنك استخدام المتغيرات مثل {customerName} لإضفاء طابع شخصي.",
          )}
          className="resize-none text-xs leading-relaxed"
        />

        <div className="flex items-center justify-between px-0.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5 font-mono tabular-nums">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{t("whatsappNotify.charCount", { count: message.length })}</span>
          </div>

          {message.length > 0 && (
            <button
              type="button"
              onClick={onClearMessage}
              className="flex items-center gap-1 text-destructive hover:underline text-[10px] font-medium"
            >
              <Trash2 className="h-3 w-3" />
              {t("whatsappNotify.clearText", "مسح النص")}
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Variables Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] text-muted-foreground font-medium">
          إدراج متغير:
        </span>
        <button
          type="button"
          onClick={() => insertVariable("{customerName}")}
          className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
        >
          + {`{customerName}`}
        </button>
        <button
          type="button"
          onClick={() => insertVariable("{coupon_code}")}
          className="rounded border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-purple-700 hover:bg-purple-500/20 dark:text-purple-300"
        >
          + {`{coupon_code}`}
        </button>
        <button
          type="button"
          onClick={() => insertVariable("{customer_link}")}
          className="rounded border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-blue-700 hover:bg-blue-500/20 dark:text-blue-300 flex items-center gap-1"
        >
          <Link2 className="h-2.5 w-2.5" />
          {`{customer_link}`}
        </button>
      </div>

      {/* Image / Media URL */}
      <div className="space-y-1.5 pt-1">
        <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
          {t("whatsappNotify.imageUrl", "رابط صورة المرفق (اختياري)")}
        </Label>
        <Input
          type="url"
          placeholder="https://example.com/promo.jpg"
          value={mediaUrl}
          onChange={(e) => onMediaUrlChange(e.target.value)}
          className="h-8 font-mono text-xs"
          dir="ltr"
        />
      </div>
    </div>
  );
};
