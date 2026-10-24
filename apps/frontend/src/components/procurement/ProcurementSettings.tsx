import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Save,
  ShieldCheck,
  Sparkles,
  Boxes,
  Building2,
  Receipt,
  FileCheck2,
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
  MapPin,
  Phone,
  Mail,
  CreditCard,
  FileText,
} from "lucide-react";
import { apiClient } from "../../services/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import CompanyContext from "../../contexts/CompanyContext";

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
  commercial_factory: <Factory className="size-4 text-red-600" />,
  compact_eco: <Leaf className="size-4 text-emerald-600" />,
  official_tax: <ShieldCheck className="size-4 text-slate-800" />,
  modern_minimal: <Sparkles className="size-4 text-blue-600" />,
  goods_receipt: <Boxes className="size-4 text-amber-600" />,
};

const samplePreviewData: NormalizedProcurementData = {
  documentType: "PO",
  documentNumber: "PO-2026-001",
  documentDate: new Date().toISOString(),
  expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  status: "APPROVED",
  statusLabel: "معتمد للتوريد",
  companyName: "مؤسسة التوريدات التجارية",
  warehouseName: "المستودع الرئيسي",
  buyer: {
    name: "مؤسسة التوريدات التجارية",
    taxNumber: "300-123-456-789",
    crNumber: "1010123456",
    address: "المنطقة الصناعية، القاهرة، مصر",
    phone: "01000000000",
  },
  supplier: {
    id: "sup-001",
    code: "001",
    name: "مجموعة التوريدات العامة المعتمدة",
    phone: "01100000000",
    email: "supply@example.com",
    address: "منطقة التوريدات المركزية",
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

  const companyContext = React.useContext(CompanyContext);
  const company = companyContext?.company;
  const initialCompanyName = company?.name || "منصة MaxP للتجارة المتكاملة";
  const initialAddress = (company as any)?.address || "";
  const initialPhone = (company as any)?.phone || "";
  const initialEmail = company?.email || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Active Template being viewed live on the canvas
  const [activeTemplate, setActiveTemplate] = useState<ProcurementTemplateId>("commercial_factory");
  const [zoomScale, setZoomScale] = useState<number>(0.85);
  const [controlsTab, setControlsTab] = useState<"templates" | "company" | "terms">("templates");

  const [settings, setSettings] = useState<ProcurementSettingsData>({
    defaultTemplate: DEFAULT_PROCUREMENT_TEMPLATE,
    companyLegalName: initialCompanyName,
    taxNumber: "",
    crNumber: "",
    billingAddress: initialAddress,
    phone: initialPhone,
    email: initialEmail,
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
        const fetched = response.data.data;
        setSettings({
          ...fetched,
          companyLegalName: fetched.companyLegalName || initialCompanyName,
          billingAddress: fetched.billingAddress || initialAddress,
          phone: fetched.phone || initialPhone,
          email: fetched.email || initialEmail,
        });
        if (response.data.data.defaultTemplate) {
          setActiveTemplate(response.data.data.defaultTemplate);
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

  const handleSetDefault = async (templateId: ProcurementTemplateId) => {
    setActiveTemplate(templateId);
    setSettings((prev) => ({ ...prev, defaultTemplate: templateId }));
    await handleSave({ defaultTemplate: templateId });
  };

  const handlePrintTest = () => {
    window.print();
  };

  // Live real-time preview data reflecting all user inputs immediately
  const livePreviewData: NormalizedProcurementData = {
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

  const renderLiveTemplate = () => {
    switch (activeTemplate) {
      case "commercial_factory":
        return <CommercialFactoryTemplate data={livePreviewData} isRtl={isRtl} />;
      case "compact_eco":
        return <CompactEcoHalfPageTemplate data={livePreviewData} isRtl={isRtl} />;
      case "modern_minimal":
        return <ModernMinimalTemplate data={livePreviewData} isRtl={isRtl} />;
      case "goods_receipt":
        return <GoodsReceiptTemplate data={livePreviewData} isRtl={isRtl} />;
      case "official_tax":
      default:
        return <OfficialTaxTemplate data={livePreviewData} isRtl={isRtl} />;
    }
  };

  const currentTmplObj =
    AVAILABLE_PROCUREMENT_TEMPLATES.find((t) => t.id === activeTemplate) ||
    AVAILABLE_PROCUREMENT_TEMPLATES[0];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">جاري تحميل استوديو قوالب المشتريات...</p>
      </div>
    );
  }

  return (
    <div
      className="p-3 sm:p-5 lg:p-6 max-w-[1700px] mx-auto space-y-4 font-sans print:p-0"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Hidden print stylesheet and root for exact paper printing */}
      <div className="procurement-print-root hidden print:block">
        <ProcurementPrintStyles paperSize={currentTmplObj.paperSize} />
        {renderLiveTemplate()}
      </div>

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/70 print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Printer className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-foreground">
                استوديو قوالب وطباعة فواتير المشتريات
              </h1>
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 font-semibold">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                معاينة مباشرة في الوقت الفعلي
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              اختر القالب، عدل بيانات الترويسة والاعتمادات، وشاهد النتيجة الحقيقية للورقة أمامك مباشرة قبل الطباعة.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintTest}
            className="gap-1.5 h-9 text-xs"
            title="طباعة تجريبية فورية للورقة الظاهرة أمامك"
          >
            <Printer className="size-3.5" />
            <span>طباعة تجريبية</span>
          </Button>
          <Button
            onClick={() => handleSave()}
            disabled={saving}
            className="gap-1.5 h-9 text-xs font-semibold"
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
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

      {/* MAIN STUDIO GRID: Split Screen (Side-by-Side: Controls Cockpit on Right + Live Canvas on Left) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start print:hidden">
        {/* PANEL 1: CONTROLS & TEMPLATES PICKER (Right on RTL, 4 Cols on lg) */}
        <div className="lg:col-span-4 space-y-3">
          {/* Subtabs for Controls */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border text-xs">
            <button
              type="button"
              onClick={() => setControlsTab("templates")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                controlsTab === "templates"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Printer className="size-3.5" />
              <span>القوالب (5)</span>
            </button>
            <button
              type="button"
              onClick={() => setControlsTab("company")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                controlsTab === "company"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="size-3.5" />
              <span>الترويسة</span>
            </button>
            <button
              type="button"
              onClick={() => setControlsTab("terms")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                controlsTab === "terms"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileCheck2 className="size-3.5" />
              <span>الشروط</span>
            </button>
          </div>

          {/* SUBTAB 1: TEMPLATE CARDS */}
          {controlsTab === "templates" && (
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold text-muted-foreground uppercase px-1">
                اختر القالب لتحديث الورقة المباشرة فوراً:
              </div>

              {AVAILABLE_PROCUREMENT_TEMPLATES.map((tmpl) => {
                const isActive = tmpl.id === activeTemplate;
                const isDefault = tmpl.id === settings.defaultTemplate;

                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setActiveTemplate(tmpl.id)}
                    className={`cursor-pointer rounded-xl border p-3 transition-all relative ${
                      isActive
                        ? "border-primary bg-primary/5 shadow-xs ring-2 ring-primary/20"
                        : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="size-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${tmpl.accentColor || "#2563EB"}15` }}
                        >
                          {templateIcons[tmpl.id]}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground leading-tight">
                            {tmpl.nameAr}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                            {tmpl.descriptionAr}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge
                          variant={tmpl.isEco ? "default" : "outline"}
                          className={`text-[9px] px-1.5 py-0 h-4 ${
                            tmpl.isEco ? "bg-emerald-600 hover:bg-emerald-700" : ""
                          }`}
                        >
                          {tmpl.paperSizeLabelAr}
                        </Badge>
                        {isDefault && (
                          <span className="text-[9px] font-bold text-primary flex items-center gap-0.5">
                            <Check className="size-2.5" />
                            الافتراضي
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/50 text-[11px]">
                      <span className="text-[10px] text-muted-foreground">{tmpl.badgeAr}</span>
                      <Button
                        size="sm"
                        variant={isDefault ? "secondary" : "ghost"}
                        disabled={isDefault || saving}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(tmpl.id);
                        }}
                        className="h-6 text-[10px] px-2 py-0 gap-1"
                      >
                        {isDefault ? (
                          <>
                            <Check className="size-3 text-primary" />
                            <span>معتمد كافتراضي</span>
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
          )}

          {/* SUBTAB 2: COMPANY HEADER DATA */}
          {controlsTab === "company" && (
            <div className="p-3 bg-card border border-border rounded-xl space-y-3 text-xs">
              <div className="text-[11px] font-bold text-muted-foreground uppercase pb-1 border-b border-border">
                بيانات الترويسة الرسمية (تتحدث فوراً على الورقة)
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-start block">الاسم التجاري للمنشأة</Label>
                <Input
                  value={settings.companyLegalName}
                  onChange={(e) => setSettings({ ...settings, companyLegalName: e.target.value })}
                  placeholder="مثال: مصنع هونزو للملابس الرياضية"
                  className="h-8 text-xs text-start"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-start block">الرقم الضريبي (VAT)</Label>
                  <Input
                    value={settings.taxNumber}
                    onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                    placeholder="300-998-877-665"
                    className="h-8 text-xs tabular-nums text-start"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-start block">السجل التجاري (CR)</Label>
                  <Input
                    value={settings.crNumber}
                    onChange={(e) => setSettings({ ...settings, crNumber: e.target.value })}
                    placeholder="1010998877"
                    className="h-8 text-xs tabular-nums text-start"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-start block">عنوان المقر الرئيسي / الاستلام</Label>
                <Input
                  value={settings.billingAddress}
                  onChange={(e) => setSettings({ ...settings, billingAddress: e.target.value })}
                  placeholder="شارع الصفا والمروة، جسر السويس، القاهرة"
                  className="h-8 text-xs text-start"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-start block">رقم الهاتف</Label>
                  <Input
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    placeholder="01012345678"
                    className="h-8 text-xs tabular-nums text-start"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-start block">البريد الإلكتروني</Label>
                  <Input
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    placeholder="procurement@huinzo.com"
                    className="h-8 text-xs text-start"
                  />
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => handleSave()}
                disabled={saving}
                className="w-full h-8 text-xs gap-1 mt-2"
              >
                <Save className="size-3" />
                <span>حفظ بيانات الترويسة</span>
              </Button>
            </div>
          )}

          {/* SUBTAB 3: TERMS & SIGNATURES */}
          {controlsTab === "terms" && (
            <div className="p-3 bg-card border border-border rounded-xl space-y-3 text-xs">
              <div className="text-[11px] font-bold text-muted-foreground uppercase pb-1 border-b border-border">
                شروط السداد وخانات التوقيع المعتمدة
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-start block">شروط الدفع الافتراضية</Label>
                <Input
                  value={settings.defaultPaymentTerms}
                  onChange={(e) => setSettings({ ...settings, defaultPaymentTerms: e.target.value })}
                  placeholder="سداد بعد 30 يوم من تاريخ استلام البضاعة"
                  className="h-8 text-xs text-start"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-start block">نص الملاحظات الافتراضية</Label>
                <Textarea
                  rows={2}
                  value={settings.defaultNotes}
                  onChange={(e) => setSettings({ ...settings, defaultNotes: e.target.value })}
                  placeholder="يرجى فحص ومطابقة الكميات قبل الاستلام والتوقيع."
                  className="text-xs leading-relaxed text-start"
                />
              </div>

              <div className="pt-2 border-t border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sw-block" className="text-xs cursor-pointer">
                    تضمين جدول التواقيع والاعتمادات
                  </Label>
                  <Switch
                    id="sw-block"
                    checked={settings.showSignatureBlock}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, showSignatureBlock: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="sw-stamp" className="text-xs cursor-pointer">
                    تضمين خانة الختم الرسمي
                  </Label>
                  <Switch
                    id="sw-stamp"
                    checked={settings.showCompanyStamp}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, showCompanyStamp: checked })
                    }
                  />
                </div>
              </div>

              {settings.showSignatureBlock && (
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <div className="space-y-0.5">
                    <Label className="text-[10px] text-muted-foreground text-start block">خانة 1 (المشتريات)</Label>
                    <Input
                      value={settings.signaturePurchasingTitle}
                      onChange={(e) =>
                        setSettings({ ...settings, signaturePurchasingTitle: e.target.value })
                      }
                      className="h-7 text-xs text-start"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <Label className="text-[10px] text-muted-foreground text-start block">خانة 2 (المالية / الإدارة)</Label>
                    <Input
                      value={settings.signatureFinanceTitle}
                      onChange={(e) =>
                        setSettings({ ...settings, signatureFinanceTitle: e.target.value })
                      }
                      className="h-7 text-xs text-start"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <Label className="text-[10px] text-muted-foreground text-start block">خانة 3 (المستلم / المستودع)</Label>
                    <Input
                      value={settings.signatureWarehouseTitle}
                      onChange={(e) =>
                        setSettings({ ...settings, signatureWarehouseTitle: e.target.value })
                      }
                      className="h-7 text-xs text-start"
                    />
                  </div>
                </div>
              )}

              <Button
                size="sm"
                onClick={() => handleSave()}
                disabled={saving}
                className="w-full h-8 text-xs gap-1 mt-2"
              >
                <Save className="size-3" />
                <span>حفظ الشروط والتواقيع</span>
              </Button>
            </div>
          )}
        </div>

        {/* PANEL 2: LIVE DRAFTING CANVAS (Left on RTL, 8 Cols on lg) */}
        <div className="lg:col-span-8 space-y-3">
          {/* Canvas Floating Top Toolbar */}
          <div className="bg-card border border-border rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                {templateIcons[activeTemplate]}
                <span>{currentTmplObj.nameAr}</span>
              </div>
              <Badge
                variant={currentTmplObj.isEco ? "default" : "secondary"}
                className={`text-[10px] px-2 py-0 h-5 ${
                  currentTmplObj.isEco ? "bg-emerald-600 hover:bg-emerald-700" : ""
                }`}
              >
                {currentTmplObj.paperSizeLabelAr}
              </Badge>
            </div>

            {/* Zoom & Action Controls */}
            <div className="flex items-center gap-2">
              {/* Zoom Buttons */}
              <div className="flex items-center bg-muted/70 border border-border rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setZoomScale((s) => Math.max(0.4, Number((s - 0.1).toFixed(2))))}
                  className="p-1 hover:bg-background rounded text-muted-foreground hover:text-foreground"
                  title="تصغير"
                >
                  <ZoomOut className="size-3" />
                </button>
                <span className="px-2 font-mono text-[11px] font-semibold tabular-nums">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale((s) => Math.min(1.3, Number((s + 0.1).toFixed(2))))}
                  className="p-1 hover:bg-background rounded text-muted-foreground hover:text-foreground"
                  title="تكبير"
                >
                  <ZoomIn className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale(0.85)}
                  className="px-2 py-0.5 text-[10px] font-medium hover:bg-background rounded text-muted-foreground"
                  title="إعادة ضبط المقياس"
                >
                  <Maximize2 className="size-2.5 inline me-1" />
                  ملائمة
                </button>
              </div>

              {/* Instant Print Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrintTest}
                className="gap-1 h-7 text-xs px-2.5"
                title="طباعة الورقة الظاهرة الآن"
              >
                <Printer className="size-3 text-primary" />
                <span>طباعة عينة</span>
              </Button>

              {activeTemplate !== settings.defaultTemplate && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleSetDefault(activeTemplate)}
                  className="gap-1 h-7 text-xs px-2.5"
                >
                  <Check className="size-3" />
                  <span>اعتماد كافتراضي</span>
                </Button>
              )}
            </div>
          </div>

          {/* Interactive Live Canvas Board (No Popups!) */}
          <div className="p-4 sm:p-8 bg-slate-200/90 dark:bg-slate-900/60 rounded-2xl border border-slate-300 dark:border-slate-800 overflow-x-auto flex justify-center min-h-[640px] shadow-inner">
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
              {renderLiveTemplate()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcurementSettings;
