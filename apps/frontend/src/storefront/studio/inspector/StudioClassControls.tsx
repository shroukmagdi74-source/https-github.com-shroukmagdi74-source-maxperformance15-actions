import React, { useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  CheckIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentCheckIcon,
  SparklesIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/outline";
import type { StudioStyleClass, StudioStyleState, StudioDeviceMode } from "../StudioTypes";
import { parseFreeNumber, normalizeArabicDigits } from "../utils/studioStyleUtils";
import { FreeNumberInput } from "./StudioDimensionControls";

export interface StudioClassControlsProps {
  classes?: StudioStyleClass[];
  selectedClassId?: string | null;
  assignedClassId?: string | null;
  deviceMode?: StudioDeviceMode;
  onSelectClass?: (classId: string | null) => void;
  onAssignClass?: (classId: string | null) => void;
  onCreateClass?: (name?: string) => void;
  onUpdateClass?: (classId: string, updates: Partial<StudioStyleClass>) => void;
  onDeleteClass?: (classId: string) => void;
  onCopyStyle?: () => void;
  onPasteStyle?: () => void;
  hasCopiedStyle?: boolean;
}

export const StudioClassControls: React.FC<StudioClassControlsProps> = ({
  classes = [],
  selectedClassId: propSelectedClassId,
  assignedClassId,
  deviceMode = "desktop",
  onSelectClass,
  onAssignClass,
  onCreateClass,
  onUpdateClass,
  onDeleteClass,
  onCopyStyle,
  onPasteStyle,
  hasCopiedStyle = false,
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    assignedClassId || (classes[0]?.id ?? null)
  );
  const [activeStateTab, setActiveStateTab] = useState<StudioStyleState>("normal");
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [tempName, setTempName] = useState<string>("");

  const activeClassId = propSelectedClassId !== undefined ? propSelectedClassId : internalSelectedId;
  const currentClass = classes.find((c) => c && c.id === activeClassId);

  const handleSelectClass = (id: string | null) => {
    setInternalSelectedId(id);
    onSelectClass?.(id);
  };

  const handleStartRename = (cls: StudioStyleClass) => {
    setEditingNameId(cls.id);
    setTempName(cls.name);
  };

  const handleSaveRename = (clsId: string) => {
    if (tempName.trim()) {
      onUpdateClass?.(clsId, { name: tempName.trim() });
    }
    setEditingNameId(null);
  };

  // Get current state target settings dictionary for editing
  const getActiveStateSettings = (): Record<string, any> => {
    if (!currentClass) return {};
    if (activeStateTab === "normal") return currentClass.settings || {};
    const stateKey = activeStateTab as "hover" | "focus" | "active";
    return (currentClass.states && currentClass.states[stateKey]) || {};
  };

  const updateCurrentStateField = (field: string, value: any) => {
    if (!currentClass || !onUpdateClass) return;

    if (activeStateTab === "normal") {
      const nextSettings = { ...(currentClass.settings || {}), [field]: value };
      if (value === null || value === undefined || value === "") {
        delete nextSettings[field];
      }
      onUpdateClass(currentClass.id, { settings: nextSettings });
    } else {
      const stateKey = activeStateTab as "hover" | "focus" | "active";
      const nextStates = { ...(currentClass.states || {}) };
      const targetState: Record<string, any> = { ...((nextStates[stateKey]) || {}), [field]: value };
      if (value === null || value === undefined || value === "") {
        delete targetState[field];
      }
      nextStates[stateKey] = targetState;
      onUpdateClass(currentClass.id, { states: nextStates });
    }
  };

  const activeSettings = getActiveStateSettings();
  const currentColor = activeSettings.backgroundColor || activeSettings.bgColor || "";
  const currentTextColor = activeSettings.color || "";

  return (
    <div className="space-y-3.5 select-none text-[11.5px] text-[#17181c]" data-testid="studio-class-controls">
      {/* 1. Header Toolbar: Copy & Paste Style */}
      <div className="flex items-center justify-between gap-1.5 rounded-lg border border-[#ececee] bg-[#fafbfc] p-2">
        <span className="text-[11px] font-bold text-[#3f434a] flex items-center gap-1.5">
          <PaintBrushIcon className="h-4 w-4 text-[#2b6cf6]" />
          <span>نسخ ولصق الستايل</span>
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            data-testid="btn-copy-style"
            onClick={onCopyStyle}
            title="نسخ ستايل هذا القسم"
            className="flex items-center gap-1 rounded-md border border-[#e3e3e6] bg-white px-2 py-1 text-[10.5px] font-semibold text-[#17181c] shadow-xs hover:bg-[#f6f7f8] active:scale-95 transition-all cursor-pointer"
          >
            <DocumentDuplicateIcon className="h-3.5 w-3.5 text-[#2b6cf6]" />
            <span>نسخ الستايل</span>
          </button>
          <button
            type="button"
            data-testid="btn-paste-style"
            disabled={!hasCopiedStyle}
            onClick={onPasteStyle}
            title={hasCopiedStyle ? "تطبيق الستايل المنسوخ على هذا القسم" : "لا يوجد ستايل منسوخ"}
            className="flex items-center gap-1 rounded-md border border-[#e3e3e6] bg-white px-2 py-1 text-[10.5px] font-semibold text-[#17181c] shadow-xs hover:bg-[#f6f7f8] disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
          >
            <ClipboardDocumentCheckIcon className="h-3.5 w-3.5 text-emerald-600" />
            <span>لصق الستايل</span>
          </button>
        </div>
      </div>

      {/* 2. Classes Management & Assignment */}
      <div className="space-y-2 rounded-lg border border-[#ececee] bg-white p-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-[#17181c]">
            كلاسات الستايل المشتركة (Classes)
          </label>
          <button
            type="button"
            data-testid="btn-create-class"
            onClick={() => {
              const newName = `كلاس ${classes.length + 1}`;
              onCreateClass?.(newName);
            }}
            className="flex items-center gap-1 text-[10.5px] font-bold text-[#2b6cf6] hover:underline cursor-pointer"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            <span>إنشاء كلاس</span>
          </button>
        </div>

        {/* Assigned Class Selector */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] text-[#8a8f96] shrink-0">إسناد للقسم الحالي:</span>
          <select
            data-testid="select-assigned-class"
            value={assignedClassId || ""}
            onChange={(e) => {
              const val = e.target.value;
              onAssignClass?.(val ? val : null);
              if (val) handleSelectClass(val);
            }}
            className="flex-1 rounded-md border border-[#ececee] bg-[#f8fafc] px-2 py-1 text-[11px] text-[#17181c] outline-none focus:border-[#2b6cf6]"
          >
            <option value="">(بدون كلاس — ستايل مستقل)</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} {cls.id === assignedClassId ? "✓" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Classes Pills / List */}
        {classes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-[#f1f2f4]">
            {classes.map((cls) => {
              const isSelected = cls.id === activeClassId;
              const isAssigned = cls.id === assignedClassId;
              const isEditing = editingNameId === cls.id;

              return (
                <div
                  key={cls.id}
                  data-testid={`class-pill-${cls.id}`}
                  className={`group relative flex items-center gap-1 rounded-md border px-2 py-1 text-[10.5px] transition-all ${
                    isSelected
                      ? "border-[#2b6cf6] bg-[#2b6cf6]/10 text-[#2b6cf6] font-bold shadow-xs"
                      : "border-[#ececee] bg-[#f8fafc] text-[#555960] hover:border-[#c5c8cf]"
                  }`}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        autoFocus
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename(cls.id);
                          if (e.key === "Escape") setEditingNameId(null);
                        }}
                        className="w-20 rounded border border-[#2b6cf6] bg-white px-1 py-0.5 text-[10px] text-[#17181c]"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRename(cls.id)}
                        className="text-emerald-600 hover:text-emerald-700"
                        title="حفظ الاسم"
                      >
                        <CheckIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSelectClass(cls.id)}
                        className="flex items-center gap-1 cursor-pointer truncate max-w-[120px]"
                      >
                        {isAssigned && <span className="text-emerald-600 text-[11px]">●</span>}
                        <span className="truncate">{cls.name}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartRename(cls)}
                        className="opacity-0 group-hover:opacity-100 text-[#8a8f96] hover:text-[#17181c] p-0.5 cursor-pointer"
                        title="إعادة تسمية"
                      >
                        <PencilSquareIcon className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteClass?.(cls.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                        title="حذف الكلاس"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Class Style Editor (When a Class is Selected) */}
      {currentClass ? (
        <div className="space-y-3 rounded-lg border border-[#ececee] bg-white p-3">
          <div className="flex items-center justify-between pb-1 border-b border-[#f0f1f3]">
            <span className="font-bold text-[#17181c] flex items-center gap-1">
              <SparklesIcon className="h-3.5 w-3.5 text-[#2b6cf6]" />
              <span>محرر الستايل: {currentClass.name}</span>
            </span>
            {assignedClassId !== currentClass.id && (
              <button
                type="button"
                onClick={() => onAssignClass?.(currentClass.id)}
                className="text-[10px] font-bold text-[#2b6cf6] hover:underline cursor-pointer"
              >
                إسناد لهذا القسم
              </button>
            )}
          </div>

          {/* 4 State Tabs: عادي / hover / focus / active */}
          <div className="grid grid-cols-4 gap-1 rounded-lg border border-[#ececee] bg-[#f6f7f8] p-1 text-center" data-testid="class-state-tabs">
            {[
              { id: "normal", label: "عادي", en: "Normal" },
              { id: "hover", label: "تحويم", en: ":hover" },
              { id: "focus", label: "تركيز", en: ":focus" },
              { id: "active", label: "نشط", en: ":active" },
            ].map((tab) => {
              const isTabActive = activeStateTab === tab.id;
              const hasStateData =
                tab.id === "normal"
                  ? Object.keys(currentClass.settings || {}).length > 0
                  : Boolean(currentClass.states && currentClass.states[tab.id as keyof typeof currentClass.states] && Object.keys(currentClass.states[tab.id as keyof typeof currentClass.states] || {}).length > 0);

              return (
                <button
                  key={tab.id}
                  type="button"
                  data-testid={`state-tab-${tab.id}`}
                  onClick={() => setActiveStateTab(tab.id as StudioStyleState)}
                  className={`rounded-md py-1.5 text-[10px] font-semibold transition-all cursor-pointer ${
                    isTabActive
                      ? "bg-white text-[#2b6cf6] shadow-xs font-bold"
                      : "text-[#6f747b] hover:text-[#17181c]"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>{tab.label}</span>
                    {hasStateData && tab.id !== "normal" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-3 pt-1">
            {/* Background Color */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold text-[#8a8f96]">
                لون الخلفية ({activeStateTab})
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  dir="ltr"
                  value={currentColor}
                  placeholder="#ffffff"
                  onChange={(e) => {
                    let val = normalizeArabicDigits(e.target.value).trim();
                    if (val && !val.startsWith("#") && /^[0-9a-fA-F]+$/.test(val)) {
                      val = "#" + val;
                    }
                    updateCurrentStateField("backgroundColor", val);
                  }}
                  className="w-24 rounded border border-[#ececee] px-2 py-1 text-[10.5px] font-mono text-[#17181c] text-center"
                />
                <input
                  type="color"
                  value={
                    currentColor.startsWith("#") && currentColor.length === 7
                      ? currentColor
                      : "#ffffff"
                  }
                  onChange={(e) => updateCurrentStateField("backgroundColor", e.target.value)}
                  className="h-6 w-8 cursor-pointer rounded border border-[#ececee] bg-transparent"
                />
                {currentColor && (
                  <button
                    type="button"
                    onClick={() => updateCurrentStateField("backgroundColor", null)}
                    className="text-[10px] text-red-500 hover:underline"
                  >
                    مسح
                  </button>
                )}
              </div>
            </div>

            {/* Text Color */}
            <div className="space-y-1.5 border-t border-[#f0f1f3] pt-2">
              <span className="block text-[10px] font-bold text-[#8a8f96]">
                لون النص ({activeStateTab})
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  dir="ltr"
                  value={currentTextColor}
                  placeholder="#17181c"
                  onChange={(e) => {
                    let val = normalizeArabicDigits(e.target.value).trim();
                    if (val && !val.startsWith("#") && /^[0-9a-fA-F]+$/.test(val)) {
                      val = "#" + val;
                    }
                    updateCurrentStateField("color", val);
                  }}
                  className="w-24 rounded border border-[#ececee] px-2 py-1 text-[10.5px] font-mono text-[#17181c] text-center"
                />
                <input
                  type="color"
                  value={
                    currentTextColor.startsWith("#") && currentTextColor.length === 7
                      ? currentTextColor
                      : "#17181c"
                  }
                  onChange={(e) => updateCurrentStateField("color", e.target.value)}
                  className="h-6 w-8 cursor-pointer rounded border border-[#ececee] bg-transparent"
                />
                {currentTextColor && (
                  <button
                    type="button"
                    onClick={() => updateCurrentStateField("color", null)}
                    className="text-[10px] text-red-500 hover:underline"
                  >
                    مسح
                  </button>
                )}
              </div>
            </div>

            {/* Border Radius */}
            <div className="space-y-1.5 border-t border-[#f0f1f3] pt-2">
              <span className="block text-[10px] font-bold text-[#8a8f96]">
                استدارة الزوايا (Radius)
              </span>
              <FreeNumberInput
                label="الاستدارة (px)"
                value={parseFreeNumber(activeSettings.borderRadius, 0)}
                min={0}
                max={100}
                placeholder="0"
                deviceMode={deviceMode}
                onChange={(val) => updateCurrentStateField("borderRadius", val)}
              />
              <div className="grid grid-cols-4 gap-1 pt-0.5">
                {[0, 8, 16, 24].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => updateCurrentStateField("borderRadius", r)}
                    className={`rounded border py-0.5 text-center text-[9.5px] ${
                      parseFreeNumber(activeSettings.borderRadius, 0) === r
                        ? "border-[#2b6cf6] bg-[#2b6cf6]/10 text-[#2b6cf6] font-bold"
                        : "border-[#ececee] bg-[#f6f7f8] text-[#6f747b]"
                    }`}
                  >
                    {r}px
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-1.5 border-t border-[#f0f1f3] pt-2">
              <span className="block text-[10px] font-bold text-[#8a8f96]">
                حجم الخط (Font Size)
              </span>
              <FreeNumberInput
                label="حجم الخط (px)"
                value={parseFreeNumber(activeSettings.fontSize, 16)}
                min={10}
                max={96}
                placeholder="16"
                deviceMode={deviceMode}
                onChange={(val) => updateCurrentStateField("fontSize", val)}
              />
            </div>

            {/* Padding Controls */}
            <div className="space-y-1.5 border-t border-[#f0f1f3] pt-2">
              <span className="block text-[10px] font-bold text-[#8a8f96]">
                الحشوة والمسافات (Padding)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <FreeNumberInput
                  label="أعلى (Top)"
                  value={parseFreeNumber(activeSettings.paddingTop, 0)}
                  min={0}
                  max={200}
                  deviceMode={deviceMode}
                  onChange={(val) => updateCurrentStateField("paddingTop", val)}
                />
                <FreeNumberInput
                  label="أسفل (Bottom)"
                  value={parseFreeNumber(activeSettings.paddingBottom, 0)}
                  min={0}
                  max={200}
                  deviceMode={deviceMode}
                  onChange={(val) => updateCurrentStateField("paddingBottom", val)}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[#ececee] p-4 text-center text-[10.5px] text-[#8a8f96] space-y-1.5">
          <p>لم يتم اختيار أو إنشاء أي كلاس بعد.</p>
          <button
            type="button"
            onClick={() => onCreateClass?.("كلاس رئيسي")}
            className="font-bold text-[#2b6cf6] hover:underline cursor-pointer"
          >
            + إنشاء كلاس جديد الآن
          </button>
        </div>
      )}
    </div>
  );
};
