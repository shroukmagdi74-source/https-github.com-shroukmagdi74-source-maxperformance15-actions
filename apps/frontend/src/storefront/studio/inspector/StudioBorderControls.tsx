import React, { useState } from "react";
import { LinkIcon } from "@heroicons/react/24/outline";
import type { StudioDeviceMode, StudioBorderStyle } from "../StudioTypes";
import { FreeNumberInput } from "./StudioDimensionControls";
import { ResponsiveFieldBadge } from "./StudioResponsiveControls";
import {
  parseFreeNumber,
  normalizeArabicDigits,
  isPropertyOverridden,
} from "../utils/studioStyleUtils";

export interface StudioBorderControlsProps {
  settings: Record<string, any>;
  deviceMode?: StudioDeviceMode;
  rawSettings?: Record<string, any>;
  onUpdateField: (field: string, value: any) => void;
  onBatchUpdateFields?: (updates: Record<string, any>) => void;
  onResetField?: (field: string) => void;
}

export const BORDER_STYLE_OPTIONS: Array<{ id: StudioBorderStyle; label: string }> = [
  { id: "solid", label: "متصل" },
  { id: "dashed", label: "متقطع" },
  { id: "dotted", label: "منقط" },
  { id: "double", label: "مزدوج" },
  { id: "none", label: "بدون" },
];

