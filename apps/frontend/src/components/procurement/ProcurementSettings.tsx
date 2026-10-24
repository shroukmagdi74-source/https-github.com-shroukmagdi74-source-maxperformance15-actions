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
  Printer,
  Factory,
  Leaf,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
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
import { CommercialFactoryTemplate } from "./templates/CommercialFactoryTemplate";
import { CompactEcoHalfPageTemplate } from "./templates/CompactEcoHalfPageTemplate";
import { OfficialTaxTemplate } from "./templates/OfficialTaxTemplate";
import { ModernMinimalTemplate } from "./templates/ModernMinimalTemplate";
import { GoodsReceiptTemplate } from "./templates/GoodsReceiptTemplate";
import { ProcurementPrintStyles } from "./templates/ProcurementPrintStyles";

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
  commercial_factory: <Factory className="size-5 text-red-600" />,
  compact_eco: <Leaf className="size-5 text-emerald-600" />,
  official_tax: <ShieldCheck className="size-5 text-slate-800" />,
  modern_minimal: <Sparkles className="size-5 text-blue-600" />,
  goods_receipt: <Boxes className="size-5 text-amber-600" />,
};

const samplePreviewData: NormalizedProcurementData = {
  documentType: "PO",
  documentNumber: "PO-2026-001",
  documentDate: new Date().toISOString(),
  expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  status: "APPROVED",
  statusLabel: "معتمد للتوريد",
  companyName: "مصنع هونزو للملابس الرياضية",
  warehouseName: "المخزن الرئيسي",
  buyer: {
    name: "مصنع هونزو للملابس الرياضية",
    taxNumber: "300-998-877-665",
    crNumber: "1010998877",
    address: "شارع الصفا و المروة، جسر السويس، القاهرة، مصر",
    phone: "01012345678",
  },
  supplier: {
    id: "sup-001",
    code: "001",
    name: "مجموعة التوريدات الغذائية والملابس (مني مو)",
    phone: "01012345678",
    email: "supply@honzo.com",
    address: "منطقة المصانع، العاشر من رمضان، مصر",
    taxNumber: "998-112-445",
  },
  linkedReference: {
    type: "PI",
    number: "PI-2026-001",
  },
  items: [
    {
      id: "it-1",
      productName: "تيشيرت طعام قطن عالي الجودة",
      description: "المواصفات القياسية للتصنيع والتوريد",
      sku: "TSH-FOOD-01",
      quantity: 10,
      packagingUnit: "كرتونة",
      unitPrice: 100,
      totalPrice: 980,
    },
    {
      id: "it-2",
      productName: "خامات تغليف وتعبئة سكر",
      description: "أكياس تعبئة معقمة ومطابقة",
      sku: "PKG-SUGAR-05",
      quantity: 5,
      packagingUnit: "كيس",
      unitPrice: 45,
      totalPrice: 225,
    },
    {
      id: "it-3",
      productName: "مكرونة درجة أولى فاخرة",
      description: "باكتات توريد مخزني",
      sku: "MAC-PREM-08",
      quantity: 8,
      packagingUnit: "باكت",
      unitPrice: 30,
      totalPrice: 240,
    },
    {
      id: "it-4",
      productName: "شاي أسود معبأ للتجهيز",
      description: "علب توريد كبرى",
      sku: "TEA-BLK-12",
      quantity: 12,
      packagingUnit: "علبة",
      unitPrice: 75,
      totalPrice: 900,
    },
  ],
  financialSummary: {
    subtotal: 2345,
    discountAmount: 200,
    taxAmount: 328.3,
    shippingCost: 50,
    totalAmount: 2345,
    paidAmount: 0,
    remainingAmount: 2345,
  },
  notes: "يرجى التأكد من فحص الكميات ومطابقة الجودة المعتمدة قبل الاستلام النهائي والتوقيع.",
  paymentTerms: "سداد بعد 30 يوم من تاريخ اكتمال الفحص والاستلام",
  signatures: {
    purchasingTitle: "توقيع المسؤول (المدير المسؤول)",
    financeTitle: "اعتماد المدير المالي / الإدارة",
    warehouseTitle: "توقيع المورد (الاسم والتوقيع)",
    showStamp: true,
    showBlock: true,
  },
};

