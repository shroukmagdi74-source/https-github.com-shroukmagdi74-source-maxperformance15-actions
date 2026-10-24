import React from "react";
import type { MultiRuleEntry, ValueRuleEntry, MultiSelectOption } from "./types";
import { MultiSelectDropdown } from "./MultiSelectDropdown";

export interface OrderConfirmationCustomRulesSectionProps {
  regionRules: MultiRuleEntry[];
  regionOptions: MultiSelectOption[];
  userOptions: MultiSelectOption[];
  onUpdateRegionRule: (index: number, patch: Partial<MultiRuleEntry>) => void;
  onRemoveRegionRule: (index: number) => void;
  onAddRegionRule: () => void;

  productRules: MultiRuleEntry[];
  productOptions: MultiSelectOption[];
  hasProducts: boolean;
  onUpdateProductRule: (index: number, patch: Partial<MultiRuleEntry>) => void;
  onRemoveProductRule: (index: number) => void;
  onAddProductRule: () => void;

  orderValueRules: ValueRuleEntry[];
  onUpdateValueRule: (index: number, patch: Partial<ValueRuleEntry>) => void;
  onRemoveValueRule: (index: number) => void;
  onAddValueRule: () => void;
}

export function OrderConfirmationCustomRulesSection({
  regionRules,
  regionOptions,
  userOptions,
  onUpdateRegionRule,
  onRemoveRegionRule,
  onAddRegionRule,

  productRules,
  productOptions,
  hasProducts,
  onUpdateProductRule,
  onRemoveProductRule,
  onAddProductRule,

  orderValueRules,
  onUpdateValueRule,
  onRemoveValueRule,
  onAddValueRule,
}: OrderConfirmationCustomRulesSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {/* 1. Region Rules */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">قواعد المناطق</label>
          <p className="text-xs text-gray-500">اختر محافظة أو أكثر من قائمة منسدلة، ثم حدد فريق التوزيع لها.</p>
        </div>
        {regionRules.length === 0 ? (
          <div className="text-xs text-gray-500">لا توجد قواعد مناطق بعد.</div>
        ) : (
          regionRules.map((rule, index) => (
            <div
              key={`region-${index}`}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2 bg-white dark:bg-gray-900/50"
            >
              <div className="space-y-2">
                <MultiSelectDropdown
                  options={regionOptions}
                  selectedValues={rule.keys}
                  onChange={(keys) => onUpdateRegionRule(index, { keys })}
                  placeholder="اختر المحافظات"
                  emptyText="لا توجد محافظات متاحة"
                />
                <MultiSelectDropdown
                  options={userOptions}
                  selectedValues={rule.userIds}
                  onChange={(userIds) => onUpdateRegionRule(index, { userIds })}
                  placeholder="اختر الموظفين"
                  emptyText="لا يوجد موظفون متاحون"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => onRemoveRegionRule(index)}
                  className="text-xs text-red-600 hover:underline dark:text-red-400"
                >
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
        <button
          type="button"
          onClick={onAddRegionRule}
          className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          إضافة قاعدة منطقة
        </button>
      </div>

      {/* 2. Product Specialty Rules */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">قواعد التخصيص حسب المنتج</label>
          <p className="text-xs text-gray-500">اختر منتج أو أكثر وحدد الموظفين المسؤولين عنهم.</p>
        </div>
        {productRules.length === 0 ? (
          <div className="text-xs text-gray-500">لا توجد قواعد منتجات بعد.</div>
        ) : (
          productRules.map((rule, index) => (
            <div
              key={`product-${index}`}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2 bg-white dark:bg-gray-900/50"
            >
              <div className="space-y-2">
                <MultiSelectDropdown
                  options={productOptions}
                  selectedValues={rule.keys}
                  onChange={(keys) => onUpdateProductRule(index, { keys })}
                  placeholder={hasProducts ? "اختر المنتجات" : "لا توجد منتجات محملة"}
                  emptyText="لا توجد منتجات متاحة"
                />
                <MultiSelectDropdown
                  options={userOptions}
                  selectedValues={rule.userIds}
                  onChange={(userIds) => onUpdateProductRule(index, { userIds })}
                  placeholder="اختر الموظفين"
                  emptyText="لا يوجد موظفون متاحون"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => onRemoveProductRule(index)}
                  className="text-xs text-red-600 hover:underline dark:text-red-400"
                >
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
        <button
          type="button"
          onClick={onAddProductRule}
          className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          إضافة قاعدة منتج
        </button>
      </div>

      {/* 3. Order Value Rules */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">قواعد التخصيص حسب قيمة الأوردر</label>
          <p className="text-xs text-gray-500">حدد مدى قيمة الطلب، ثم الموظفين المناسبين له.</p>
        </div>
        {orderValueRules.length === 0 ? (
          <div className="text-xs text-gray-500">لا توجد قواعد لقيمة الأوردر بعد.</div>
        ) : (
          orderValueRules.map((rule, index) => (
            <div
              key={`value-${index}`}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2 bg-white dark:bg-gray-900/50"
            >
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={rule.minTotal}
                  onChange={(e) => onUpdateValueRule(index, { minTotal: e.target.value })}
                  inputMode="decimal"
                  placeholder="من قيمة"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm font-mono tabular-nums"
                />
                <input
                  value={rule.maxTotal}
                  onChange={(e) => onUpdateValueRule(index, { maxTotal: e.target.value })}
                  inputMode="decimal"
                  placeholder="إلى قيمة"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm font-mono tabular-nums"
                />
              </div>
              <MultiSelectDropdown
                options={userOptions}
                selectedValues={rule.userIds}
                onChange={(userIds) => onUpdateValueRule(index, { userIds })}
                placeholder="اختر الموظفين"
                emptyText="لا يوجد موظفون متاحون"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => onRemoveValueRule(index)}
                  className="text-xs text-red-600 hover:underline dark:text-red-400"
                >
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
        <button
          type="button"
          onClick={onAddValueRule}
          className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          إضافة قاعدة قيمة
        </button>
      </div>
    </div>
  );
}