import React, { useState } from "react";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  CodeBracketIcon,
  QueueListIcon,
} from "@heroicons/react/24/outline";
import { StudioDynamicTokenPicker } from "./StudioDynamicTokenPicker";
import { LOOP_MAX_LIMIT } from "../utils/expandLoopSection";
import type { LoopSourceType, StudioSectionShape } from "../StudioTypes";

export interface StudioLoopControlsProps {
  settings: Record<string, any>;
  onUpdateField: (field: string, value: any) => void;
  onBatchUpdateFields?: (updates: Record<string, any>) => void;
  sectionType?: string;
}

export const StudioLoopControls: React.FC<StudioLoopControlsProps> = ({
  settings,
  onUpdateField,
  onBatchUpdateFields,
}) => {
  const source: LoopSourceType = (settings.source || "products") as LoopSourceType;
  const collectionId = settings.collectionId ?? "";
  const rawLimit = Number(settings.limit ?? 6) || 6;
  const columns = Number(settings.columns ?? 3) || 3;
  const emptyMessage = settings.emptyMessage ?? "لا توجد عناصر لعرضها في هذا التكرار";

  const rawTemplate = settings.template;
  const templateList: StudioSectionShape[] = Array.isArray(rawTemplate)
    ? rawTemplate
    : rawTemplate && typeof rawTemplate === "object"
    ? [rawTemplate]
    : [
        {
          type: "heading",
          settings: { text: "{{product.title}}", level: "h3" },
        },
        {
          type: "text",
          settings: { content: "السعر: {{product.priceFormatted}}", size: "sm" },
        },
      ];

  const [activeJsonMode, setActiveJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState(() => JSON.stringify(templateList, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  const isLimitOverCap = rawLimit > LOOP_MAX_LIMIT;

  const handleSourceChange = (newSource: LoopSourceType) => {
    onUpdateField("source", newSource);
  };

  const handleLimitChange = (val: number) => {
    const clamped = Math.max(1, Math.floor(val));
    onUpdateField("limit", clamped);
  };

  const handleColumnsChange = (cols: number) => {
    onUpdateField("columns", cols);
  };

  const handleUpdateTemplate = (nextTemplate: StudioSectionShape[]) => {
    onUpdateField("template", nextTemplate);
    setJsonText(JSON.stringify(nextTemplate, null, 2));
  };

  const handleAddTemplateItem = (type: string) => {
    let newItem: StudioSectionShape;
    if (type === "heading") {
      newItem = { type: "heading", settings: { text: "{{product.title}}", level: "h3" } };
    } else if (type === "text") {
      newItem = { type: "text", settings: { content: "السعر: {{product.priceFormatted}}", size: "sm" } };
    } else if (type === "button") {
      newItem = { type: "button", settings: { text: "أضف للسلة", link: "/cart" } };
    } else if (type === "image") {
      newItem = { type: "image", settings: { src: "{{product.image}}", alt: "{{product.title}}" } };
    } else {
      newItem = { type, settings: {} };
    }
    handleUpdateTemplate([...templateList, newItem]);
  };

  const handleRemoveTemplateItem = (idx: number) => {
    const next = templateList.filter((_, i) => i !== idx);
    handleUpdateTemplate(next);
  };

  const handleUpdateTemplateField = (idx: number, field: string, value: any) => {
    const next = templateList.map((item, i) => {
      if (i !== idx) return item;
      return {
        ...item,
        settings: {
          ...(item.settings || {}),
          [field]: value,
        },
      };
    });
    handleUpdateTemplate(next);
  };

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        setJsonError("يجب أن يكون القالب مصفوفة من الأقسام (Array)");
        return;
      }
      setJsonError(null);
      handleUpdateTemplate(parsed);
      setActiveJsonMode(false);
    } catch (e: any) {
      setJsonError(e.message || "خطأ في بنية JSON");
    }
  };

  return (
    <div className="space-y-4 px-3 py-3 text-[#1e293b]" data-testid="studio-loop-controls">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2.5">
        <div className="flex items-center gap-2">
          <ArrowPathIcon className="h-4 w-4 text-[#2563eb]" />
          <span className="text-xs font-bold text-[#0f172a]">إعدادات التكرار (Loop)</span>
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
          نشط (DYN-1)
        </span>
      </div>

      {/* 1. Source Selection */}
      <div className="space-y-1.5" data-testid="loop-source-section">
        <label className="text-[11px] font-semibold text-[#475569]">مصدر البيانات (Source)</label>
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-[#f1f5f9] p-1">
          <button
            type="button"
            data-testid="loop-source-products"
            onClick={() => handleSourceChange("products")}
            className={`rounded-md py-1.5 text-[11px] font-medium transition-all ${
              source === "products"
                ? "bg-white text-[#0f172a] shadow-xs"
                : "text-[#64748b] hover:text-[#0f172a]"
            }`}
          >
            المنتجات
          </button>
          <button
            type="button"
            data-testid="loop-source-collection"
            onClick={() => handleSourceChange("collection")}
            className={`rounded-md py-1.5 text-[11px] font-medium transition-all ${
              source === "collection"
                ? "bg-white text-[#0f172a] shadow-xs"
                : "text-[#64748b] hover:text-[#0f172a]"
            }`}
          >
            مجموعة
          </button>
          <button
            type="button"
            data-testid="loop-source-articles"
            onClick={() => handleSourceChange("articles")}
            className={`rounded-md py-1.5 text-[11px] font-medium transition-all ${
              source === "articles"
                ? "bg-white text-[#0f172a] shadow-xs"
                : "text-[#64748b] hover:text-[#0f172a]"
            }`}
          >
            المقالات
          </button>
        </div>

        {source === "collection" && (
          <div className="mt-2 space-y-1">
            <label className="text-[10.5px] text-[#64748b]">معرّف أو رابط المجموعة (Collection ID)</label>
            <input
              type="text"
              data-testid="loop-collection-id-input"
              value={collectionId}
              onChange={(e) => onUpdateField("collectionId", e.target.value)}
              placeholder="مثال: summer-2026 أو 42"
              className="w-full rounded-md border border-[#cbd5e1] bg-white px-2.5 py-1.5 text-xs text-[#0f172a] focus:border-[#2563eb] focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* 2. Limit & Hard Cap (50) */}
      <div className="space-y-1.5" data-testid="loop-limit-section">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-[#475569]">
            عدد العناصر (Limit — سقف 50)
          </label>
          <span className="font-mono text-[11px] font-bold text-[#2563eb]">
            {Math.min(rawLimit, LOOP_MAX_LIMIT)} / {LOOP_MAX_LIMIT}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={1}
            max={LOOP_MAX_LIMIT}
            value={Math.min(rawLimit, LOOP_MAX_LIMIT)}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer accent-[#2563eb]"
          />
          <input
            type="number"
            min={1}
            data-testid="loop-limit-input"
            value={rawLimit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="w-16 rounded-md border border-[#cbd5e1] bg-white px-2 py-1 text-center font-mono text-xs text-[#0f172a] focus:border-[#2563eb] focus:outline-none"
          />
        </div>

        {isLimitOverCap && (
          <div
            data-testid="loop-limit-warning"
            className="flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 p-2 text-[10.5px] text-amber-800"
          >
            <ExclamationTriangleIcon className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              تم إدخال عدد أكبر من السقف ({LOOP_MAX_LIMIT}). سيتم تقليص النتائج تلقائياً إلى{" "}
              {LOOP_MAX_LIMIT} لحماية أداء وسرعة المتجر.
            </span>
          </div>
        )}
      </div>

      {/* 3. Columns */}
      <div className="space-y-1.5" data-testid="loop-columns-section">
        <label className="text-[11px] font-semibold text-[#475569]">عدد الأعمدة (Columns)</label>
        <div className="grid grid-cols-5 gap-1 rounded-lg bg-[#f1f5f9] p-1">
          {[1, 2, 3, 4, 6].map((col) => (
            <button
              key={col}
              type="button"
              data-testid={`loop-column-${col}`}
              onClick={() => handleColumnsChange(col)}
              className={`rounded-md py-1 text-xs font-semibold transition-all ${
                columns === col
                  ? "bg-[#2563eb] text-white shadow-xs"
                  : "text-[#64748b] hover:text-[#0f172a]"
              }`}
            >
              {col}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Empty State Message */}
      <div className="space-y-1.5" data-testid="loop-empty-message-section">
        <label className="text-[11px] font-semibold text-[#475569]">
          رسالة الحالة الفارغة (Empty Message)
        </label>
        <input
          type="text"
          data-testid="loop-empty-message-input"
          value={emptyMessage}
          onChange={(e) => onUpdateField("emptyMessage", e.target.value)}
          placeholder="لا توجد عناصر لعرضها في هذا التكرار"
          className="w-full rounded-md border border-[#cbd5e1] bg-white px-2.5 py-1.5 text-xs text-[#0f172a] focus:border-[#2563eb] focus:outline-none"
        />
      </div>

      {/* 5. Inner Template Editor */}
      <div className="space-y-2 border-t border-[#e2e8f0] pt-3" data-testid="loop-template-section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <QueueListIcon className="h-4 w-4 text-[#64748b]" />
            <label className="text-[11px] font-bold text-[#0f172a]">
              القالب الداخلي المُكرر ({templateList.length})
            </label>
          </div>
          <button
            type="button"
            onClick={() => setActiveJsonMode((prev) => !prev)}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
          >
            <CodeBracketIcon className="h-3 w-3" />
            <span>{activeJsonMode ? "واجهة بصرية" : "JSON"}</span>
          </button>
        </div>

        {activeJsonMode ? (
          <div className="space-y-2">
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={8}
              className="w-full rounded-md border border-[#cbd5e1] bg-[#0f172a] p-2 font-mono text-[11px] text-[#f8fafc] focus:border-[#2563eb] focus:outline-none"
              dir="ltr"
            />
            {jsonError && <p className="text-[10px] font-semibold text-rose-600">{jsonError}</p>}
            <button
              type="button"
              onClick={handleApplyJson}
              className="w-full rounded-md bg-[#2563eb] py-1.5 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
            >
              تطبيق قالب JSON
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {templateList.map((item, idx) => {
              const itemType = item.type || "section";
              const itemSettings = item.settings || {};
              const titleField = itemSettings.text ?? itemSettings.content ?? itemSettings.title ?? "";

              return (
                <div
                  key={`tmpl-${idx}`}
                  data-testid={`template-item-${idx}`}
                  className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-2.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-[#e2e8f0] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#334155]">
                      {itemType} #{idx + 1}
                    </span>
                    <button
                      type="button"
                      data-testid={`remove-template-item-${idx}`}
                      onClick={() => handleRemoveTemplateItem(idx)}
                      className="rounded p-1 text-[#94a3b8] hover:bg-rose-50 hover:text-rose-600"
                      title="حذف العنصر من القالب"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Main field edit with token picker */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#64748b]">النص أو المحتوى</span>
                      <StudioDynamicTokenPicker
                        onSelectToken={(token) => {
                          const targetField =
                            itemType === "heading" ? "text" : itemType === "text" ? "content" : "text";
                          handleUpdateTemplateField(idx, targetField, `${titleField} ${token}`.trim());
                        }}
                      />
                    </div>
                    <input
                      type="text"
                      data-testid={`template-item-input-${idx}`}
                      value={titleField}
                      onChange={(e) => {
                        const targetField =
                          itemType === "heading" ? "text" : itemType === "text" ? "content" : "text";
                        handleUpdateTemplateField(idx, targetField, e.target.value);
                      }}
                      className="w-full rounded border border-[#cbd5e1] bg-white px-2 py-1 text-xs text-[#0f172a] focus:border-[#2563eb] focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}

            {/* Quick Add Elements to Template */}
            <div className="pt-1 space-y-1">
              <span className="text-[10px] text-[#64748b]">إضافة عنصر إلى القالب الداخلي:</span>
              <div className="grid grid-cols-4 gap-1">
                <button
                  type="button"
                  data-testid="add-heading-to-template"
                  onClick={() => handleAddTemplateItem("heading")}
                  className="flex items-center justify-center gap-1 rounded border border-[#cbd5e1] bg-white py-1 text-[10.5px] font-semibold text-[#334155] hover:bg-[#f1f5f9]"
                >
                  <PlusIcon className="h-3 w-3" />
                  <span>عنوان</span>
                </button>
                <button
                  type="button"
                  data-testid="add-text-to-template"
                  onClick={() => handleAddTemplateItem("text")}
                  className="flex items-center justify-center gap-1 rounded border border-[#cbd5e1] bg-white py-1 text-[10.5px] font-semibold text-[#334155] hover:bg-[#f1f5f9]"
                >
                  <PlusIcon className="h-3 w-3" />
                  <span>نص</span>
                </button>
                <button
                  type="button"
                  data-testid="add-button-to-template"
                  onClick={() => handleAddTemplateItem("button")}
                  className="flex items-center justify-center gap-1 rounded border border-[#cbd5e1] bg-white py-1 text-[10.5px] font-semibold text-[#334155] hover:bg-[#f1f5f9]"
                >
                  <PlusIcon className="h-3 w-3" />
                  <span>زر</span>
                </button>
                <button
                  type="button"
                  data-testid="add-image-to-template"
                  onClick={() => handleAddTemplateItem("image")}
                  className="flex items-center justify-center gap-1 rounded border border-[#cbd5e1] bg-white py-1 text-[10.5px] font-semibold text-[#334155] hover:bg-[#f1f5f9]"
                >
                  <PlusIcon className="h-3 w-3" />
                  <span>صورة</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioLoopControls;
