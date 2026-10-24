import React from "react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { AgencyClient, HybridType, PricingModel, PRICING_MODEL_LABELS } from "./types";

interface AgencyClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingClient: AgencyClient | null;
  clientForm: {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    pricingModel: PricingModel;
    baseRetainer: number;
    pricingRate: number;
    feePerOrder: number;
    feePerItem: number;
    hybridType: HybridType;
    monthlyBudget: number;
    currentSpend: number;
    monthlySales: number;
    monthlyOrders: number;
    monthlyUnits: number;
    isOffPlatform: boolean;
    adAccountId: string;
    status: "active" | "lead" | "paused" | "completed";
    notes: string;
  };
  onFormChange: (data: any) => void;
  onSave: () => void;
  currency: string;
}

export const AgencyClientDialog: React.FC<AgencyClientDialogProps> = ({
  open,
  onOpenChange,
  editingClient,
  clientForm,
  onFormChange,
  onSave,
  currency,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-xl max-h-[90dvh] flex flex-col p-0 overflow-hidden"
        dir="rtl"
      >
        <DialogHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/20 shrink-0">
          <DialogTitle className="font-black text-base sm:text-lg text-foreground">
            {editingClient ? "تعديل بيانات العميل ونموذج التسعير" : "إضافة عميل وكالة جديد"}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto p-4 sm:p-5 flex-1 space-y-4 text-xs">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
            <div className="sm:col-span-2">
              <Label className="text-xs font-bold">اسم العميل أو العلامة التجارية *</Label>
              <Input
                className="mt-1 h-10 sm:h-9 text-base sm:text-xs rounded-xl"
                placeholder="مثال: براند قمة الأناقة"
                value={clientForm.name}
                onChange={(e) => onFormChange({ ...clientForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-bold">الشخص المسؤول (Contact Person)</Label>
              <Input
                className="mt-1 h-10 sm:h-9 text-base sm:text-xs rounded-xl"
                placeholder="أحمد ممدوح"
                value={clientForm.contactPerson}
                onChange={(e) =>
                  onFormChange({ ...clientForm, contactPerson: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-xs font-bold">رقم الهاتف / الواتساب</Label>
              <Input
                className="mt-1 h-10 sm:h-9 text-base sm:text-xs font-mono rounded-xl tabular-nums"
                dir="ltr"
                placeholder="010xxxxxxxx"
                value={clientForm.phone}
                onChange={(e) => onFormChange({ ...clientForm, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Pricing Model Selector */}
          <div className="p-3.5 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
            <div>
              <Label className="text-xs font-black text-primary">
                طريقة احتساب أرباح الوكالة (Pricing Model) *
              </Label>
              <select
                className="w-full mt-1.5 h-11 sm:h-10 px-3 rounded-xl border border-border bg-background text-base sm:text-xs font-bold text-foreground"
                value={clientForm.pricingModel}
                onChange={(e) =>
                  onFormChange({
                    ...clientForm,
                    pricingModel: e.target.value as PricingModel,
                  })
                }
              >
                <option value="RETAINER">1. اشتراك شهري ثابت (Flat Retainer)</option>
                <option value="PERCENT_SPEND">2. نسبة من ميزانية الإعلانات (% of Ad Spend)</option>
                <option value="PERCENT_SALES">3. نسبة من المبيعات المحققة (% of Revenue)</option>
                <option value="FIXED_ORDER">4. عمولة ثابتة لكل أوردر / طلب (Fixed per Order)</option>
                <option value="FIXED_ITEM">5. عمولة ثابتة لكل قطعة مباعة (Fixed per Item)</option>
                <option value="HYBRID">6. نموذج هجين: اشتراك ثابت + عمولة أداء (Hybrid)</option>
              </select>
              <p className="text-[11px] text-muted-foreground mt-1">
                {PRICING_MODEL_LABELS[clientForm.pricingModel]?.desc}
              </p>
            </div>

            {/* Dynamic inputs according to selected pricing model */}
            {clientForm.pricingModel === "RETAINER" && (
              <div>
                <Label className="text-xs font-bold">
                  الاشتراك الشهري الثابت للوكالة ({currency})
                </Label>
                <Input
                  className="mt-1 h-10 sm:h-9 text-base sm:text-xs rounded-xl font-mono tabular-nums"
                  type="number"
                  placeholder="10000"
                  value={clientForm.baseRetainer || ""}
                  onChange={(e) =>
                    onFormChange({ ...clientForm, baseRetainer: Number(e.target.value) })
                  }
                />
              </div>
            )}

            {clientForm.pricingModel === "PERCENT_SPEND" && (
              <div>
                <Label className="text-xs font-bold">
                  النسبة المئوية من ميزانية الإعلانات المصروفة (%)
                </Label>
                <Input
                  className="mt-1 h-10 sm:h-9 text-base sm:text-xs rounded-xl font-mono tabular-nums"
                  type="number"
                  placeholder="10"
                  value={clientForm.pricingRate || ""}
                  onChange={(e) =>
                    onFormChange({ ...clientForm, pricingRate: Number(e.target.value) })
                  }
                />
              </div>
            )}

            {clientForm.pricingModel === "PERCENT_SALES" && (
              <div>
                <Label className="text-xs font-bold">النسبة المئوية من إجمالي المبيعات (%)</Label>
                <Input
                  className="mt-1 h-10 sm:h-9 text-base sm:text-xs rounded-xl font-mono tabular-nums"
                  type="number"
                  placeholder="5"
                  value={clientForm.pricingRate || ""}
                  onChange={(e) =>
                    onFormChange({ ...clientForm, pricingRate: Number(e.target.value) })
                  }
                />
              </div>
            )}

            {clientForm.pricingModel === "FIXED_ORDER" && (
              <div>
                <Label className="text-xs font-bold">
                  القيمة الثابتة لكل أوردر / طلب ({currency})
                </Label>
                <Input
                  className="mt-1 h-10 sm:h-9 text-base sm:text-xs rounded-xl font-mono tabular-nums"
                  type="number"
                  placeholder="25"
                  value={clientForm.feePerOrder || ""}
                  onChange={(e) =>
                    onFormChange({ ...clientForm, feePerOrder: Number(e.target.value) })
                  }
                />
              </div>
            )}

            {clientForm.pricingModel === "FIXED_ITEM" && (
              <div>
                <Label className="text-xs font-bold">
                  القيمة الثابتة لكل قطعة مباعة ({currency})
                </Label>
                <Input
                  className="mt-1 h-10 sm:h-9 text-base sm:text-xs rounded-xl font-mono tabular-nums"
                  type="number"
                  placeholder="15"
                  value={clientForm.feePerItem || ""}
                  onChange={(e) =>
                    onFormChange({ ...clientForm, feePerItem: Number(e.target.value) })
                  }
                />
              </div>
            )}

            {clientForm.pricingModel === "HYBRID" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-bold">
                      الاشتراك الأساسي الثابت ({currency})
                    </Label>
                    <Input
                      className="mt-1 h-10 sm:h-9 text-base sm:text-xs rounded-xl font-mono tabular-nums"
                      type="number"
                      placeholder="5000"
                      value={clientForm.baseRetainer || ""}
                      onChange={(e) =>
                        onFormChange({ ...clientForm, baseRetainer: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold">نوع عمولة الأداء الإضافية</Label>
                    <select
                      className="w-full mt-1 h-10 sm:h-9 px-2 rounded-xl border border-border bg-background text-base sm:text-xs font-bold"
                      value={clientForm.hybridType}
                      onChange={(e) =>
                        onFormChange({
                          ...clientForm,
                          hybridType: e.target.value as HybridType,
                        })
                      }
                    >
                      <option value="PERCENT_SPEND">نسبة من الإنفاق الإعلاني</option>
                      <option value="PERCENT_SALES">نسبة من المبيعات</option>
                      <option value="FIXED_ORDER">عمولة ثابتة لكل أوردر</option>
                    </select>
                  </div>
                </div>

                <div>
                  {clientForm.hybridType === "FIXED_ORDER" ? (
                    <div>
                      <Label className="text-xs font-bold">
                        قيمة العمولة لكل أوردر ({currency})
                      </Label>
                      <Input
                        className="mt-1 h-10 sm:h-9 text-base sm:text-xs rounded-xl font-mono tabular-nums"
                        type="number"
                        placeholder="20"
                        value={clientForm.feePerOrder || ""}
                        onChange={(e) =>
                          onFormChange({ ...clientForm, feePerOrder: Number(e.target.value) })
                        }
                      />
                    </div>
                  ) : (
                    <div>
                      <Label className="text-xs font-bold">
                        نسبة العمولة (
                        {clientForm.hybridType === "PERCENT_SPEND"
                          ? "من الإنفاق"
                          : "من المبيعات"}
                        ) (%)
                      </Label>
                      <Input
                        className="mt-1 h-10 sm:h-9 text-base sm:text-xs rounded-xl font-mono tabular-nums"
                        type="number"
                        placeholder="5"
                        value={clientForm.pricingRate || ""}
                        onChange={(e) =>
                          onFormChange({ ...clientForm, pricingRate: Number(e.target.value) })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ad Budget & Off-Platform Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
            <div>
              <Label className="text-xs font-bold">
                ميزانية الإعلانات الشهرية ({currency})
              </Label>
              <Input
                className="mt-1 h-10 sm:h-9 text-base sm:text-xs rounded-xl font-mono tabular-nums"
                type="number"
                placeholder="50000"
                value={clientForm.monthlyBudget || ""}
                onChange={(e) =>
                  onFormChange({ ...clientForm, monthlyBudget: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label className="text-xs font-bold">معرف الحساب الإعلاني (اختياري)</Label>
              <Input
                className="mt-1 h-10 sm:h-9 text-base sm:text-xs font-mono rounded-xl"
                dir="ltr"
                placeholder="act_123456789"
                value={clientForm.adAccountId}
                onChange={(e) =>
                  onFormChange({ ...clientForm, adAccountId: e.target.value })
                }
              />
            </div>
          </div>

          {/* Off-Platform Checkbox */}
          <div className="flex items-center gap-2.5 p-3 bg-muted/20 rounded-xl border border-border/40">
            <input
              type="checkbox"
              id="isOffPlatformCheck"
              className="size-4 rounded-sm accent-primary cursor-pointer"
              checked={clientForm.isOffPlatform}
              onChange={(e) =>
                onFormChange({ ...clientForm, isOffPlatform: e.target.checked })
              }
            />
            <label htmlFor="isOffPlatformCheck" className="text-xs font-bold cursor-pointer">
              العميل يعمل خارج المنصة (إدخال أرقام الإنفاق والمبيعات والأوردرات يدوياً شهرياً)
            </label>
          </div>

          <div>
            <Label className="text-xs font-bold">ملاحظات العقد</Label>
            <Textarea
              className="mt-1 text-base sm:text-xs rounded-xl"
              placeholder="تفاصيل الاتفاق، بنود استثنائية، أو شروط دفع..."
              rows={2}
              value={clientForm.notes}
              onChange={(e) => onFormChange({ ...clientForm, notes: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter className="p-3.5 sm:p-4 border-t border-border/60 bg-background/95 backdrop-blur-xs shrink-0 flex flex-col-reverse sm:flex-row gap-2 sm:justify-start">
          <Button
            type="button"
            onClick={onSave}
            className="font-bold h-11 sm:h-9 text-xs w-full sm:w-auto"
          >
            حفظ العميل
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 sm:h-9 text-xs w-full sm:w-auto"
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
