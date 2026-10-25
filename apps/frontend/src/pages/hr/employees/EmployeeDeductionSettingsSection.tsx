import React from "react";
import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { EmployeeFormData } from "./types";

interface EmployeeDeductionSettingsSectionProps {
  formData: EmployeeFormData;
  setFormData: React.Dispatch<React.SetStateAction<EmployeeFormData>>;
}

export const EmployeeDeductionSettingsSection: React.FC<
  EmployeeDeductionSettingsSectionProps
> = ({ formData, setFormData }) => {
  const { t } = useTranslation();

  return (
    <div className="col-span-2 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-orange-500" />
        <h3 className="font-bold">{t("employees.deductionSettings")}</h3>
      </div>
      <Separator className="mb-4" />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3 border rounded-lg bg-orange-50/50 dark:bg-orange-950/10">
          <div className="space-y-0.5">
            <Label className="text-sm">
              {t("employees.enableAutoDeduction")}
            </Label>
            <p className="text-xs text-gray-500">
              {t("employees.enableAutoDeductionDesc")}
            </p>
          </div>
          <Switch
            checked={formData.enableAutoDeduction}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, enableAutoDeduction: checked })
            }
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">
            {t("employees.deductionRatePerMinute")}
          </Label>
          <Input
            type="number"
            step="0.01"
            value={formData.lateDeductionRate}
            onChange={(e) =>
              setFormData({
                ...formData,
                lateDeductionRate: e.target.value,
              })
            }
            placeholder={t("employees.deductionRatePlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">
            {t("employees.monthlyGraceMinutes")}
          </Label>
          <Input
            type="number"
            value={formData.monthlyGraceMinutes}
            onChange={(e) =>
              setFormData({
                ...formData,
                monthlyGraceMinutes: parseInt(e.target.value) || 0,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">
            {t("employees.maxDailyLateMinutes")}
          </Label>
          <Input
            type="number"
            value={formData.maxDailyLateMinutes}
            onChange={(e) =>
              setFormData({
                ...formData,
                maxDailyLateMinutes: parseInt(e.target.value) || 0,
              })
            }
          />
        </div>
      </div>
    </div>
  );
};
