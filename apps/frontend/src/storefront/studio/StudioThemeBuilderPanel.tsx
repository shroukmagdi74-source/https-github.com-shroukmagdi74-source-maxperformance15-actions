import React, { useState } from "react";
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  Squares2X2Icon,
  CubeIcon,
  TagIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  themeBuilder,
  type ThemeBuilderTemplate,
  type ThemeBuilderTemplateType,
  type ThemeBuilderTargetType,
} from "./utils/themeBuilder";
import { toast } from "sonner";

export interface StudioThemeBuilderPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  templates: ThemeBuilderTemplate[];
  onSaveTemplate: (template: ThemeBuilderTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  currentSections?: any[];
  activePageKey?: string;
}

export const StudioThemeBuilderPanel: React.FC<StudioThemeBuilderPanelProps> = ({
  onClose,
  templates = [],
  onSaveTemplate,
  onDeleteTemplate,
  currentSections = [],
  activePageKey = "home",
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<ThemeBuilderTemplateType>("single");
  const [target, setTarget] = useState<ThemeBuilderTargetType>("product");
  const [applyTo, setApplyTo] = useState<"all" | "group">("group");
  const [groupId, setGroupId] = useState("fashion-men");

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("يرجى إدخال اسم القالب");
      return;
    }

    const newTemplateId = `template-${Date.now()}`;
    const initialPage = {
      id: newTemplateId,
      key: `tb-${newTemplateId}`,
      title: name.trim(),
      sections: currentSections.length > 0 ? currentSections : [{ type: "featured-products" }],
    };

    let created: ThemeBuilderTemplate;
    if (type === "archive") {
      created = themeBuilder.createArchive({
        id: newTemplateId,
        name: name.trim(),
        target: target === "product" ? "products" : target,
        conditions: {
          applyTo,
          ...(applyTo === "group" ? { groupId: groupId.trim() } : {}),
        },
        page: initialPage,
        isActive: true,
      });
    } else {
      created = themeBuilder.createSingle({
        id: newTemplateId,
        name: name.trim(),
        target: target === "products" ? "product" : target,
        conditions: {
          applyTo,
          ...(applyTo === "group" ? { groupId: groupId.trim() } : {}),
        },
        page: initialPage,
        isActive: true,
      });
    }

    onSaveTemplate(created);
    toast.success(`تم إنشاء قالب "${created.name}" بنجاح ✨`);
    setIsCreating(false);
    setName("");
  };

  return (
    <div
      data-testid="studio-theme-builder-panel"
      className="flex flex-col h-full w-[320px] max-w-[85vw] bg-[#1a1b20] text-[#e8eaee] border-e border-[#0c0d0f] select-none"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2b2d35] bg-[#141519]">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2b6cf6]/20 text-[#60a5fa]">
            <SparklesIcon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white">Theme Builder (باني القوالب)</h2>
            <p className="text-[10px] text-[#9ba0a8]">قوالب للأرشيف والمفرد والمقال · صفحة: {activePageKey}</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            data-testid="theme-builder-close"
            className="p-1 rounded-md text-[#9ba0a8] hover:bg-[#252830] hover:text-white"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {!isCreating && (
          <button
            type="button"
            data-testid="create-new-template-btn"
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#2b6cf6]/60 bg-[#2b6cf6]/10 py-2.5 text-xs font-bold text-[#60a5fa] hover:bg-[#2b6cf6]/20 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span>إنشاء قالب جديد (Theme Builder)</span>
          </button>
        )}

        {isCreating && (
          <div
            data-testid="create-template-form"
            className="rounded-xl border border-[#2b6cf6]/40 bg-[#1f222b] p-3.5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">إعدادات القالب الجديد</span>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-[#9ba0a8] hover:text-white text-xs"
              >
                إلغاء
              </button>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#9ba0a8] mb-1 block">
                اسم القالب:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: قالب منتجات قسم أزياء الصيف"
                className="w-full rounded-lg border border-[#2d303a] bg-[#141519] px-2.5 py-1.5 text-xs text-white focus:border-[#2b6cf6] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#9ba0a8] mb-1 block">
                نوع القالب:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setType("archive");
                    setTarget("products");
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    type === "archive"
                      ? "border-[#2b6cf6] bg-[#2b6cf6]/20 text-[#60a5fa]"
                      : "border-[#2d303a] bg-[#141519] text-[#9ba0a8]"
                  }`}
                >
                  <Squares2X2Icon className="h-3.5 w-3.5" />
                  <span>أرشيف (Archive)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType("single");
                    setTarget("product");
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    type === "single"
                      ? "border-[#2b6cf6] bg-[#2b6cf6]/20 text-[#60a5fa]"
                      : "border-[#2d303a] bg-[#141519] text-[#9ba0a8]"
                  }`}
                >
                  <CubeIcon className="h-3.5 w-3.5" />
                  <span>مفرد (Single)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#9ba0a8] mb-1 block">
                الهدف المستهدف:
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as ThemeBuilderTargetType)}
                className="w-full rounded-lg border border-[#2d303a] bg-[#141519] px-2 py-1.5 text-xs text-white focus:outline-none"
              >
                {type === "archive" ? (
                  <>
                    <option value="products">كل المنتجات (Catalog / Shop)</option>
                    <option value="collection">مجموعة محددة (Collection)</option>
                  </>
                ) : (
                  <>
                    <option value="product">منتج واحد (Single Product PDP)</option>
                    <option value="article">مقال واحد (Article Post)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#9ba0a8] mb-1 block">
                شروط العرض والتطبيق:
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-[#c3c7cd] cursor-pointer">
                    <input
                      type="radio"
                      name="applyTo"
                      checked={applyTo === "all"}
                      onChange={() => setApplyTo("all")}
                      className="accent-[#2b6cf6]"
                    />
                    <span>الكل (افتراضي للكل)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-[#c3c7cd] cursor-pointer">
                    <input
                      type="radio"
                      name="applyTo"
                      checked={applyTo === "group"}
                      onChange={() => setApplyTo("group")}
                      className="accent-[#2b6cf6]"
                    />
                    <span>مجموعة محددة (Group X)</span>
                  </label>
                </div>

                {applyTo === "group" && (
                  <input
                    type="text"
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    placeholder="معرف أو Slug المجموعة (مثال: group-x أو electronics)"
                    className="w-full rounded-lg border border-[#2d303a] bg-[#141519] px-2.5 py-1.5 text-xs text-white focus:border-[#2b6cf6] focus:outline-none"
                  />
                )}
              </div>
            </div>

            <button
              type="button"
              data-testid="save-theme-builder-template-btn"
              onClick={handleCreate}
              className="w-full py-2 rounded-lg bg-[#2b6cf6] text-xs font-bold text-white hover:bg-[#1d5ce6] transition-colors"
            >
              حفظ القالب في settings.templates
            </button>
          </div>
        )}

        {/* Templates List */}
        <div className="space-y-2.5">
          {templates.length === 0 ? (
            <div
              data-testid="empty-templates-state"
              className="rounded-xl border border-dashed border-[#2b2d35] p-5 text-center text-xs text-[#9ba0a8] space-y-1.5"
            >
              <p className="font-semibold text-[#c3c7cd]">لا توجد قوالب Theme Builder مخصصة بعد</p>
              <p className="text-[10px]">
                المتجر يستخدم القوالب الافتراضية حالياً (Fallback).
              </p>
            </div>
          ) : (
            templates.map((tpl) => {
              const isGroup = tpl.conditions?.applyTo === "group" || tpl.conditions?.applyTo === "specific";
              const groupLabel = tpl.conditions?.groupId || tpl.conditions?.groupSlug || "محددة";

              return (
                <div
                  key={tpl.id}
                  data-testid={`template-item-${tpl.id}`}
                  className="rounded-xl border border-[#2b2d35] bg-[#202228] p-3 space-y-2 hover:border-[#383b44] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-white">{tpl.name}</span>
                        <span className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-[#2b6cf6]/20 text-[#60a5fa]">
                          {tpl.type === "archive" ? "أرشيف" : "مفرد"}
                        </span>
                        <span className="rounded px-1.5 py-0.5 text-[10px] bg-[#2a2d34] text-[#c3c7cd]">
                          {tpl.target}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#9ba0a8] mt-1 flex items-center gap-1">
                        <TagIcon className="h-3 w-3" />
                        <span>الشرط: {isGroup ? `مجموعة: ${groupLabel}` : "لكل المنتجات"}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      data-testid={`delete-template-${tpl.id}`}
                      onClick={() => {
                        onDeleteTemplate(tpl.id);
                        toast.info(`تم حذف قالب "${tpl.name}"`);
                      }}
                      className="p-1 rounded text-[#9ba0a8] hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                      title="حذف القالب"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default StudioThemeBuilderPanel;
