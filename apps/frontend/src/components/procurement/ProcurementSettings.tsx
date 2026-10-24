import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Save,
  ShieldCheck,
  Sparkles,
  Boxes,
  Building2,
  Receipt,
  FileCheck2,
  Eye,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "../../services/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AVAILABLE_PROCUREMENT_TEMPLATES,
  ProcurementTemplateId,
  DEFAULT_PROCUREMENT_TEMPLATE,
  PROCUREMENT_TEMPLATE_STORAGE_KEY,
  NormalizedProcurementData,
} from "./templates";
import { OfficialTaxTemplate } from "./templates/OfficialTaxTemplate";
import { ModernMinimalTemplate } from "./templates/ModernMinimalTemplate";
import { GoodsReceiptTemplate } from "./templates/GoodsReceiptTemplate";

interface ProcurementSettingsData {
  defaultTemplate: ProcurementTemplateId;
  companyLegalName: string;
  taxNumber: string;
  crNumber: string;
  billingAddress: string;
  phone: string;
  email: string;
  defaultNotes: string;
  defaultPaymentTerms: string;
  signaturePurchasingTitle: string;
  signatureFinanceTitle: string;
  signatureWarehouseTitle: string;
  showCompanyStamp: boolean;
  showSignatureBlock: boolean;
}

const templateIcons: Record<ProcurementTemplateId, React.ReactNode> = {
  official_tax: <ShieldCheck className="size-5 text-emerald-600" />,
  modern_minimal: <Sparkles className="size-5 text-blue-600" />,
  goods_receipt: <Boxes className="size-5 text-amber-600" />,
};