export const ProcurementSettings: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language !== "en";

  const [activeTab, setActiveTab] = useState<"templates" | "company" | "terms">("templates");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<ProcurementTemplateId>("commercial_factory");
  const [zoomScale, setZoomScale] = useState<number>(0.85);

  const [settings, setSettings] = useState<ProcurementSettingsData>({
    defaultTemplate: DEFAULT_PROCUREMENT_TEMPLATE,
    companyLegalName: "مصنع هونزو للملابس الرياضية",
    taxNumber: "300-998-877-665",
    crNumber: "1010998877",
    billingAddress: "شارع الصفا و المروة، جسر السويس، القاهرة، مصر",
    phone: "01012345678",
    email: "procurement@huinzo.com",
    defaultNotes: "يرجى التأكد من مطابقة الكميات والمواصفات القياسية المعتمدة قبل التوقيع والاستلام.",
    defaultPaymentTerms: "سداد بعد 30 يوم من تاريخ استلام البضاعة",
    signaturePurchasingTitle: "مسؤول المشتريات / المدير المسؤول",
    signatureFinanceTitle: "اعتماد المدير المالي / الإدارة",
    signatureWarehouseTitle: "توقيع واستلام المورد / المستودع",
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

  const handleSave = async (customData?: Partial<ProcurementSettingsData>) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    const payload = { ...settings, ...customData };
    try {
      const response = await apiClient.put<{ success: boolean; message?: string; data: ProcurementSettingsData }>(
        "/procurement/settings",
        payload
      );
      if (response.data?.data) {
        setSettings(response.data.data);
      }
      try {
        localStorage.setItem(PROCUREMENT_TEMPLATE_STORAGE_KEY, payload.defaultTemplate);
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
    setZoomScale(0.85);
    setPreviewOpen(true);
  };

  const handleDirectSetDefault = async (templateId: ProcurementTemplateId) => {
    setSettings((prev) => ({ ...prev, defaultTemplate: templateId }));
    await handleSave({ defaultTemplate: templateId });
  };

  const renderPreviewComponent = () => {
    const previewData: NormalizedProcurementData = {
      ...samplePreviewData,
      companyName: settings.companyLegalName || samplePreviewData.companyName,
      buyer: {
        ...samplePreviewData.buyer,
        name: settings.companyLegalName || samplePreviewData.buyer?.name,
        taxNumber: settings.taxNumber || samplePreviewData.buyer?.taxNumber,
        crNumber: settings.crNumber || samplePreviewData.buyer?.crNumber,
        address: settings.billingAddress || samplePreviewData.buyer?.address,
        phone: settings.phone || samplePreviewData.buyer?.phone,
      },
      notes: settings.defaultNotes || samplePreviewData.notes,
      paymentTerms: settings.defaultPaymentTerms || samplePreviewData.paymentTerms,
      signatures: {
        purchasingTitle: settings.signaturePurchasingTitle,
        financeTitle: settings.signatureFinanceTitle,
        warehouseTitle: settings.signatureWarehouseTitle,
        showStamp: settings.showCompanyStamp,
        showBlock: settings.showSignatureBlock,
      },
    };

    switch (previewTemplate) {
      case "commercial_factory":
        return <CommercialFactoryTemplate data={previewData} isRtl={isRtl} />;
      case "compact_eco":
        return <CompactEcoHalfPageTemplate data={previewData} isRtl={isRtl} />;
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

  const activeTemplateObj =
    AVAILABLE_PROCUREMENT_TEMPLATES.find((t) => t.id === settings.defaultTemplate) ||
    AVAILABLE_PROCUREMENT_TEMPLATES[0];

  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Hidden print renderer for sample test print */}
      <div className="hidden print:block">
        <ProcurementPrintStyles
          paperSize={
            AVAILABLE_PROCUREMENT_TEMPLATES.find((t) => t.id === previewTemplate)?.paperSize || "A4"
          }
        />
        {renderPreviewComponent()}
      </div>

      {/* Top Header Cockpit */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/70 print:hidden">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Printer className="size-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                قوالب وإعدادات طباعة المشتريات
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                تخصيص نماذج فواتير وأوامر الشراء (A4 و نصف ورقة A5 الموفرة)، بيانات الترويسة الضريبية، والاعتمادات.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenPreview(settings.defaultTemplate)}
            className="gap-1.5 h-9 text-xs"
          >
            <Eye className="size-4 text-primary" />
            <span>معاينة القالب الحالي</span>
          </Button>
          <Button onClick={() => handleSave()} disabled={saving} className="gap-2 h-9">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>{saving ? "جاري الحفظ..." : "حفظ التغييرات"}</span>
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-destructive bg-destructive/10 border border-destructive/20 rounded-xl text-xs print:hidden">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-3 text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl text-xs print:hidden">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Navigation Tabs (Cockpit Switcher) */}
      <div className="flex items-center gap-2 border-b border-border pb-1 print:hidden overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("templates")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "templates"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Printer className="size-4" />
          <span>نماذج وقوالب الطباعة ({AVAILABLE_PROCUREMENT_TEMPLATES.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("company")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "company"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Building2 className="size-4" />
          <span>بيانات الترويسة والضرائب</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("terms")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "terms"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <FileCheck2 className="size-4" />
          <span>الملاحظات والاعتمادات الرسمية</span>
        </button>
      </div>

      {/* TAB 1: TEMPLATE CARDS & SELECTION */}
      {activeTab === "templates" && (
        <div className="space-y-4 print:hidden">
          {/* Active Template Banner */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
                {templateIcons[settings.defaultTemplate]}
              </div>
              <div>
                <div className="text-[11px] text-slate-300 font-medium">القالب الافتراضي المعتمد حالياً:</div>
                <div className="text-base font-bold flex items-center gap-2">
                  <span>{activeTemplateObj.nameAr}</span>
                  <Badge variant="secondary" className="text-[10px] bg-white/20 text-white border-none">
                    {activeTemplateObj.paperSizeLabelAr}
                  </Badge>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleOpenPreview(settings.defaultTemplate)}
              className="gap-1.5 text-xs h-8 bg-white text-slate-900 hover:bg-slate-100 font-semibold"
            >
              <Eye className="size-3.5" />
              معاينة وتكبير القالب المعتمد
            </Button>
          </div>

          {/* Grid of Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_PROCUREMENT_TEMPLATES.map((tmpl) => {
              const isSelected = tmpl.id === settings.defaultTemplate;
              return (
                <div
                  key={tmpl.id}
                  className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                      : "border-border/80 bg-card hover:border-primary/40 hover:shadow-xs"
                  }`}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="size-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${tmpl.accentColor || "#2563EB"}15` }}
                        >
                          {templateIcons[tmpl.id]}
                        </div>
                        <Badge
                          variant={tmpl.isEco ? "default" : "outline"}
                          className={`text-[10px] px-2 py-0.5 ${
                            tmpl.isEco ? "bg-emerald-600 hover:bg-emerald-700" : ""
                          }`}
                        >
                          {tmpl.paperSizeLabelAr}
                        </Badge>
                      </div>

                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                          <Check className="size-3.5" />
                          القالب الافتراضي
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">{tmpl.badgeAr}</span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-bold text-sm text-foreground mt-2">{tmpl.nameAr}</h3>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed line-clamp-3">
                      {tmpl.descriptionAr}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 pt-4 mt-4 border-t border-border/60">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenPreview(tmpl.id)}
                      className="gap-1 text-xs h-8 flex-1"
                    >
                      <Eye className="size-3.5" />
                      معاينة حية
                    </Button>

                    <Button
                      variant={isSelected ? "secondary" : "default"}
                      size="sm"
                      disabled={isSelected || saving}
                      onClick={() => handleDirectSetDefault(tmpl.id)}
                      className="gap-1 text-xs h-8 flex-1"
                    >
                      {isSelected ? (
                        <>
                          <Check className="size-3.5 text-primary" />
                          <span>معتمد</span>
                        </>
                      ) : (
                        <span>تعيين كافتراضي</span>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: COMPANY & TAX HEADER */}
      {activeTab === "company" && (
        <Card className="print:hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              <span>بيانات المنشأة والترويسة الضريبية</span>
            </CardTitle>
            <CardDescription className="text-xs">
              تظهر هذه البيانات رسمياً في ترويسة جميع فواتير الشراء وأوامر التوريد المطبوعة.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="company-legal-name" className="text-xs font-semibold">
                  الاسم التجاري / القانوني للمنشأة
                </Label>
                <Input
                  id="company-legal-name"
                  value={settings.companyLegalName}
                  onChange={(e) => setSettings({ ...settings, companyLegalName: e.target.value })}
                  placeholder="مثال: مصنع هونزو للملابس الرياضية"
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tax-number" className="text-xs font-semibold">
                  رقم التسجيل الضريبي (VAT ID)
                </Label>
                <Input
                  id="tax-number"
                  value={settings.taxNumber}
                  onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                  placeholder="مثال: 300-998-877-665"
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cr-number" className="text-xs font-semibold">
                  رقم السجل التجاري (CR Number)
                </Label>
                <Input
                  id="cr-number"
                  value={settings.crNumber}
                  onChange={(e) => setSettings({ ...settings, crNumber: e.target.value })}
                  placeholder="مثال: 1010998877"
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold">
                  رقم الهاتف المعتمد
                </Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="مثال: 01012345678"
                  className="text-xs h-9 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="billing-address" className="text-xs font-semibold">
                عنوان المقر الرئيسي / جهة الاستلام الرسمية
              </Label>
              <Input
                id="billing-address"
                value={settings.billingAddress}
                onChange={(e) => setSettings({ ...settings, billingAddress: e.target.value })}
                placeholder="مثال: شارع الصفا و المروة، جسر السويس، القاهرة، مصر"
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">
                البريد الإلكتروني لإدارة المشتريات
              </Label>
              <Input
                id="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="procurement@huinzo.com"
                className="text-xs h-9 font-mono"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: TERMS & SIGNATURES */}
      {activeTab === "terms" && (
        <Card className="print:hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileCheck2 className="size-5 text-primary" />
              <span>الملاحظات والاعتمادات الرسمية</span>
            </CardTitle>
            <CardDescription className="text-xs">
              النصوص والشروط الافتراضية وخانات التواقيع التي تُطبع أسفل المستندات.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="default-payment-terms" className="text-xs font-semibold">
                شروط السداد الافتراضية
              </Label>
              <Input
                id="default-payment-terms"
                value={settings.defaultPaymentTerms}
                onChange={(e) => setSettings({ ...settings, defaultPaymentTerms: e.target.value })}
                placeholder="مثال: سداد بعد 30 يوم من تاريخ استلام البضاعة"
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="default-notes" className="text-xs font-semibold">
                ملاحظات الفاتورة والتسوية الافتراضية
              </Label>
              <Textarea
                id="default-notes"
                rows={3}
                value={settings.defaultNotes}
                onChange={(e) => setSettings({ ...settings, defaultNotes: e.target.value })}
                placeholder="مثال: يرجى التأكد من مطابقة الكميات قبل الاستلام..."
                className="text-xs leading-relaxed"
              />
            </div>

            {/* Signature Switches */}
            <div className="pt-2 border-t border-border/70 space-y-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="show-signature-block"
                  checked={settings.showSignatureBlock}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, showSignatureBlock: checked })
                  }
                />
                <Label htmlFor="show-signature-block" className="text-xs cursor-pointer font-medium">
                  تضمين جدول الاعتمادات والتواقيع أسفل الورقة
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="show-company-stamp"
                  checked={settings.showCompanyStamp}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, showCompanyStamp: checked })
                  }
                />
                <Label htmlFor="show-company-stamp" className="text-xs cursor-pointer font-medium">
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
                    onChange={(e) =>
                      setSettings({ ...settings, signaturePurchasingTitle: e.target.value })
                    }
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">خانة التوقيع 2 (المالية / الإدارة)</Label>
                  <Input
                    value={settings.signatureFinanceTitle}
                    onChange={(e) =>
                      setSettings({ ...settings, signatureFinanceTitle: e.target.value })
                    }
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">خانة التوقيع 3 (المستلم / المستودع)</Label>
                  <Input
                    value={settings.signatureWarehouseTitle}
                    onChange={(e) =>
                      setSettings({ ...settings, signatureWarehouseTitle: e.target.value })
                    }
                    className="text-xs h-9"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Save Action Bar at bottom */}
      <div className="flex justify-end pt-2 print:hidden">
        <Button onClick={() => handleSave()} disabled={saving} className="gap-2 px-6">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          <span>{saving ? "جاري الحفظ..." : "حفظ جميع الإعدادات"}</span>
        </Button>
      </div>

      {/* Visual Preview Modal with Vector Zoom & No-Squish Container */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 print:hidden">
          <DialogHeader className="border-b border-border pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Eye className="size-5 text-primary" />
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold">
                    معاينة:{" "}
                    {AVAILABLE_PROCUREMENT_TEMPLATES.find((t) => t.id === previewTemplate)?.nameAr}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    ورقة الطباعة بدقة المتجه الرسمية بدون أي تشوه في الأعمدة أو تداخل في النصوص.
                  </DialogDescription>
                </div>
              </div>

              {/* Action Buttons & Zoom Bar */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center bg-muted/60 border border-border rounded-lg p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setZoomScale((s) => Math.max(0.4, Number((s - 0.15).toFixed(2))))}
                    className="p-1.5 hover:bg-background rounded text-muted-foreground hover:text-foreground"
                    title="تصغير"
                  >
                    <ZoomOut className="size-3.5" />
                  </button>
                  <span className="px-2 font-mono text-[11px] font-semibold">
                    {Math.round(zoomScale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomScale((s) => Math.min(1.4, Number((s + 0.15).toFixed(2))))}
                    className="p-1.5 hover:bg-background rounded text-muted-foreground hover:text-foreground"
                    title="تكبير"
                  >
                    <ZoomIn className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale(0.85)}
                    className="px-2 py-1 text-[10px] font-medium hover:bg-background rounded text-muted-foreground"
                    title="إعادة ضبط الحجم"
                  >
                    <Maximize2 className="size-3 inline me-1" />
                    ضبط
                  </button>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.print()}
                  className="gap-1.5 text-xs h-8"
                  title="طباعة ورقة تجريبية على الطابعة"
                >
                  <Printer className="size-3.5" />
                  طباعة تجريبية
                </Button>

                <Button
                  size="sm"
                  variant="default"
                  onClick={async () => {
                    await handleDirectSetDefault(previewTemplate);
                    setPreviewOpen(false);
                  }}
                  className="gap-1.5 text-xs h-8"
                >
                  <CheckCircle2 className="size-3.5" />
                  اعتماد كقالب افتراضي
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Scaled Preview Frame */}
          <div className="my-2 p-3 sm:p-6 bg-slate-200/80 rounded-xl overflow-x-auto overflow-y-auto flex justify-center min-h-[460px]">
            <div
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: "top center",
                width: "794px",
                minWidth: "794px",
                marginBottom: zoomScale < 1 ? `-${Math.round((1 - zoomScale) * 850)}px` : 0,
              }}
              className="bg-white shadow-2xl rounded-sm transition-transform duration-150 ease-out border border-slate-300"
            >
              {renderPreviewComponent()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProcurementSettings;
