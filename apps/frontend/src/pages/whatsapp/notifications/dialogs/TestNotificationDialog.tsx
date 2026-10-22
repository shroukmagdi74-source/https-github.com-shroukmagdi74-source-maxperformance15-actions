import React from "react";
import { useTranslation } from "react-i18next";
import { Send, TestTube } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

interface TestNotificationDialogProps {
  open: boolean;
  testPhone: string;
  testEventType: string;
  sendingTest: boolean;
  superAdminMode?: boolean;
  onOpenChange: (open: boolean) => void;
  onPhoneChange: (phone: string) => void;
  onEventTypeChange: (eventType: string) => void;
  onSend: () => void;
}

export const TestNotificationDialog: React.FC<TestNotificationDialogProps> = ({
  open,
  testPhone,
  testEventType,
  sendingTest,
  superAdminMode,
  onOpenChange,
  onPhoneChange,
  onEventTypeChange,
  onSend,
}) => {
  const { t, i18n } = useTranslation();

  const eventTypes = superAdminMode
    ? [
        { value: "NEW_SIGNUP_WELCOME", label: "رسالة ترحيب بعد التسجيل" },
        { value: "NEW_SIGNUP_ADMIN_ALERT", label: "تنبيه الإدارة بتسجيل جديد" },
        { value: "SUBSCRIPTION_CREATED", label: "تأكيد إنشاء الاشتراك" },
        { value: "SUBSCRIPTION_RENEWED", label: "تجديد الاشتراك" },
        { value: "SUBSCRIPTION_CANCELLED", label: "إلغاء الاشتراك" },
      ]
    : [
        { value: "BACK_IN_STOCK", label: t("whatsappNotifications.products.backInStock", "توفر المنتج بعد النفاد") },
        { value: "PRICE_DROP", label: t("whatsappNotifications.products.priceDrop", "انخفاض سعر المنتج") },
        { value: "NEW_PRODUCT", label: t("whatsappNotifications.products.newProduct", "إطلاق منتج جديد") },
        { value: "CART_ABANDONED_1H", label: t("whatsappNotifications.abandonedCart.firstReminder", "سلة متروكة (بعد ساعة)") },
        { value: "CART_ABANDONED_WITH_DISCOUNT", label: t("whatsappNotifications.abandonedCart.incentiveDiscount", "سلة متروكة مع كود خصم") },
        { value: "PROMOTIONAL", label: t("whatsappNotifications.marketing.promotional", "رسالة ترويجية") },
        { value: "COUPON_SENT", label: t("whatsappNotifications.marketing.coupons", "إرسال كوبون خصم") },
        { value: "BIRTHDAY_WISH", label: t("whatsappNotifications.marketing.birthday", "تهنئة عيد ميلاد") },
        { value: "ATTENDANCE_REMINDER", label: t("whatsappNotifications.hr.attendance", "تذكير الحضور الصباحي") },
        { value: "PAYROLL_READY", label: t("whatsappNotifications.hr.payroll", "إصدار الراتب") },
      ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <DialogTitle className="text-base font-semibold">
              {t("whatsappNotifications.actions.testMessage", "إرسال إشعار اختباري")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {t(
              "whatsappNotifications.test.desc",
              "أدخل رقم هاتف لاختبار وصول القالب وتنسيقه الحقيقي على تطبيق واتساب.",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              {t("whatsappNotifications.test.phone", "رقم الهاتف (مع كود الدولة)")}
            </Label>
            <Input
              type="tel"
              placeholder="2010xxxxxxxx"
              value={testPhone}
              onChange={(e) => onPhoneChange(e.target.value)}
              className="h-8 font-mono text-xs"
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              {t("whatsappNotifications.test.eventType", "نوع الحدث المراد اختباره")}
            </Label>
            <Select value={testEventType} onValueChange={onEventTypeChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((event) => (
                  <SelectItem key={event.value} value={event.value} className="text-xs">
                    {event.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs font-medium"
          >
            {t("common.cancel", "إلغاء")}
          </Button>
          <Button
            size="sm"
            onClick={onSend}
            disabled={sendingTest || !testPhone.trim()}
            className="h-8 gap-1.5 bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-700"
          >
            <Send className="h-3.5 w-3.5" />
            {sendingTest
              ? t("whatsappNotifications.test.sending", "جاري الإرسال...")
              : t("whatsappNotifications.test.send", "إرسال الآن")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
