import React, { useState } from "react";
import {
  ChevronDownIcon,
  CodeBracketIcon,
  PaintBrushIcon,
  Square3Stack3DIcon,
  SparklesIcon,
  LanguageIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import type { StudioDeviceMode, StudioStyleClass } from "../StudioTypes";
import {
  StudioPaddingControl,
  StudioMarginControl,
  StudioDimensionsLayoutControl,
  FreeNumberInput,
} from "./StudioDimensionControls";
import { StudioShadowControls } from "./StudioShadowControls";
import { StudioBorderControls } from "./StudioBorderControls";
import { StudioPositionControls } from "./StudioPositionControls";
import {
  normalizeArabicDigits,
  parseFreeNumber,
  isPropertyOverridden,
  copySectionStyle,
  pasteSectionStyle,
  formatClampFontSize,
  resolveFontSizeValue,
  ClampFontSizeConfig,
} from "../utils/studioStyleUtils";
import { StudioSectionVariantSelector } from "./StudioSectionVariantSelector";
import { ResponsiveFieldBadge } from "./StudioResponsiveControls";
import { StudioClassControls } from "./StudioClassControls";

interface StudioInspectorDesignTabProps {
  sectionType: string;
  settings: Record<string, any>;
  deviceMode?: StudioDeviceMode;
  rawSettings?: Record<string, any>;
  onUpdateField: (field: string, value: any) => void;
  onBatchUpdateFields?: (updates: Record<string, any>) => void;
  onResetField?: (field: string) => void;
  onSave?: () => void;
  // Ticket CLASSES-1 props
  classes?: StudioStyleClass[];
  selectedClassId?: string | null;
  assignedClassId?: string | null;
  onSelectClass?: (classId: string | null) => void;
  onAssignClass?: (classId: string | null) => void;
  onCreateClass?: (name?: string) => void;
  onUpdateClass?: (classId: string, updates: Partial<StudioStyleClass>) => void;
  onDeleteClass?: (classId: string) => void;
  onCopyStyle?: () => void;
  onPasteStyle?: () => void;
  hasCopiedStyle?: boolean;
}

export const StudioInspectorDesignTab: React.FC<StudioInspectorDesignTabProps> = ({
  sectionType,
  settings,
  deviceMode = "desktop",
  rawSettings,
  onUpdateField,
  onBatchUpdateFields,
  onResetField,
  onSave,
  classes: propClasses,
  selectedClassId,
  assignedClassId: propAssignedClassId,
  onSelectClass,
  onAssignClass: propOnAssignClass,
  onCreateClass: propOnCreateClass,
  onUpdateClass: propOnUpdateClass,
  onDeleteClass: propOnDeleteClass,
  onCopyStyle: propOnCopyStyle,
  onPasteStyle: propOnPasteStyle,
  hasCopiedStyle: propHasCopiedStyle,
}) => {
  const [openAcc, setOpenAcc] = useState<{ [key: string]: boolean }>({
    classes: true,
    fill: true,
    corners: true,
    shadow: true,
    position: false,
    spacing: false,
    layout: false,
    typography: false,
    css: Boolean(settings.customCss),
  });

  const [internalClasses, setInternalClasses] = useState<StudioStyleClass[]>(
    Array.isArray(settings.classes) ? settings.classes : []
  );
  const [internalCopiedStyle, setInternalCopiedStyle] = useState<Record<string, any> | null>(null);

  const effectiveClasses = propClasses !== undefined ? propClasses : internalClasses;
  const currentAssignedClassId =
    propAssignedClassId !== undefined
      ? propAssignedClassId
      : settings.classId || settings.customClass || null;

  const handleAssignClass = (classId: string | null) => {
    if (propOnAssignClass) {
      propOnAssignClass(classId);
    } else {
      onUpdateField("classId", classId);
    }
  };

  const handleCreateClass = (name?: string) => {
    if (propOnCreateClass) {
      propOnCreateClass(name);
    } else {
      const newClass: StudioStyleClass = {
        id: `cls-${Date.now().toString(36)}`,
        name: name || `كلاس ${effectiveClasses.length + 1}`,
        settings: {},
        states: { hover: {}, focus: {}, active: {} },
      };
      const next = [...effectiveClasses, newClass];
      setInternalClasses(next);
      onUpdateField("classes", next);
    }
  };

  const handleUpdateClass = (classId: string, updates: Partial<StudioStyleClass>) => {
    if (propOnUpdateClass) {
      propOnUpdateClass(classId, updates);
    } else {
      const next = effectiveClasses.map((c) => (c.id === classId ? { ...c, ...updates } : c));
      setInternalClasses(next);
      onUpdateField("classes", next);
    }
  };

  const handleDeleteClass = (classId: string) => {
    if (propOnDeleteClass) {
      propOnDeleteClass(classId);
    } else {
      const next = effectiveClasses.filter((c) => c.id !== classId);
      setInternalClasses(next);
      onUpdateField("classes", next);
      if (currentAssignedClassId === classId) {
        handleAssignClass(null);
      }
    }
  };

  const handleCopyStyle = () => {
    if (propOnCopyStyle) {
      propOnCopyStyle();
    } else {
      const copied = copySectionStyle(settings);
      setInternalCopiedStyle(copied);
    }
  };

  const handlePasteStyle = () => {
    if (propOnPasteStyle) {
      propOnPasteStyle();
    } else if (internalCopiedStyle) {
      const next = pasteSectionStyle(settings, internalCopiedStyle);
      if (onBatchUpdateFields) {
        onBatchUpdateFields(next);
      } else {
        Object.entries(next).forEach(([k, v]) => onUpdateField(k, v));
      }
    }
  };

  const hasCopiedStyle =
    propHasCopiedStyle !== undefined ? propHasCopiedStyle : Boolean(internalCopiedStyle);

  const toggleAcc = (key: string) => {
    setOpenAcc((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const currentColor = settings.backgroundColor || settings.bgColor || "#ffffff";
  const customCss = settings.customCss || "";

  const targetSource = rawSettings || settings;

  const colorSwatches = [
    { label: "أبيض ناصع", val: "#ffffff" },
    { label: "كريمي دافئ", val: "#fdfbf7" },
    { label: "رمادي فاخر", val: "#f8fafc" },
    { label: "كحلي هادئ", val: "#0f172a" },
    { label: "طوبي أنيق", val: "#b4552d" },
  ];

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = normalizeArabicDigits(e.target.value).trim();
    if (val && !val.startsWith("#") && /^[0-9a-fA-F]+$/.test(val)) {
      val = "#" + val;
    }
    onUpdateField("backgroundColor", val);
  };

  return (
    <div className="space-y-3 select-none text-[11.5px] text-[#17181c]">
      {/* 0. شكل القسم (Section Variant Selector) */}
      <StudioSectionVariantSelector
        sectionType={sectionType}
        settings={settings}
        onUpdateField={onUpdateField}
        onBatchUpdateFields={onBatchUpdateFields}
        onSave={onSave}
      />

      {/* 0b. كلاسات الستايل والحالات المشتركة (Classes & States - Ticket CLASSES-1) */}
      <div className="overflow-hidden rounded-lg border border-[#ececee]">
        <button
          type="button"
          onClick={() => toggleAcc("classes")}
          className="flex w-full items-center justify-between bg-[#fafbfc] px-3 py-2 text-start font-medium text-[#3f434a]"
        >
          <div className="flex items-center gap-1.5 font-bold">
            <SparklesIcon className="h-3.5 w-3.5 text-[#2b6cf6]" />
            <span>كلاسات الستايل والحالات (Classes & States)</span>
          </div>
          <ChevronDownIcon
            className={`h-3.5 w-3.5 text-[#9aa0a8] transition-transform ${
              openAcc.classes ? "rotate-180" : ""
            }`}
          />
        </button>

        {openAcc.classes && (
          <div className="p-3 bg-white">
            <StudioClassControls
              classes={effectiveClasses}
              selectedClassId={selectedClassId}
              assignedClassId={currentAssignedClassId}
              deviceMode={deviceMode}
              onSelectClass={onSelectClass}
              onAssignClass={handleAssignClass}
              onCreateClass={handleCreateClass}
              onUpdateClass={handleUpdateClass}
              onDeleteClass={handleDeleteClass}
              onCopyStyle={handleCopyStyle}
              onPasteStyle={handlePasteStyle}
              hasCopiedStyle={hasCopiedStyle}
            />
          </div>
        )}
      </div>

      {/* 1. Accordion: خلفية (Fill & Background) */}
      <div className="overflow-hidden rounded-lg border border-[#ececee]">
        <button
          type="button"
          onClick={() => toggleAcc("fill")}
          className="flex w-full items-center justify-between bg-[#fafbfc] px-3 py-2 text-start font-medium text-[#3f434a]"
        >
          <div className="flex items-center gap-1.5 font-bold">
            <PaintBrushIcon className="h-3.5 w-3.5 text-[#2b6cf6]" />
            <span>خلفية القسم (Background)</span>
          </div>
          <ChevronDownIcon
            className={`h-3.5 w-3.5 text-[#9aa0a8] transition-transform ${
              openAcc.fill ? "rotate-180" : ""
            }`}
          />
        </button>

        {openAcc.fill && (
          <div className="p-3 bg-white space-y-2.5">
            <div className="flex items-center gap-2">
              {colorSwatches.map((swatch) => (
                <button
                  key={swatch.val}
                  type="button"
                  onClick={() => onUpdateField("backgroundColor", swatch.val)}
                  style={{ backgroundColor: swatch.val }}
                  title={swatch.label}
                  className={`h-6 w-6 rounded-md border border-[#e3e3e6] transition-transform ${
                    currentColor === swatch.val
                      ? "ring-2 ring-[#2b6cf6] ring-offset-1 scale-105"
                      : "hover:scale-105"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-[#8a8f96]">لون مخصص (HEX):</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  dir="ltr"
                  value={currentColor}
                  placeholder="#ffffff"
                  onChange={handleHexChange}
                  className="w-20 rounded border border-[#ececee] px-1.5 py-0.5 text-[10.5px] font-mono text-[#17181c] text-center tabular-nums"
                />
                <input
                  type="color"
                  value={
                    currentColor.startsWith("#") && currentColor.length === 7
                      ? currentColor
                      : "#ffffff"
                  }
                  onChange={(e) => onUpdateField("backgroundColor", e.target.value)}
                  className="h-6 w-7 cursor-pointer rounded border border-[#ececee] bg-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Accordion: حدود واستدارة (Borders & Radius) */}
      <div className="overflow-hidden rounded-lg border border-[#ececee]">
        <button
          type="button"
          onClick={() => toggleAcc("corners")}
          className="flex w-full items-center justify-between bg-[#fafbfc] px-3 py-2 text-start font-medium text-[#3f434a]"
        >
          <div className="flex items-center gap-1.5 font-bold">
            <Square3Stack3DIcon className="h-3.5 w-3.5 text-[#2b6cf6]" />
            <span>حدود واستدارة الزوايا (Radius)</span>
          </div>
          <ChevronDownIcon
            className={`h-3.5 w-3.5 text-[#9aa0a8] transition-transform ${
              openAcc.corners ? "rotate-180" : ""
            }`}
          />
        </button>

        {openAcc.corners && (
          <div className="p-3 bg-white">
            <StudioBorderControls
              settings={settings}
              deviceMode={deviceMode}
              rawSettings={targetSource}
              onResetField={onResetField}
              onUpdateField={onUpdateField}
              onBatchUpdateFields={onBatchUpdateFields}
            />
          </div>
        )}
      </div>

      {/* 2b. Accordion: موضع وتحويل (Position & Transform) */}
      <div className="overflow-hidden rounded-lg border border-[#ececee]">
        <button
          type="button"
          onClick={() => toggleAcc("position")}
          className="flex w-full items-center justify-between bg-[#fafbfc] px-3 py-2 text-start font-medium text-[#3f434a]"
        >
          <div className="flex items-center gap-1.5 font-bold">
            <ArrowsPointingOutIcon className="h-3.5 w-3.5 text-[#2b6cf6]" />
            <span>الموضع والتحويل (Position & Transform)</span>
          </div>
          <ChevronDownIcon
            className={`h-3.5 w-3.5 text-[#9aa0a8] transition-transform ${
              openAcc.position ? "rotate-180" : ""
            }`}
          />
        </button>

        {openAcc.position && (
          <div className="p-3 bg-white">
            <StudioPositionControls
              settings={settings}
              deviceMode={deviceMode}
              rawSettings={targetSource}
              onResetField={onResetField}
              onUpdateField={onUpdateField}
              onBatchUpdateFields={onBatchUpdateFields}
            />
          </div>
        )}
      </div>

      {/* 3. Accordion: تأثيرات وظلال (Effects & Shadows) */}
      <div className="overflow-hidden rounded-lg border border-[#ececee]">
        <button
          type="button"
          onClick={() => toggleAcc("shadow")}
          className="flex w-full items-center justify-between bg-[#fafbfc] px-3 py-2 text-start font-medium text-[#3f434a]"
        >
          <div className="flex items-center gap-1.5 font-bold">
            <SparklesIcon className="h-3.5 w-3.5 text-[#2b6cf6]" />
            <span>تأثيرات وظلال مخصصة (Shadows)</span>
          </div>
          <ChevronDownIcon
            className={`h-3.5 w-3.5 text-[#9aa0a8] transition-transform ${
              openAcc.shadow ? "rotate-180" : ""
            }`}
          />
        </button>

        {openAcc.shadow && (
          <div className="p-3 bg-white">
            <StudioShadowControls
              settings={settings}
              onUpdateField={onUpdateField}
              onBatchUpdateFields={onBatchUpdateFields}
            />
          </div>
        )}
      </div>

      {/* 4. Accordion: مسافات (Spacing & Padding) */}
      <div className="overflow-hidden rounded-lg border border-[#ececee]">
        <button
          type="button"
          onClick={() => toggleAcc("spacing")}
          className="flex w-full items-center justify-between bg-[#fafbfc] px-3 py-2 text-start font-medium text-[#3f434a]"
        >
          <span>المسافات والحشوة (Spacing)</span>
          <ChevronDownIcon
            className={`h-3.5 w-3.5 text-[#9aa0a8] transition-transform ${
              openAcc.spacing ? "rotate-180" : ""
            }`}
          />
        </button>

        {openAcc.spacing && (
          <div className="p-3 bg-white space-y-3">
            <StudioPaddingControl
              settings={settings}
              deviceMode={deviceMode}
              rawSettings={targetSource}
              onResetField={onResetField}
              onUpdateField={onUpdateField}
              onBatchUpdateFields={onBatchUpdateFields}
            />
            <div className="border-t border-[#f0f1f3] pt-2">
              <StudioMarginControl
                settings={settings}
                deviceMode={deviceMode}
                rawSettings={targetSource}
                onResetField={onResetField}
                onUpdateField={onUpdateField}
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. Accordion: تخطيط ومقاسات (Layout & Dimensions) */}
      <div className="overflow-hidden rounded-lg border border-[#ececee]">
        <button
          type="button"
          onClick={() => toggleAcc("layout")}
          className="flex w-full items-center justify-between bg-[#fafbfc] px-3 py-2 text-start font-medium text-[#3f434a]"
        >
          <span>التخطيط والمقاسات (Dimensions)</span>
          <ChevronDownIcon
            className={`h-3.5 w-3.5 text-[#9aa0a8] transition-transform ${
              openAcc.layout ? "rotate-180" : ""
            }`}
          />
        </button>

        {openAcc.layout && (
          <div className="p-3 bg-white">
            <StudioDimensionsLayoutControl
              settings={settings}
              deviceMode={deviceMode}
              rawSettings={targetSource}
              onResetField={onResetField}
              onUpdateField={onUpdateField}
            />
          </div>
        )}
      </div>

      {/* 6. Accordion: طباعة ونصوص (Typography) */}
      <div className="overflow-hidden rounded-lg border border-[#ececee]">
        <button
          type="button"
          onClick={() => toggleAcc("typography")}
          className="flex w-full items-center justify-between bg-[#fafbfc] px-3 py-2 text-start font-medium text-[#3f434a]"
        >
          <div className="flex items-center gap-1.5 font-bold">
            <LanguageIcon className="h-3.5 w-3.5 text-[#2b6cf6]" />
            <span>طباعة ونصوص (Typography)</span>
          </div>
          <ChevronDownIcon
            className={`h-3.5 w-3.5 text-[#9aa0a8] transition-transform ${
              openAcc.typography ? "rotate-180" : ""
            }`}
          />
        </button>

        {openAcc.typography && (
          <div className="p-3 bg-white space-y-3">
            {/* Font Size & Clamp (Ticket 5R + RESP-1) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="block text-[10px] font-bold text-[#8a8f96]">
                  حجم الخط (Font Size)
                </span>
                {isPropertyOverridden(targetSource, "fontSize", deviceMode as "mobile" | "tablet") &&
                  deviceMode !== "desktop" && (
                    <ResponsiveFieldBadge
                      deviceMode={deviceMode}
                      isCustomized={true}
                      propName="fontSize"
                      onReset={() => onResetField ? onResetField("fontSize") : onUpdateField("fontSize", null)}
                    />
                  )}
              </div>

              {/* Mode Switcher: Fixed vs Fluid (Clamp) */}
              <div className="flex rounded-lg border border-[#ececee] bg-[#f6f7f8] p-0.5 text-[10px]">
                <button
                  type="button"
                  data-testid="btn-font-mode-fixed"
                  onClick={() => {
                    const currentVal = settings.fontSize;
                    if (typeof currentVal === "object" && currentVal !== null) {
                      onUpdateField("fontSize", parseFreeNumber(currentVal.min, 16));
                    }
                  }}
                  className={`flex-1 rounded-md py-1 text-center font-medium transition-all ${
                    typeof settings.fontSize !== "object" && !(typeof settings.fontSize === "string" && settings.fontSize.startsWith("clamp("))
                      ? "bg-white text-[#2b6cf6] shadow-xs font-bold"
                      : "text-[#6f747b] hover:text-[#17181c]"
                  }`}
                >
                  حجم ثابت (Fixed)
                </button>
                <button
                  type="button"
                  data-testid="btn-font-mode-clamp"
                  onClick={() => {
                    if (typeof settings.fontSize !== "object" || !settings.fontSize) {
                      const base = parseFreeNumber(settings.fontSize, 18);
                      onUpdateField("fontSize", {
                        min: Math.max(12, Math.round(base * 0.75)),
                        vw: 2.5,
                        max: Math.round(base * 1.5),
                      });
                    }
                  }}
                  className={`flex-1 rounded-md py-1 text-center font-medium transition-all ${
                    typeof settings.fontSize === "object" || (typeof settings.fontSize === "string" && settings.fontSize.startsWith("clamp("))
                      ? "bg-white text-[#2b6cf6] shadow-xs font-bold"
                      : "text-[#6f747b] hover:text-[#17181c]"
                  }`}
                >
                  حجم مرن (Clamp)
                </button>
              </div>

              {/* Mode: Fluid (Clamp) */}
              {(typeof settings.fontSize === "object" || (typeof settings.fontSize === "string" && settings.fontSize.startsWith("clamp("))) ? (
                <div className="space-y-2 rounded-lg border border-[#ececee] bg-[#fafbfc] p-2" data-testid="clamp-controls-container">
                  <div className="grid grid-cols-3 gap-1.5">
                    {/* min px */}
                    <div>
                      <label className="block text-[8.5px] text-[#8a8f96] mb-0.5">أدنى (Min)</label>
                      <div className="relative">
                        <input
                          type="text"
                          dir="ltr"
                          data-testid="input-clamp-min"
                          value={typeof settings.fontSize === "object" && settings.fontSize?.min !== undefined ? settings.fontSize.min : 18}
                          onChange={(e) => {
                            const clampObj: ClampFontSizeConfig = typeof settings.fontSize === "object" && settings.fontSize
                              ? { ...settings.fontSize, min: parseFreeNumber(e.target.value, 16) }
                              : { min: parseFreeNumber(e.target.value, 16), vw: 2.5, max: 32 };
                            onUpdateField("fontSize", clampObj);
                          }}
                          className="w-full rounded border border-[#ececee] bg-white px-1.5 py-1 text-center font-mono text-[10px] text-[#17181c] outline-none focus:border-[#2b6cf6]"
                        />
                        <span className="absolute end-1 top-1 text-[8px] text-[#8a8f96] pointer-events-none">px</span>
                      </div>
                    </div>

                    {/* vw % */}
                    <div>
                      <label className="block text-[8.5px] text-[#8a8f96] mb-0.5">مرن (Vw)</label>
                      <div className="relative">
                        <input
                          type="text"
                          dir="ltr"
                          data-testid="input-clamp-vw"
                          value={typeof settings.fontSize === "object" && settings.fontSize?.vw !== undefined ? settings.fontSize.vw : 2.5}
                          onChange={(e) => {
                            const clampObj: ClampFontSizeConfig = typeof settings.fontSize === "object" && settings.fontSize
                              ? { ...settings.fontSize, vw: parseFreeNumber(e.target.value, 2.5) }
                              : { min: 18, vw: parseFreeNumber(e.target.value, 2.5), max: 32 };
                            onUpdateField("fontSize", clampObj);
                          }}
                          className="w-full rounded border border-[#ececee] bg-white px-1.5 py-1 text-center font-mono text-[10px] text-[#17181c] outline-none focus:border-[#2b6cf6]"
                        />
                        <span className="absolute end-1 top-1 text-[8px] text-[#8a8f96] pointer-events-none">vw</span>
                      </div>
                    </div>

                    {/* max px */}
                    <div>
                      <label className="block text-[8.5px] text-[#8a8f96] mb-0.5">أقصى (Max)</label>
                      <div className="relative">
                        <input
                          type="text"
                          dir="ltr"
                          data-testid="input-clamp-max"
                          value={typeof settings.fontSize === "object" && settings.fontSize?.max !== undefined ? settings.fontSize.max : 32}
                          onChange={(e) => {
                            const clampObj: ClampFontSizeConfig = typeof settings.fontSize === "object" && settings.fontSize
                              ? { ...settings.fontSize, max: parseFreeNumber(e.target.value, 32) }
                              : { min: 18, vw: 2.5, max: parseFreeNumber(e.target.value, 32) };
                            onUpdateField("fontSize", clampObj);
                          }}
                          className="w-full rounded border border-[#ececee] bg-white px-1.5 py-1 text-center font-mono text-[10px] text-[#17181c] outline-none focus:border-[#2b6cf6]"
                        />
                        <span className="absolute end-1 top-1 text-[8px] text-[#8a8f96] pointer-events-none">px</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Preview Display */}
                  <div
                    data-testid="clamp-live-preview"
                    className="flex items-center justify-between rounded border border-[#e2e8f0] bg-white p-1.5 text-[9px]"
                  >
                    <span className="text-[#8a8f96]">المعادلة:</span>
                    <span className="font-mono font-bold text-[#2b6cf6] dir-ltr text-left">
                      {formatClampFontSize(settings.fontSize) || "clamp(18px, 2.5vw, 32px)"}
                    </span>
                  </div>
                </div>
              ) : (
                /* Mode: Fixed */
                <>
                  <FreeNumberInput
                    label="حجم الخط (px)"
                    value={settings.fontSize ?? 16}
                    min={10}
                    max={96}
                    placeholder="16"
                    deviceMode={deviceMode}
                    isCustomized={isPropertyOverridden(targetSource, "fontSize", deviceMode as "mobile" | "tablet")}
                    propName="fontSize"
                    onReset={() => onResetField ? onResetField("fontSize") : onUpdateField("fontSize", null)}
                    onChange={(val) => onUpdateField("fontSize", val)}
                  />
                  <div className="grid grid-cols-4 gap-1 pt-0.5">
                    {[
                      { label: "14px", val: 14 },
                      { label: "16px", val: 16 },
                      { label: "18px", val: 18 },
                      { label: "24px", val: 24 },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => onUpdateField("fontSize", opt.val)}
                        className={`rounded border py-1 text-center text-[9.5px] transition-all ${
                          parseFreeNumber(settings.fontSize, 16) === opt.val
                            ? "border-[#2b6cf6] bg-[#2b6cf6]/10 text-[#2b6cf6] font-bold"
                            : "border-[#ececee] bg-[#f6f7f8] text-[#6f747b] hover:text-[#17181c]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Alignment / Content Alignment */}
            <div className="space-y-1.5 border-t border-[#f0f1f3] pt-2">
              <div className="flex items-center justify-between">
                <span className="block text-[10px] font-bold text-[#8a8f96]">
                  محاذاة المحتوى والنصوص (Content Align)
                </span>
                {(isPropertyOverridden(targetSource, "contentAlign", deviceMode as "mobile" | "tablet") ||
                  isPropertyOverridden(targetSource, "align", deviceMode as "mobile" | "tablet")) &&
                  deviceMode !== "desktop" && (
                    <ResponsiveFieldBadge
                      deviceMode={deviceMode}
                      isCustomized={true}
                      propName="contentAlign"
                      onReset={() => {
                        if (onResetField) {
                          onResetField("contentAlign");
                          onResetField("align");
                        } else {
                          onUpdateField("contentAlign", null);
                          onUpdateField("align", null);
                        }
                      }}
                    />
                  )}
              </div>
              <div className="flex rounded-lg border border-[#ececee] bg-[#f6f7f8] p-1">
                {[
                  { id: "right", label: "يمين", ca: "start" },
                  { id: "center", label: "وسط", ca: "center" },
                  { id: "left", label: "يسار", ca: "start" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (onBatchUpdateFields) {
                        onBatchUpdateFields({
                          align: item.id,
                          contentAlign: item.ca,
                        });
                      } else {
                        onUpdateField("align", item.id);
                        onUpdateField("contentAlign", item.ca);
                      }
                    }}
                    className={`flex-1 rounded-md py-1 text-center text-[10.5px] font-medium transition-all ${
                      ((settings.contentAlign === "center" && item.id === "center") ||
                       (settings.contentAlign === "start" && item.id === "right" && !settings.align) ||
                       (settings.align === item.id) ||
                       (!settings.contentAlign && !settings.align && item.id === "right"))
                        ? "bg-white text-[#2b6cf6] shadow-xs font-bold"
                        : "text-[#6f747b] hover:text-[#17181c]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7. Accordion: Custom CSS */}
      <div className="overflow-hidden rounded-lg border border-[#ececee]">
        <button
          type="button"
          onClick={() => toggleAcc("css")}
          className="flex w-full items-center justify-between bg-[#fafbfc] px-3 py-2 text-start font-medium text-[#3f434a]"
        >
          <div className="flex items-center gap-1.5">
            <CodeBracketIcon className="h-3.5 w-3.5 text-[#2b6cf6]" />
            <span>تخصيص CSS مباشر (Custom CSS)</span>
          </div>
          <ChevronDownIcon
            className={`h-3.5 w-3.5 text-[#9aa0a8] transition-transform ${
              openAcc.css ? "rotate-180" : ""
            }`}
          />
        </button>

        {openAcc.css && (
          <div className="p-3 bg-white space-y-2">
            <p className="text-[9.5px] text-[#8a8f96] leading-relaxed">
              أضف قواعد CSS مخصصة تُطبق مباشرة على حاوية هذا السيكشن:
            </p>
            <textarea
              rows={3}
              value={customCss}
              onChange={(e) => onUpdateField("customCss", e.target.value)}
              placeholder="/* مثال: border-top: 1px solid #e2e8f0; */"
              className="w-full rounded-md border border-[#ececee] bg-[#1a1b20] p-2 font-mono text-[10.5px] text-[#e8eaee] placeholder-[#666c77] outline-none focus:border-[#2b6cf6] dir-ltr text-left"
              dir="ltr"
            />
          </div>
        )}
      </div>
    </div>
  );
};
