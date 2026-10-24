import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  ChevronDown,
  Check,
  Eye,
  Printer,
  Sparkles,
  Boxes,
  ShieldCheck,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  PROCUREMENT_TEMPLATE_STORAGE_KEY,
  NormalizedProcurementData,
} from "./types";
import { OfficialTaxTemplate } from "./OfficialTaxTemplate";
import { ModernMinimalTemplate } from "./ModernMinimalTemplate";
import { GoodsReceiptTemplate } from "./GoodsReceiptTemplate";

interface TemplateSelectorDropdownProps {
  selectedTemplate: ProcurementTemplateId;
  onSelectTemplate: (templateId: ProcurementTemplateId) => void;
  data?: NormalizedProcurementData;
  isRtl?: boolean;
}

const templateIcons: Record<ProcurementTemplateId, React.ReactNode> = {
  official_tax: <ShieldCheck className="size-4 text-emerald-600" />,
  modern_minimal: <Sparkles className="size-4 text-blue-600" />,
  goods_receipt: <Boxes className="size-4 text-amber-600" />,
};

export const TemplateSelectorDropdown: React.FC<TemplateSelectorDropdownProps> = ({
  selectedTemplate,
  onSelectTemplate,
  data,
  isRtl = true,
}) => {
  const navigate = useNavigate();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<ProcurementTemplateId>(selectedTemplate);

  const currentOption =
    AVAILABLE_PROCUREMENT_TEMPLATES.find((t) => t.id === selectedTemplate) ||
    AVAILABLE_PROCUREMENT_TEMPLATES[0];

  const handleSelect = (templateId: ProcurementTemplateId) => {
    onSelectTemplate(templateId);
    try {
      localStorage.setItem(PROCUREMENT_TEMPLATE_STORAGE_KEY, templateId);
    } catch (e) {
      console.warn("Could not save template preference:", e);
    }
  };

  const handleOpenPreview = (templateId: ProcurementTemplateId, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setPreviewTemplate(templateId);
    setPreviewOpen(true);
  };

  const handlePrintCurrent = () => {
    window.print();
  };

  const renderPreviewContent = () => {
    if (!data) return null;
    switch (previewTemplate) {
      case "modern_minimal":
        return <ModernMinimalTemplate data={data} isRtl={isRtl} />;
      case "goods_receipt":
        return <GoodsReceiptTemplate data={data} isRtl={isRtl} />;
      case "official_tax":
      default:
        return <OfficialTaxTemplate data={data} isRtl={isRtl} />;
    }
  };

  return (
    <>
      <div className="inline-flex items-center gap-1.5 print:hidden">
        {/* Template Selector Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-9 px-3 border-border/80 hover:bg-accent/40 font-medium text-xs text-foreground"
              title="اختر قالب طباعة الفاتورة أو أمر الشراء"
            >
              {templateIcons[selectedTemplate]}
              <span className="hidden sm:inline text-muted-foreground">قالب الطباعة:</span>
              <span className="font-semibold text-foreground max-w-[140px] truncate">
                {currentOption.nameAr}
              </span>
              <ChevronDown className="size-3.5 text-muted-foreground opacity-70" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80 p-2 space-y-1">
            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-bold text-foreground flex items-center justify-between">
              <span>نماذج وقوالب الطباعة</span>
              <Badge variant="outline" className="text-[10px] font-normal">
                {AVAILABLE_PROCUREMENT_TEMPLATES.length} قوالب جاهزة
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {AVAILABLE_PROCUREMENT_TEMPLATES.map((tmpl) => {
              const isSelected = tmpl.id === selectedTemplate;
              return (
                <DropdownMenuItem
                  key={tmpl.id}
                  onClick={() => handleSelect(tmpl.id)}
                  className={`p-2 rounded-lg cursor-pointer flex flex-col items-stretch gap-1 transition-colors ${
                    isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/70"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {templateIcons[tmpl.id]}
                      <span className="font-bold text-xs text-foreground">
                        {tmpl.nameAr}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant={isSelected ? "default" : "secondary"}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {tmpl.badgeAr}
                      </Badge>
                      {isSelected && <Check className="size-3.5 text-primary" />}
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-normal line-clamp-2 ps-6">
                    {tmpl.descriptionAr}
                  </p>

                  {data && (
                    <div className="flex justify-end pt-1 ps-6">
                      <button
                        type="button"
                        onClick={(e) => handleOpenPreview(tmpl.id, e)}
                        className="text-[10px] font-medium text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <Eye className="size-3" />
                        معاينة سريعة للورقة
                      </button>
                    </div>
                  )}
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator />

            {/* Quick Link to Dedicated Settings Page */}
            <DropdownMenuItem
              onClick={() => navigate("/procurement/settings")}
              className="p-2 rounded-lg cursor-pointer flex items-center justify-between text-xs text-primary hover:bg-primary/10 font-semibold"
            >
              <div className="flex items-center gap-2">
                <Settings className="size-3.5 text-primary" />
                <span>إعدادات وتخصيص القوالب والترويسة</span>
              </div>
              <ChevronLeft className="size-3.5 text-muted-foreground" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Primary Print Button */}
        <Button
          size="sm"
          variant="default"
          onClick={handlePrintCurrent}
          className="gap-1.5 h-9 font-semibold shadow-xs"
        >
          <Printer className="size-4" />
          <span>طباعة</span>
        </Button>
      </div>

      {/* Quick Visual Preview Dialog (Screen only) */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 print:hidden">
          <DialogHeader className="border-b border-border pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                <DialogTitle className="text-base sm:text-lg font-bold">
                  معاينة قالب الطباعة:{" "}
                  {AVAILABLE_PROCUREMENT_TEMPLATES.find((t) => t.id === previewTemplate)?.nameAr}
                </DialogTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    handleSelect(previewTemplate);
                    setPreviewOpen(false);
                    setTimeout(() => window.print(), 100);
                  }}
                  className="gap-1.5 text-xs h-8"
                >
                  <Printer className="size-3.5" />
                  اعتماد وطباعة فورية
                </Button>
              </div>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              هكذا ستظهر الورقة المطبوعة بمقاس A4 الرسمي عند الإرسال للطابعة أو الحفظ كـ PDF.
            </DialogDescription>
          </DialogHeader>

          {/* Render container with realistic A4 simulation */}
          <div className="my-2 p-4 sm:p-8 bg-slate-100 rounded-xl overflow-x-auto flex justify-center">
            <div className="w-full max-w-[794px] bg-white shadow-md rounded-sm p-6 sm:p-8 border border-slate-200">
              {renderPreviewContent()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