const samplePreviewData: NormalizedProcurementData = {
  documentType: "PI",
  documentNumber: "PI-000101",
  documentDate: new Date().toISOString(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  status: "PENDING",
  statusLabel: "غير مدفوعة",
  companyName: "شركة التجارة النموذجية",
  supplier: {
    id: "sup-sample",
    name: "مجموعة التوريدات الوطنية المتحدة",
    phone: "01099887766",
    email: "supply@national.com",
    taxNumber: "998-112-445",
  },
  linkedReference: {
    type: "PO",
    number: "PO-000045",
  },
  items: [
    {
      id: "it-1",
      productName: "صنف تجريبي رقم 1 (خامات)",
      description: "المواصفات القياسية المعتمدة للتوريد",
      sku: "RAW-MAT-01",
      quantity: 100,
      receivedQuantity: 100,
      unitPrice: 150,
      taxRate: 14,
      discountRate: 5,
      totalPrice: 16245,
    },
    {
      id: "it-2",
      productName: "صنف تجريبي رقم 2 (تغليف)",
      description: "كرتون مقوى مخصص للشحن",
      sku: "BOX-PKG-02",
      quantity: 50,
      receivedQuantity: 50,
      unitPrice: 30,
      taxRate: 14,
      discountRate: 0,
      totalPrice: 1710,
    },
  ],
  financialSummary: {
    subtotal: 16500,
    discountAmount: 750,
    taxAmount: 2205,
    shippingCost: 350,
    totalAmount: 18305,
    paidAmount: 5000,
    remainingAmount: 13305,
  },
  notes: "تعتبر هذه الفاتورة سند التزام مالي معتمد بعد اكتمال التوريد ومطابقة الأصناف.",
  paymentTerms: "سداد بعد 30 يوم من تاريخ الفاتورة",
};

export const ProcurementSettings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<ProcurementTemplateId>("official_tax");

  const [settings, setSettings] = useState<ProcurementSettingsData>({
    defaultTemplate: DEFAULT_PROCUREMENT_TEMPLATE,
    companyLegalName: "",
    taxNumber: "",
    crNumber: "",
    billingAddress: "",
    phone: "",
    email: "",
    defaultNotes: "",
    defaultPaymentTerms: "",
    signaturePurchasingTitle: "مسؤول المشتريات",
    signatureFinanceTitle: "اعتماد المدير المالي / الإدارة",
    signatureWarehouseTitle: "تأكيد واستلام المورد / المستودع",
    showCompanyStamp: true,
    showSignatureBlock: true,
  });

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ success: boolean; data: ProcurementSettingsData }>(
        "/procurement/settings"
      );
      if (response.data?.data) {
        setSettings(response.data.data);
        if (response.data.data.defaultTemplate) {
          try {
            localStorage.setItem(PROCUREMENT_TEMPLATE_STORAGE_KEY, response.data.data.defaultTemplate);
          } catch {}
        }
      }
    } catch (err: unknown) {
      console.error("Failed to load procurement settings:", err);
      const errResp = err as { response?: { data?: { message?: string } }; message?: string };
      setError(errResp.response?.data?.message || "فشل تحميل إعدادات المشتريات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await apiClient.put<{ success: boolean; message?: string; data: ProcurementSettingsData }>(
        "/procurement/settings",
        settings
      );
      if (response.data?.data) {
        setSettings(response.data.data);
      }
      try {
        localStorage.setItem(PROCUREMENT_TEMPLATE_STORAGE_KEY, settings.defaultTemplate);
      } catch {}
      setSuccessMessage("تم حفظ إعدادات وقوالب فواتير المشتريات بنجاح");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      console.error("Failed to save procurement settings:", err);
      const errResp = err as { response?: { data?: { message?: string } }; message?: string };
      setError(errResp.response?.data?.message || "فشل حفظ إعدادات المشتريات");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPreview = (templateId: ProcurementTemplateId) => {
    setPreviewTemplate(templateId);
    setPreviewOpen(true);
  };

  const renderPreviewComponent = () => {
    const previewData: NormalizedProcurementData = {
      ...samplePreviewData,
      companyName: settings.companyLegalName || samplePreviewData.companyName,
      notes: settings.defaultNotes || samplePreviewData.notes,
      paymentTerms: settings.defaultPaymentTerms || samplePreviewData.paymentTerms,
    };

    switch (previewTemplate) {
      case "modern_minimal":
        return <ModernMinimalTemplate data={previewData} isRtl={isRtl} />;
      case "goods_receipt":
        return <GoodsReceiptTemplate data={previewData} isRtl={isRtl} />;
      case "official_tax":
      default:
        return <OfficialTaxTemplate data={previewData} isRtl={isRtl} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">جاري تحميل إعدادات وقوالب المشتريات...</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 max-w-5xl mx-auto space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="size-6 text-primary" />
            <span>إعدادات وقوالب فواتير المشتريات</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            اختر القالب الافتراضي لطباعة الفواتير وأوامر الشراء، وخصص بيانات الترويسة الضريبية والتواقيع المعتمدة.
          </p>
        </div>

        <Button onClick={() => handleSave()} disabled={saving} className="gap-2 shrink-0">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          <span>{saving ? "جاري الحفظ..." : "حفظ الإعدادات"}</span>
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-destructive bg-destructive/10 border border-destructive/20 rounded-xl text-xs">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-3 text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 1. Template Selection Grid */}
      <Card size="sm" className="border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <span>القالب الافتراضي المعتمد للطباعة</span>
          </CardTitle>
          <CardDescription className="text-xs">
            حدد القالب الذي سيظهر تلقائياً عند فتح وطباعة أي فاتورة شراء أو أمر شراء. يمكنك أيضاً تغييره وقت الطباعة.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {AVAILABLE_PROCUREMENT_TEMPLATES.map((tmpl) => {
              const isSelected = settings.defaultTemplate === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSettings((s) => ({ ...s, defaultTemplate: tmpl.id }))}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                      : "border-border/70 hover:border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {templateIcons[tmpl.id]}
                        <span className="font-bold text-xs text-foreground">{tmpl.nameAr}</span>
                      </div>
                      <Badge variant={isSelected ? "default" : "outline"} className="text-[10px] px-1.5 py-0">
                        {tmpl.badgeAr}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                      {tmpl.descriptionAr}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPreview(tmpl.id);
                      }}
                      className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <Eye className="size-3" />
                      معاينة القالب
                    </button>

                    {isSelected ? (
                      <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" />
                        القالب الافتراضي
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground hover:text-foreground">
                        اختر كافتراضي
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. Company & Tax Identity */}
      <Card size="sm" className="border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            <span>بيانات المنشأة والترويسة الضريبية الرسمية</span>
          </CardTitle>
          <CardDescription className="text-xs">
            البيانات التي تُطبع في ترويسة فواتير المشتريات كجهة مستلمة ومفوترة.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">الاسم التجاري / القانوني للمنشأة</Label>
              <Input
                value={settings.companyLegalName}
                onChange={(e) => setSettings({ ...settings, companyLegalName: e.target.value })}
                placeholder="مثال: شركة النور للتجارة والتوريدات ش.ذ.م.م"
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">رقم التسجيل الضريبي (VAT ID)</Label>
              <Input
                value={settings.taxNumber}
                onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                placeholder="مثال: 300123456789003"
                className="text-xs font-mono h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">رقم السجل التجاري (CR Number)</Label>
              <Input
                value={settings.crNumber}
                onChange={(e) => setSettings({ ...settings, crNumber: e.target.value })}
                placeholder="مثال: 1010567890"
                className="text-xs font-mono h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">هاتف التواصل التجاري</Label>
              <Input
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="010XXXXXXXX"
                className="text-xs font-mono h-9"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">عنوان المقر الرئيسي / جهة الاستلام والفوترة</Label>
              <Input
                value={settings.billingAddress}
                onChange={(e) => setSettings({ ...settings, billingAddress: e.target.value })}
                placeholder="مثال: المنطقة الصناعية، القطعة 14، القاهرة، مصر"
                className="text-xs h-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Default Terms & Notes */}
      <Card size="sm" className="border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileCheck2 className="size-4 text-primary" />
            <span>الملاحظات وشروط الدفع الافتراضية</span>
          </CardTitle>
          <CardDescription className="text-xs">
            النصوص والشروط الافتراضية التي تظهر في ذيل أوامر الشراء وفواتير التوريد.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">شروط السداد الافتراضية</Label>
            <Input
              value={settings.defaultPaymentTerms}
              onChange={(e) => setSettings({ ...settings, defaultPaymentTerms: e.target.value })}
              placeholder="مثال: سداد بعد 30 يوم من تاريخ استلام البضاعة ومطابقتها"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">ملاحظات الفاتورة والتسوية الافتراضية</Label>
            <Textarea
              value={settings.defaultNotes}
              onChange={(e) => setSettings({ ...settings, defaultNotes: e.target.value })}
              rows={3}
              placeholder="ملاحظات والتزامات الفاتورة والتوريد..."
              className="text-xs leading-relaxed"
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. Signature Block Customization */}
      <Card size="sm" className="border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <span>الاعتمادات ومربعات التوقيع والختم</span>
          </CardTitle>
          <CardDescription className="text-xs">
            تخصيص مسميات خانات التوقيع والاعتماد الرسمية أسفل الفاتورة وأمر الشراء.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 p-3 bg-muted/30 border border-border/50 rounded-xl">
            <div className="flex items-center gap-2">
              <Switch
                id="show-signature-block"
                checked={settings.showSignatureBlock}
                onCheckedChange={(checked) => setSettings({ ...settings, showSignatureBlock: checked })}
              />
              <Label htmlFor="show-signature-block" className="text-xs cursor-pointer">
                إظهار مربع التواقيع والاعتمادات الرسمية
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="show-company-stamp"
                checked={settings.showCompanyStamp}
                onCheckedChange={(checked) => setSettings({ ...settings, showCompanyStamp: checked })}
              />
              <Label htmlFor="show-company-stamp" className="text-xs cursor-pointer">
                تضمين خانة الختم الرسمي للمنشأة
              </Label>
            </div>
          </div>

          {settings.showSignatureBlock && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1">
                <Label className="text-xs">خانة التوقيع 1 (المشتريات)</Label>
                <Input
                  value={settings.signaturePurchasingTitle}
                  onChange={(e) => setSettings({ ...settings, signaturePurchasingTitle: e.target.value })}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">خانة التوقيع 2 (المالية / الإدارة)</Label>
                <Input
                  value={settings.signatureFinanceTitle}
                  onChange={(e) => setSettings({ ...settings, signatureFinanceTitle: e.target.value })}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">خانة التوقيع 3 (المستلم / المستودع)</Label>
                <Input
                  value={settings.signatureWarehouseTitle}
                  onChange={(e) => setSettings({ ...settings, signatureWarehouseTitle: e.target.value })}
                  className="text-xs h-9"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Action Bar at bottom */}
      <div className="flex justify-end pt-2">
        <Button onClick={() => handleSave()} disabled={saving} className="gap-2 px-6">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          <span>{saving ? "جاري الحفظ..." : "حفظ جميع الإعدادات"}</span>
        </Button>
      </div>

      {/* Visual Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 print:hidden">
          <DialogHeader className="border-b border-border pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Eye className="size-5 text-primary" />
                <DialogTitle className="text-base sm:text-lg font-bold">
                  معاينة: {AVAILABLE_PROCUREMENT_TEMPLATES.find((t) => t.id === previewTemplate)?.nameAr}
                </DialogTitle>
              </div>
              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  setSettings((s) => ({ ...s, defaultTemplate: previewTemplate }));
                  setPreviewOpen(false);
                }}
                className="gap-1.5 text-xs h-8"
              >
                <CheckCircle2 className="size-3.5" />
                تعيين كقالب افتراضي
              </Button>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              محاكاة كاملة لشكل ورقة الطباعة بمقاس A4 بالبيانات الافتراضية للمنشأة.
            </DialogDescription>
          </DialogHeader>

          <div className="my-2 p-4 sm:p-8 bg-slate-100 rounded-xl overflow-x-auto flex justify-center">
            <div className="w-full max-w-[794px] bg-white shadow-md rounded-sm p-6 sm:p-8 border border-slate-200">
              {renderPreviewComponent()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProcurementSettings;
