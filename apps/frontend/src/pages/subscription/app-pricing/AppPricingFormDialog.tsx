import React from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { Textarea } from "../../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { APP_CATEGORIES, USAGE_UNITS } from "./types";
import type { AppPricingController } from "./useAppPricingSheetController";

export const AppPricingFormDialog: React.FC<{ c: AppPricingController }> = ({ c }) => {
  const { t, isDialogOpen, setIsDialogOpen, editingApp, setEditingApp } = c;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-2xl font-cairo">
        <DialogHeader>
          <DialogTitle>
            {editingApp?.id
              ? t("subscription.editApp", "تعديل التطبيق")
              : t("subscription.addApp", "إضافة تطبيق")}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label>{t("subscription.appName", "اسم التطبيق")}</Label>
            <Input
              value={editingApp?.name || ""}
              onChange={(e) => setEditingApp((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="اسم التطبيق"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("subscription.appNameEn", "App Name (English)")}</Label>
            <Input
              value={editingApp?.nameEn || ""}
              onChange={(e) => setEditingApp((prev) => ({ ...prev, nameEn: e.target.value }))}
              placeholder="App name (English)"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              value={editingApp?.slug || ""}
              onChange={(e) => setEditingApp((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="app-slug"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>{t("subscription.description", "الوصف")}</Label>
            <Textarea
              value={editingApp?.description || ""}
              onChange={(e) => setEditingApp((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>{t("subscription.imageUrl", "Image URL")}</Label>
            <Input
              value={editingApp?.imageUrl || ""}
              onChange={(e) => setEditingApp((prev) => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://example.com/app-icon.png"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("subscription.categoryLabel", "الفئة")}</Label>
            <Select
              value={editingApp?.category || "ECOMMERCE"}
              onValueChange={(val) => setEditingApp((prev) => ({ ...prev, category: val }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APP_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {c.getCategoryLabel(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("subscription.pricingModel", "نظام التسعير")}</Label>
            <Select
              value={editingApp?.pricingModel || "SUBSCRIPTION"}
              onValueChange={(val) => setEditingApp((prev) => ({ ...prev, pricingModel: val }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FREE">مجاني (Free)</SelectItem>
                <SelectItem value="SUBSCRIPTION">اشتراك (Subscription)</SelectItem>
                <SelectItem value="PAY_PER_USE">حسب الاستخدام (Pay Per Use)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {editingApp?.pricingModel === "SUBSCRIPTION" && (
            <>
              <div className="space-y-2">
                <Label>{t("subscription.monthlyPrice", "السعر الشهري")}</Label>
                <Input
                  type="number"
                  value={editingApp?.monthlyPrice || 0}
                  onChange={(e) =>
                    setEditingApp((prev) => ({ ...prev, monthlyPrice: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("subscription.yearlyPrice", "السعر السنوي")}</Label>
                <Input
                  type="number"
                  value={editingApp?.yearlyPrice || 0}
                  onChange={(e) =>
                    setEditingApp((prev) => ({ ...prev, yearlyPrice: Number(e.target.value) }))
                  }
                />
              </div>
            </>
          )}

          {editingApp?.pricingModel === "PAY_PER_USE" && (
            <div className="space-y-3 md:col-span-2 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                {t("subscription.usagePricingSettings", "إعدادات التسعير حسب الاستخدام")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("subscription.unitPrice", "سعر الوحدة (جنيه)")}</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={editingApp?.unitPrice || 0}
                    onChange={(e) =>
                      setEditingApp((prev) => ({ ...prev, unitPrice: Number(e.target.value) }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("subscription.unitName", "نوع الوحدة")}</Label>
                  <Select
                    value={editingApp?.unitName || ""}
                    onValueChange={(val) => setEditingApp((prev) => ({ ...prev, unitName: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("subscription.selectUnit", "اختر نوع الوحدة")} />
                    </SelectTrigger>
                    <SelectContent>
                      {USAGE_UNITS.map((u) => (
                        <SelectItem key={u} value={u}>
                          {t(`subscription.units.${u}`, u)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    {t("subscription.freeUnitsIncluded", "وحدات مجانية مضمنة")}
                    <span className="text-xs font-normal text-slate-400 mr-1">
                      ({t("subscription.freeUnitsHint", "تُحتسب مجاناً قبل الفوترة")})
                    </span>
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={editingApp?.freeUnitsIncluded || 0}
                    onChange={(e) =>
                      setEditingApp((prev) => ({
                        ...prev,
                        freeUnitsIncluded: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {t("subscription.minimumCharge", "الحد الأدنى للفوترة (جنيه/شهر)")}
                    <span className="text-xs font-normal text-slate-400 mr-1">
                      ({t("subscription.minimumChargeHint", "0 = بدون حد أدنى")})
                    </span>
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={editingApp?.minimumCharge || 0}
                    onChange={(e) =>
                      setEditingApp((prev) => ({
                        ...prev,
                        minimumCharge: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>{t("subscription.freeTrial", "أيام التجربة المجانية")}</Label>
            <Input
              type="number"
              value={editingApp?.trialDays || 0}
              onChange={(e) =>
                setEditingApp((prev) => ({ ...prev, trialDays: Number(e.target.value) }))
              }
            />
          </div>

          <div className="space-y-2 md:col-span-2 flex items-center gap-2 pt-4">
            <Switch
              checked={editingApp?.isActive ?? true}
              onCheckedChange={(val) => setEditingApp((prev) => ({ ...prev, isActive: val }))}
            />
            <Label>{t("subscription.activeStatus", "حالة التفعيل")}</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => void c.handleSaveApp()}
          >
            {t("common.save", "Save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
