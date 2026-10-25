import React from "react";
import { TFunction } from "i18next";
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
import { Switch } from "../../../../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { RewardTypeFormData, RewardTypeRecord } from "./types";
import {
  PERCENTAGE_CALCULATION_METHODS,
  REWARD_TYPE_CALCULATION_METHODS,
  REWARD_TYPE_CATEGORIES,
} from "./helpers";

interface RewardTypeFormDialogProps {
  t: TFunction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingType: RewardTypeRecord | null;
  formData: RewardTypeFormData;
  onFormDataChange: (data: RewardTypeFormData) => void;
  onSubmit: () => void;
}

export const RewardTypeFormDialog: React.FC<RewardTypeFormDialogProps> = ({
  t,
  open,
  onOpenChange,
  editingType,
  formData,
  onFormDataChange,
  onSubmit,
}) => {
  const updateCondition = (
    key: keyof RewardTypeFormData["eligibilityConditions"],
    value: number | boolean,
  ) => {
    onFormDataChange({
      ...formData,
      eligibilityConditions: {
        ...formData.eligibilityConditions,
        [key]: value,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingType
              ? t("rewards.form.editReward")
              : t("rewards.form.addReward")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("rewards.form.name")}</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                onFormDataChange({ ...formData, name: e.target.value })
              }
              placeholder={t("rewards.form.namePlaceholder")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("rewards.form.category")}</Label>
              <Select
                value={formData.category}
                onValueChange={(v) =>
                  onFormDataChange({ ...formData, category: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REWARD_TYPE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {t(`rewards.category.${cat}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("rewards.form.calculationMethod")}</Label>
              <Select
                value={formData.calculationMethod}
                onValueChange={(v) =>
                  onFormDataChange({ ...formData, calculationMethod: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REWARD_TYPE_CALCULATION_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {t(`rewards.calculationMethod.${method}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              {t("rewards.form.value")}{" "}
              {PERCENTAGE_CALCULATION_METHODS.includes(
                formData.calculationMethod,
              )
                ? "(%)"
                : ""}
            </Label>
            <Input
              type="number"
              className="font-mono tabular-nums"
              value={formData.value}
              onChange={(e) =>
                onFormDataChange({ ...formData, value: Number(e.target.value) })
              }
            />
          </div>

          {/* Eligibility Conditions Section */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4 border border-gray-200">
            <Label className="text-blue-600 font-bold block mb-2 border-b pb-2">
              {t("rewards.form.eligibilityConditions")}
            </Label>

            {["TARGET_ACHIEVEMENT", "TARGET_EXCEED"].includes(
              formData.category,
            ) && (
              <div className="space-y-2">
                <Label>{t("rewards.form.minTargetProgress")}</Label>
                <Input
                  type="number"
                  className="font-mono tabular-nums"
                  value={formData.eligibilityConditions.minTargetProgress}
                  onChange={(e) =>
                    updateCondition("minTargetProgress", Number(e.target.value))
                  }
                />
              </div>
            )}

            {formData.category === "PUNCTUALITY" && (
              <div className="space-y-2">
                <Label>{t("rewards.form.maxLatenessCount")}</Label>
                <Input
                  type="number"
                  className="font-mono tabular-nums"
                  value={formData.eligibilityConditions.maxLatenessCount}
                  onChange={(e) =>
                    updateCondition("maxLatenessCount", Number(e.target.value))
                  }
                />
              </div>
            )}

            {formData.category === "NO_ABSENCE" && (
              <div className="space-y-2">
                <Label>{t("rewards.form.maxAbsenceCount")}</Label>
                <Input
                  type="number"
                  className="font-mono tabular-nums"
                  value={formData.eligibilityConditions.maxAbsenceCount}
                  onChange={(e) =>
                    updateCondition("maxAbsenceCount", Number(e.target.value))
                  }
                />
              </div>
            )}

            {formData.category === "QUALITY" && (
              <div className="space-y-2">
                <Label>{t("rewards.form.maxErrorRate")}</Label>
                <Input
                  type="number"
                  className="font-mono tabular-nums"
                  value={formData.eligibilityConditions.maxErrorRate}
                  onChange={(e) =>
                    updateCondition("maxErrorRate", Number(e.target.value))
                  }
                />
              </div>
            )}

            {formData.category === "PROJECT_SUCCESS" && (
              <div className="space-y-2">
                <Label>{t("rewards.form.minProjectScore")}</Label>
                <Input
                  type="number"
                  className="font-mono tabular-nums"
                  value={formData.eligibilityConditions.minProjectScore}
                  onChange={(e) =>
                    updateCondition("minProjectScore", Number(e.target.value))
                  }
                />
              </div>
            )}

            {formData.category === "SALES" && (
              <div className="space-y-2">
                <Label>{t("rewards.form.minSalesAmount")}</Label>
                <Input
                  type="number"
                  className="font-mono tabular-nums"
                  value={formData.eligibilityConditions.minSalesAmount}
                  onChange={(e) =>
                    updateCondition("minSalesAmount", Number(e.target.value))
                  }
                />
              </div>
            )}

            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  checked={
                    formData.eligibilityConditions.requiresManagerNomination
                  }
                  onCheckedChange={(checked) =>
                    updateCondition("requiresManagerNomination", checked)
                  }
                />
                <Label>{t("rewards.form.requiresManagerNomination")}</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  checked={formData.eligibilityConditions.requiresHRApproval}
                  onCheckedChange={(checked) =>
                    updateCondition("requiresHRApproval", checked)
                  }
                />
                <Label>{t("rewards.form.requiresHRApproval")}</Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSubmit}>{t("rewards.form.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
