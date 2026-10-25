import React from "react";
import { KeyRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  hasError,
  getErrorMessage,
  ValidationError,
} from "../../../utils/hrValidation";
import { EmployeeFormData, Department, LookupResponse } from "./types";

interface EmployeePersonalFieldsProps {
  formData: EmployeeFormData;
  setFormData: React.Dispatch<React.SetStateAction<EmployeeFormData>>;
  departments: Department[];
  lookupResult: LookupResponse | null;
  errors: ValidationError[];
}

export const EmployeePersonalFields: React.FC<EmployeePersonalFieldsProps> = ({
  formData,
  setFormData,
  departments,
  lookupResult,
  errors,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="space-y-2">
        <Label>{t("employees.firstName")}</Label>
        <Input
          value={formData.firstName}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
          placeholder={t("employees.firstNamePlaceholder")}
          className={hasError(errors, "firstName") ? "border-red-500" : ""}
        />
        {hasError(errors, "firstName") && (
          <p className="text-sm text-red-500">
            {getErrorMessage(errors, "firstName")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>{t("employees.lastName")}</Label>
        <Input
          value={formData.lastName}
          onChange={(e) =>
            setFormData({ ...formData, lastName: e.target.value })
          }
          placeholder={t("employees.lastNamePlaceholder")}
          className={hasError(errors, "lastName") ? "border-red-500" : ""}
        />
        {hasError(errors, "lastName") && (
          <p className="text-sm text-red-500">
            {getErrorMessage(errors, "lastName")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>{t("employees.phone")}</Label>
        <Input
          value={formData.phone}
          onChange={(e) =>
            setFormData({ ...formData, phone: e.target.value })
          }
          placeholder="01xxxxxxxxx"
          className={hasError(errors, "phone") ? "border-red-500" : ""}
        />
        {hasError(errors, "phone") && (
          <p className="text-sm text-red-500">
            {getErrorMessage(errors, "phone")}
          </p>
        )}
      </div>

      {/* Password Field: Hidden if user exists, Shown if new user */}
      {!lookupResult?.exists ? (
        <div className="space-y-2">
          <Label>{t("employees.password")}</Label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder={t("employees.passwordPlaceholder")}
            className={hasError(errors, "password") ? "border-red-500" : ""}
          />
          {hasError(errors, "password") && (
            <p className="text-sm text-red-500">
              {getErrorMessage(errors, "password")}
            </p>
          )}
        </div>
      ) : (
        <div className="col-span-2 p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-2.5 text-xs text-muted-foreground">
          <KeyRound className="h-4 w-4 text-primary shrink-0" />
          <span>{t("employees.existingUserPasswordHint")}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label>{t("employees.role")}</Label>
        <Select
          value={formData.role}
          onValueChange={(value) =>
            setFormData({ ...formData, role: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("employees.selectRole")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AGENT">
              {t("employees.roleAgentOption")}
            </SelectItem>
            <SelectItem value="MANAGER">
              {t("employees.roleManagerOption")}
            </SelectItem>
            <SelectItem value="COMPANY_ADMIN">
              {t("employees.roleAdminOption")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t("employees.department")}</Label>
        <Select
          value={formData.departmentId}
          onValueChange={(value) =>
            setFormData({ ...formData, departmentId: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("employees.selectDepartment")} />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
