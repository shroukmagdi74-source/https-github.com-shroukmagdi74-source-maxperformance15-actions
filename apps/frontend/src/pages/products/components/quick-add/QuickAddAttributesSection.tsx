import React from "react";
import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  QuickProductAttribute,
  AttributeTemplate,
  ATTRIBUTE_TEMPLATES,
} from "./types";

interface QuickAddAttributesSectionProps {
  hasOptions: boolean;
  onToggleHasOptions: () => void;
  attributes: QuickProductAttribute[];
  onAddAttributeFromTemplate: (template: AttributeTemplate) => void;
  newCustomAttrName: string;
  setNewCustomAttrName: (val: string) => void;
  onAddCustomAttribute: () => void;
  onRemoveAttribute: (id: string) => void;
  attrInputValues: Record<string, string>;
  setAttrInputValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onAddValueToAttribute: (attrId: string, val: string) => void;
  onRemoveValueFromAttribute: (attrId: string, val: string) => void;
}

export const QuickAddAttributesSection: React.FC<QuickAddAttributesSectionProps> = ({
  hasOptions,
  onToggleHasOptions,
  attributes,
  onAddAttributeFromTemplate,
  newCustomAttrName,
  setNewCustomAttrName,
  onAddCustomAttribute,
  onRemoveAttribute,
  attrInputValues,
  setAttrInputValues,
  onAddValueToAttribute,
  onRemoveValueFromAttribute,
}) => {
  return (
    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
            هل للمنتج مقاسات أو ألوان؟
          </span>
          <p className="text-xs text-slate-400">
            فعل هذا الخيار لتحديد الخصائص (مثل المقاس واللون) وتوليد المتغيرات
          </p>
        </div>

        {/* Switch Toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={hasOptions}
          onClick={onToggleHasOptions}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
            hasOptions ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
              hasOptions ? "-translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Options Body when Enabled */}
      {hasOptions && (
        <div className="mt-4 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-5">
          {/* Attribute Selector / Templates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                1. تحديد المتغيرات والخصائص (Attributes)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                اختر قالباً جاهزاً أو أضف خاصية جديدة
              </span>
            </div>

            {/* Template Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {ATTRIBUTE_TEMPLATES.map((tmpl) => {
                const isAdded = attributes.some((a) => a.name === tmpl.name);
                return (
                  <button
                    key={tmpl.slug}
                    type="button"
                    onClick={() => onAddAttributeFromTemplate(tmpl)}
                    disabled={isAdded}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isAdded
                        ? "bg-slate-100 dark:bg-slate-800/80 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-75"
                        : "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 active:scale-97 shadow-2xs"
                    }`}
                  >
                    <span>{tmpl.icon}</span>
                    <span>{tmpl.name}</span>
                    {isAdded ? (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">✓ مضاف</span>
                    ) : (
                      <PlusIcon className="w-3 h-3 text-indigo-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Attribute Adder */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCustomAttrName}
                onChange={(e) => setNewCustomAttrName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onAddCustomAttribute();
                  }
                }}
                placeholder="أو اكتب اسم خاصية مخصصة (مثال: الخامة، السعة، الوزن)..."
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={onAddCustomAttribute}
                disabled={!newCustomAttrName.trim()}
                className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-97 disabled:opacity-50 rounded-lg transition-all shrink-0"
              >
                + إضافة خاصية
              </button>
            </div>
          </div>

          {/* Active Attributes Cards */}
          {attributes.length > 0 && (
            <div className="space-y-3">
              {attributes.map((attr) => {
                const templateMatch = ATTRIBUTE_TEMPLATES.find((t) => t.name === attr.name);
                const currentInput = attrInputValues[attr.id] || "";

                return (
                  <div
                    key={attr.id}
                    className="p-3.5 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-2xs space-y-3"
                  >
                    {/* Attribute Card Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                          {templateMatch?.icon || "🏷️"}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                          {attr.name}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 rounded-full">
                          {attr.values.length} {attr.values.length === 1 ? "قيمة" : "قيم"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveAttribute(attr.id)}
                        title={`حذف خاصية ${attr.name}`}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Values Chips */}
                    <div>
                      <span className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                        القيم المحددة لـ {attr.name}:
                      </span>
                      {attr.values.length === 0 ? (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                          لم تضف أي قيم بعد. اختر من الاقتراحات بالأسفل أو اكتب قيمة جديدة:
                        </p>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                          {attr.values.map((val) => (
                            <span
                              key={val}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 rounded-lg shadow-2xs"
                            >
                              <span>{val}</span>
                              <button
                                type="button"
                                onClick={() => onRemoveValueFromAttribute(attr.id, val)}
                                aria-label={`حذف القيمة ${val}`}
                                className="text-indigo-400 hover:text-rose-600 transition-colors mr-0.5"
                              >
                                <XMarkIcon className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Suggested Values */}
                      {templateMatch && (
                        <div className="flex flex-wrap items-center gap-1 mb-2.5">
                          <span className="text-[10px] text-slate-400 ml-1">اقتراحات سريعة:</span>
                          {templateMatch.suggestedValues
                            .filter((sv) => !attr.values.includes(sv))
                            .map((sv) => (
                              <button
                                key={sv}
                                type="button"
                                onClick={() => onAddValueToAttribute(attr.id, sv)}
                                className="px-2 py-0.5 text-[11px] font-medium bg-slate-50 dark:bg-slate-700/60 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-600 rounded-md transition-all active:scale-95"
                              >
                                + {sv}
                              </button>
                            ))}
                        </div>
                      )}

                      {/* Add Custom Value Input */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={currentInput}
                          onChange={(e) =>
                            setAttrInputValues((prev) => ({
                              ...prev,
                              [attr.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && currentInput.trim()) {
                              e.preventDefault();
                              onAddValueToAttribute(attr.id, currentInput);
                            }
                          }}
                          placeholder={`اكتب قيمة لـ ${attr.name} واضغط Enter (مثال: ${
                            attr.name === "اللون" ? "رمادي" : attr.name === "المقاس" ? "XXL" : "قيمة جديدة"
                          })...`}
                          className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => onAddValueToAttribute(attr.id, currentInput)}
                          disabled={!currentInput.trim()}
                          className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 rounded-lg transition-colors disabled:opacity-40 shrink-0"
                        >
                          + إضافة قيمة
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