export const StudioBorderControls: React.FC<StudioBorderControlsProps> = ({
  settings = {},
  deviceMode = "desktop",
  rawSettings,
  onUpdateField,
  onBatchUpdateFields,
  onResetField,
}) => {
  const isDeviceOverrideMode = deviceMode === "mobile" || deviceMode === "tablet";
  const targetSource = rawSettings || settings;

  const [isWidthLinked, setIsWidthLinked] = useState<boolean>(true);
  const [isRadiusLinked, setIsRadiusLinked] = useState<boolean>(true);

  // Borders values
  const rawBorder = settings["border"] || settings["borders"];
  const borderObj: Record<string, any> = typeof rawBorder === "object" && rawBorder !== null ? rawBorder : {};

  const currentBorderWidth = parseFreeNumber(
    settings["borderWidth"] ?? borderObj["width"] ?? borderObj["top"] ?? 0,
    0
  );
  const borderTop = parseFreeNumber(
    settings["borderTopWidth"] ?? settings["borderTop"] ?? borderObj["top"] ?? currentBorderWidth,
    0
  );
  const borderRight = parseFreeNumber(
    settings["borderRightWidth"] ?? settings["borderRight"] ?? borderObj["right"] ?? currentBorderWidth,
    0
  );
  const borderBottom = parseFreeNumber(
    settings["borderBottomWidth"] ?? settings["borderBottom"] ?? borderObj["bottom"] ?? currentBorderWidth,
    0
  );
  const borderLeft = parseFreeNumber(
    settings["borderLeftWidth"] ?? settings["borderLeft"] ?? borderObj["left"] ?? currentBorderWidth,
    0
  );

  const borderStyle: StudioBorderStyle =
    (settings["borderStyle"] || borderObj["style"] || borderObj["borderStyle"] || "solid") as StudioBorderStyle;
  const borderColor: string =
    (settings["borderColor"] || borderObj["color"] || borderObj["borderColor"] || "#e2e8f0") as string;

  // Radius values
  const baseRadius = parseFreeNumber(settings["borderRadius"], 0);
  const radiusTopLeft = parseFreeNumber(settings["borderRadiusTopLeft"] ?? baseRadius, 0);
  const radiusTopRight = parseFreeNumber(settings["borderRadiusTopRight"] ?? baseRadius, 0);
  const radiusBottomRight = parseFreeNumber(settings["borderRadiusBottomRight"] ?? baseRadius, 0);
  const radiusBottomLeft = parseFreeNumber(settings["borderRadiusBottomLeft"] ?? baseRadius, 0);

  // Overlay values
  const rawOverlay = settings["overlay"];
  const overlayObj: Record<string, any> = typeof rawOverlay === "object" && rawOverlay !== null ? rawOverlay : {};
  const overlayColor =
    (settings["overlayColor"] || overlayObj["color"] || "#000000") as string;
  const overlayOpacity = parseFreeNumber(
    settings["overlayOpacity"] ?? overlayObj["opacity"] ?? 0,
    0
  );

  // Overall Element Opacity
  const elementOpacity =
    settings["opacity"] !== undefined ? parseFreeNumber(settings["opacity"], 1) : 1;

  const handleUpdate = (field: string, val: any) => {
    onUpdateField(field, val);
  };

  const handleBatchUpdate = (updates: Record<string, any>) => {
    if (onBatchUpdateFields) {
      onBatchUpdateFields(updates);
    } else {
      Object.entries(updates).forEach(([k, v]) => onUpdateField(k, v));
    }
  };

  const handleWidthChange = (
    side: "all" | "top" | "right" | "bottom" | "left",
    val: number | string
  ) => {
    const numVal = parseFreeNumber(val, 0);
    if (side === "all" || isWidthLinked) {
      handleBatchUpdate({
        borderWidth: numVal,
        borderTopWidth: numVal,
        borderRightWidth: numVal,
        borderBottomWidth: numVal,
        borderLeftWidth: numVal,
        borderTop: numVal,
        borderRight: numVal,
        borderBottom: numVal,
        borderLeft: numVal,
      });
    } else {
      const fieldMap: Record<string, string> = {
        top: "borderTopWidth",
        right: "borderRightWidth",
        bottom: "borderBottomWidth",
        left: "borderLeftWidth",
      };
      const field = fieldMap[side] || "borderTopWidth";
      handleUpdate(field, numVal);
    }
  };

  const handleRadiusChange = (
    corner: "all" | "topLeft" | "topRight" | "bottomRight" | "bottomLeft",
    val: number | string
  ) => {
    const numVal = parseFreeNumber(val, 0);
    if (corner === "all" || isRadiusLinked) {
      handleBatchUpdate({
        borderRadius: numVal,
        borderRadiusTopLeft: numVal,
        borderRadiusTopRight: numVal,
        borderRadiusBottomRight: numVal,
        borderRadiusBottomLeft: numVal,
      });
    } else {
      const fieldMap: Record<string, string> = {
        topLeft: "borderRadiusTopLeft",
        topRight: "borderRadiusTopRight",
        bottomRight: "borderRadiusBottomRight",
        bottomLeft: "borderRadiusBottomLeft",
      };
      const field = fieldMap[corner] || "borderRadiusTopLeft";
      handleUpdate(field, numVal);
    }
  };

  const isBorderCustomized =
    isDeviceOverrideMode &&
    (isPropertyOverridden(targetSource, "borderWidth", deviceMode as "mobile" | "tablet") ||
      isPropertyOverridden(targetSource, "borderTopWidth", deviceMode as "mobile" | "tablet") ||
      isPropertyOverridden(targetSource, "borderColor", deviceMode as "mobile" | "tablet"));

  const isRadiusCustomized =
    isDeviceOverrideMode &&
    (isPropertyOverridden(targetSource, "borderRadius", deviceMode as "mobile" | "tablet") ||
      isPropertyOverridden(targetSource, "borderRadiusTopLeft", deviceMode as "mobile" | "tablet"));

  const isOpacityCustomized =
    isDeviceOverrideMode &&
    isPropertyOverridden(targetSource, "opacity", deviceMode as "mobile" | "tablet");

  return (
    <div data-testid="studio-border-controls" className="space-y-3.5 select-none text-[11px] text-[#17181c]">
      {/* 1. الحدود (Borders per side) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#3f434a]">سُمك الحدود (Border Width)</span>
          <div className="flex items-center gap-1.5">
            {isBorderCustomized && (
              <ResponsiveFieldBadge
                deviceMode={deviceMode}
                isCustomized={true}
                propName="borderWidth"
                onReset={() => onResetField?.("borderWidth")}
              />
            )}
            <button
              type="button"
              data-testid="toggle-link-border-width"
              onClick={() => setIsWidthLinked(!isWidthLinked)}
              title={isWidthLinked ? "فصل الحدود لكل جهة" : "ربط كل الجهات"}
              className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                isWidthLinked
                  ? "border-[#2b6cf6] bg-[#2b6cf6]/10 text-[#2b6cf6]"
                  : "border-[#ececee] bg-[#f6f7f8] text-[#8a8f96] hover:text-[#17181c]"
              }`}
            >
              <LinkIcon className="h-3 w-3" />
            </button>
          </div>
        </div>

        {isWidthLinked ? (
          <FreeNumberInput
            label="سُمك الحدود (px)"
            value={borderTop}
            min={0}
            max={50}
            placeholder="0"
            deviceMode={deviceMode}
            onChange={(val) => handleWidthChange("all", Number(val))}
          />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <FreeNumberInput
              label="أعلى (Top)"
              value={borderTop}
              min={0}
              max={50}
              placeholder="0"
              deviceMode={deviceMode}
              onChange={(val) => handleWidthChange("top", Number(val))}
            />
            <FreeNumberInput
              label="يمين (Right)"
              value={borderRight}
              min={0}
              max={50}
              placeholder="0"
              deviceMode={deviceMode}
              onChange={(val) => handleWidthChange("right", Number(val))}
            />
            <FreeNumberInput
              label="أسفل (Bottom)"
              value={borderBottom}
              min={0}
              max={50}
              placeholder="0"
              deviceMode={deviceMode}
              onChange={(val) => handleWidthChange("bottom", Number(val))}
            />
            <FreeNumberInput
              label="يسار (Left)"
              value={borderLeft}
              min={0}
              max={50}
              placeholder="0"
              deviceMode={deviceMode}
              onChange={(val) => handleWidthChange("left", Number(val))}
            />
          </div>
        )}

        {/* Style & Color */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#f0f1f3]">
          {/* Border Style */}
          <div className="space-y-1">
            <span className="block text-[10px] text-[#8a8f96]">نمط الحد</span>
            <select
              value={borderStyle}
              data-testid="select-border-style"
              onChange={(e) => handleUpdate("borderStyle", e.target.value)}
              className="w-full rounded border border-[#ececee] bg-[#f6f7f8] px-2 py-1 text-[10.5px] outline-none focus:border-[#2b6cf6]"
            >
              {BORDER_STYLE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} ({opt.id})
                </option>
              ))}
            </select>
          </div>

          {/* Border Color */}
          <div className="space-y-1">
            <span className="block text-[10px] text-[#8a8f96]">لون الحد</span>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={borderColor.startsWith("#") ? borderColor : "#e2e8f0"}
                onChange={(e) => handleUpdate("borderColor", e.target.value)}
                className="h-6 w-6 cursor-pointer rounded border border-[#ececee] bg-transparent"
              />
              <input
                type="text"
                dir="ltr"
                value={borderColor}
                onChange={(e) => {
                  const normalized = normalizeArabicDigits(e.target.value).trim();
                  handleUpdate("borderColor", normalized);
                }}
                className="w-full rounded border border-[#ececee] px-1.5 py-0.5 text-[10px] font-mono text-center text-[#17181c]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. استدارة الزوايا (Radius per corner) */}
      <div className="space-y-2 border-t border-[#f0f1f3] pt-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#3f434a]">استدارة الزوايا (Corner Radius)</span>
          <div className="flex items-center gap-1.5">
            {isRadiusCustomized && (
              <ResponsiveFieldBadge
                deviceMode={deviceMode}
                isCustomized={true}
                propName="borderRadius"
                onReset={() => onResetField?.("borderRadius")}
              />
            )}
            <button
              type="button"
              data-testid="toggle-link-border-radius"
              onClick={() => setIsRadiusLinked(!isRadiusLinked)}
              title={isRadiusLinked ? "فصل الأركان" : "ربط كل الأركان"}
              className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                isRadiusLinked
                  ? "border-[#2b6cf6] bg-[#2b6cf6]/10 text-[#2b6cf6]"
                  : "border-[#ececee] bg-[#f6f7f8] text-[#8a8f96] hover:text-[#17181c]"
              }`}
            >
              <LinkIcon className="h-3 w-3" />
            </button>
          </div>
        </div>

        {isRadiusLinked ? (
          <FreeNumberInput
            label="نصف القطر (px)"
            value={radiusTopLeft}
            min={0}
            max={100}
            placeholder="0"
            deviceMode={deviceMode}
            onChange={(val) => handleRadiusChange("all", Number(val))}
          />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <FreeNumberInput
              label="أعلى يمين"
              value={radiusTopRight}
              min={0}
              max={100}
              placeholder="0"
              deviceMode={deviceMode}
              onChange={(val) => handleRadiusChange("topRight", Number(val))}
            />
            <FreeNumberInput
              label="أعلى يسار"
              value={radiusTopLeft}
              min={0}
              max={100}
              placeholder="0"
              deviceMode={deviceMode}
              onChange={(val) => handleRadiusChange("topLeft", Number(val))}
            />
            <FreeNumberInput
              label="أسفل يمين"
              value={radiusBottomRight}
              min={0}
              max={100}
              placeholder="0"
              deviceMode={deviceMode}
              onChange={(val) => handleRadiusChange("bottomRight", Number(val))}
            />
            <FreeNumberInput
              label="أسفل يسار"
              value={radiusBottomLeft}
              min={0}
              max={100}
              placeholder="0"
              deviceMode={deviceMode}
              onChange={(val) => handleRadiusChange("bottomLeft", Number(val))}
            />
          </div>
        )}

        <div className="grid grid-cols-4 gap-1 pt-0.5">
          {[
            { label: "0px", val: 0 },
            { label: "8px", val: 8 },
            { label: "16px", val: 16 },
            { label: "24px", val: 24 },
          ].map((opt) => (
            <button
              key={opt.val}
              type="button"
              onClick={() => handleRadiusChange("all", opt.val)}
              className={`rounded border py-1 text-center text-[9.5px] transition-all ${
                radiusTopLeft === opt.val && isRadiusLinked
                  ? "border-[#2b6cf6] bg-[#2b6cf6]/10 text-[#2b6cf6] font-bold"
                  : "border-[#ececee] bg-[#f6f7f8] text-[#6f747b] hover:text-[#17181c]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. طبقة التعتيم الفوقية (Overlay) */}
      <div className="space-y-2 border-t border-[#f0f1f3] pt-2.5">
        <span className="font-bold text-[#3f434a]">طبقة فوقية ملونة (Overlay)</span>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-[#ececee] bg-[#fafbfc] p-2 space-y-1">
            <span className="block text-[10px] text-[#8a8f96]">لون الطبقة</span>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                data-testid="input-overlay-color"
                value={overlayColor.startsWith("#") ? overlayColor : "#000000"}
                onChange={(e) => handleUpdate("overlayColor", e.target.value)}
                className="h-6 w-6 cursor-pointer rounded border border-[#ececee] bg-transparent"
              />
              <input
                type="text"
                dir="ltr"
                value={overlayColor}
                onChange={(e) => {
                  const normalized = normalizeArabicDigits(e.target.value).trim();
                  handleUpdate("overlayColor", normalized);
                }}
                className="w-full rounded border border-[#ececee] px-1 py-0.5 text-[10px] font-mono text-center text-[#17181c]"
              />
            </div>
          </div>

          <div className="rounded-lg border border-[#ececee] bg-[#fafbfc] p-2 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-[#8a8f96]">
              <span>شفافية الطبقة</span>
              <span className="font-mono font-bold text-[#17181c]">
                {Math.round(overlayOpacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              data-testid="input-overlay-opacity"
              value={overlayOpacity}
              onChange={(e) => handleUpdate("overlayOpacity", parseFloat(e.target.value))}
              className="w-full accent-[#2b6cf6] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. شفافية العنصر العامة (Opacity) */}
      <div className="space-y-1.5 border-t border-[#f0f1f3] pt-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#3f434a]">شفافية العنصر (Opacity)</span>
          <div className="flex items-center gap-1.5">
            {isOpacityCustomized && (
              <ResponsiveFieldBadge
                deviceMode={deviceMode}
                isCustomized={true}
                propName="opacity"
                onReset={() => onResetField?.("opacity")}
              />
            )}
            <span className="font-mono font-bold text-[#2b6cf6]">
              {Math.round(elementOpacity * 100)}%
            </span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          data-testid="input-element-opacity"
          value={elementOpacity}
          onChange={(e) => handleUpdate("opacity", parseFloat(e.target.value))}
          className="w-full accent-[#2b6cf6] cursor-pointer"
        />
      </div>
    </div>
  );
};
