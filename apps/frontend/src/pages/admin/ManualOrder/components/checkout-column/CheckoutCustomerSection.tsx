import React from "react";
import {
  UserIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { SearchableSelect } from "../../../../../components/ui/SearchableSelect";
import { GovernorateAreaSearch } from "../../../../../components/ui/GovernorateAreaSearch";
import { CustomerBlockEvaluation } from "../../../../../services/customerBlocklistService";
import {
  GovernmentOption,
  AreaOption,
  EGYPTIAN_GOVERNORATES,
  normalizeLocationLabel,
} from "./types";

interface CheckoutCustomerSectionProps {
  phone: string;
  setPhone: (val: string) => void;
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  governorate: string;
  setGovernorate: (val: string) => void;
  area: string;
  setArea: (val: string) => void;
  searching: boolean;
  checkingBlock: boolean;
  customerBlock: CustomerBlockEvaluation | null;
  allowBlockedCustomerOverride: boolean;
  setAllowBlockedCustomerOverride: (val: boolean) => void;
  canOverrideBlockedCustomer: boolean;
  canUseTurboLocationLookups: boolean;
  governments: GovernmentOption[];
  availableAreas: AreaOption[];
  loadingGovernments: boolean;
  loadingAreas: boolean;
  t: (key: string, fallback?: string) => string;
}

export const CheckoutCustomerSection: React.FC<CheckoutCustomerSectionProps> = ({
  phone,
  setPhone,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  address,
  setAddress,
  governorate,
  setGovernorate,
  area,
  setArea,
  searching,
  checkingBlock,
  customerBlock,
  allowBlockedCustomerOverride,
  setAllowBlockedCustomerOverride,
  canOverrideBlockedCustomer,
  canUseTurboLocationLookups,
  availableAreas,
  loadingGovernments,
  loadingAreas,
  t,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        {t("manualOrder.k_90")}
      </h3>

      <div className="relative">
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
          {t("manualOrder.k_91")}{" "}
          <span className="text-red-500 dark:text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
            placeholder="01xxxxxxxxx"
            dir="ltr"
          />
          {searching && (
            <MagnifyingGlassIcon className="w-4 h-4 text-blue-500 dark:text-blue-400 absolute left-3 top-3 animate-bounce" />
          )}
        </div>
      </div>

      {(checkingBlock || customerBlock) && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            customerBlock?.blocked
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
              : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
          }`}
        >
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {checkingBlock
                  ? t("manualOrder.k_65")
                  : customerBlock?.blocked
                  ? t("manualOrder.k_66")
                  : t("manualOrder.k_67")}
              </p>
              {customerBlock?.message && (
                <p className="mt-1 leading-5">{customerBlock.message}</p>
              )}
              {customerBlock?.blocked && canOverrideBlockedCustomer && (
                <label className="mt-3 flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={allowBlockedCustomerOverride}
                    onChange={(event) =>
                      setAllowBlockedCustomerOverride(event.target.checked)
                    }
                    className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                  />
                  {t("manualOrder.k_92")}
                </label>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            {t("manualOrder.k_93")}{" "}
            <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            {t("manualOrder.k_94")}
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
          {t("manualOrder.k_95")}{" "}
          <span className="text-red-500 dark:text-red-400">*</span>
        </label>
        {canUseTurboLocationLookups ? (
          <GovernorateAreaSearch
            value={{ governorate, area }}
            onChange={(next) => {
              setGovernorate(normalizeLocationLabel(next.governorate));
              setArea(normalizeLocationLabel(next.area));
            }}
            placeholder={t("manualOrder.k_1")}
            searchPlaceholder={t("manualOrder.k_2")}
            emptyText={t("manualOrder.k_3")}
            loadingText={t("manualOrder.k_4")}
            autoSearchText={address || ""}
          />
        ) : (
          <SearchableSelect
            options={EGYPTIAN_GOVERNORATES.map((gov) => ({
              value: gov,
              label: gov,
            }))}
            value={governorate}
            onChange={(val) => {
              setGovernorate(normalizeLocationLabel(val));
            }}
            placeholder={t("manualOrder.k_1", "اختر المحافظة...")}
            searchPlaceholder={t("manualOrder.k_2", "ابحث عن المحافظة...")}
            emptyText={t("manualOrder.k_3", "لا توجد نتائج")}
          />
        )}
        {loadingGovernments && (
          <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
            {t("manualOrder.k_96")}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
          {t("manualOrder.k_97")}
        </label>
        {availableAreas.length > 0 ? (
          <SearchableSelect
            options={availableAreas.map((areaOption) => ({
              value: areaOption.name,
              label: areaOption.name,
            }))}
            value={area}
            onChange={setArea}
            placeholder={loadingAreas ? t("manualOrder.k_7") : t("manualOrder.k_68")}
            searchPlaceholder={t("manualOrder.k_5")}
            emptyText={t("manualOrder.k_6")}
            disabled={false}
            loading={loadingAreas}
            loadingText={t("manualOrder.k_7")}
          />
        ) : (
          <input
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
            placeholder={
              governorate ? t("manualOrder.k_69") : t("manualOrder.k_70")
            }
          />
        )}
        <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
          {t("manualOrder.k_98")}
        </p>
      </div>

      <div className="relative">
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
          {t("manualOrder.k_99")}
        </label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 h-20 resize-none dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
          placeholder={t("manualOrder.k_8")}
        />
        <MapPinIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-8" />
      </div>
    </div>
  );
};
