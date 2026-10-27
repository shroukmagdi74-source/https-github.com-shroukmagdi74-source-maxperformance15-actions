import React from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import type { StudioDeviceMode, StudioPositionMode } from "../StudioTypes";
import { FreeNumberInput } from "./StudioDimensionControls";
import { ResponsiveFieldBadge } from "./StudioResponsiveControls";
import { parseFreeNumber, isPropertyOverridden } from "../utils/studioStyleUtils";

export interface StudioPositionControlsProps {
  settings: Record<string, any>;
  deviceMode?: StudioDeviceMode;
  rawSettings?: Record<string, any>;
  onUpdateField: (field: string, value: any) => void;
  onBatchUpdateFields?: (updates: Record<string, any>) => void;
  onResetField?: (field: string) => void;
}

export const POSITION_MODES: Array<{
  id: StudioPositionMode;
  label: string;
  description: string;
}> = [
  { id: "static", label: "تلقائي (Static)", description: "التدفق الطبيعي للمستند" },
  { id: "relative", label: "نسبي (Relative)", description: "نسبي لموضعه الأصلي" },
  { id: "absolute", label: "مطلق (Absolute)", description: "مطلق لأقرب حاوية محددة" },
  { id: "sticky", label: "مثبت (Sticky)", description: "يثبت أثناء التمرير" },
];

export const StudioPositionControls: React.FC<StudioPositionControlsProps> = ({
  settings = {},
  deviceMode = "desktop",
  rawSettings,
  onUpdateField,
  onBatchUpdateFields,
  onResetField,
}) => {
  const isDeviceOverrideMode = deviceMode === "mobile" || deviceMode === "tablet";
  const targetSource = rawSettings || settings;

  const currentPosition: StudioPositionMode =
    (settings["position"] || "static") as StudioPositionMode;

  const top = settings["top"] !== undefined ? parseFreeNumber(settings["top"], 0) : undefined;
  const right = settings["right"] !== undefined ? parseFreeNumber(settings["right"], 0) : undefined;
  const bottom = settings["bottom"] !== undefined ? parseFreeNumber(settings["bottom"], 0) : undefined;
  const left = settings["left"] !== undefined ? parseFreeNumber(settings["left"], 0) : undefined;

  const zIndex = settings["zIndex"] !== undefined ? parseFreeNumber(settings["zIndex"], 0) : undefined;

  // Transform fields
  const rotate = parseFreeNumber(settings["rotate"], 0);
  const scale = settings["scale"] !== undefined ? parseFreeNumber(settings["scale"], 1) : 1;
  const translateX = parseFreeNumber(settings["translateX"], 0);
  const translateY = parseFreeNumber(settings["translateY"], 0);

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

  const handleResetTransforms = () => {
    handleBatchUpdate({
      rotate: null,
      scale: null,
      translateX: null,
      translateY: null,
      transform: null,
    });
  };

  const isPositionCustomized =
    isDeviceOverrideMode &&
    isPropertyOverridden(targetSource, "position", deviceMode as "mobile" | "tablet");

  const isInsetsCustomized =
    isDeviceOverrideMode &&
    (isPropertyOverridden(targetSource, "top", deviceMode as "mobile" | "tablet") ||
      isPropertyOverridden(targetSource, "bottom", deviceMode as "mobile" | "tablet") ||
      isPropertyOverridden(targetSource, "left", deviceMode as "mobile" | "tablet") ||
      isPropertyOverridden(targetSource, "right", deviceMode as "mobile" | "tablet"));

  const isZIndexCustomized =
    isDeviceOverrideMode &&
    isPropertyOverridden(targetSource, "zIndex", deviceMode as "mobile" | "tablet");

  const isTransformCustomized =
    isDeviceOverrideMode &&
    (isPropertyOverridden(targetSource, "rotate", deviceMode as "mobile" | "tablet") ||
      isPropertyOverridden(targetSource, "scale", deviceMode as "mobile" | "tablet") ||
      isPropertyOverridden(targetSource, "translateX", deviceMode as "mobile" | "tablet") ||
      isPropertyOverridden(targetSource, "translateY", deviceMode as "mobile" | "tablet"));

  const hasTransformActive =
    rotate !== 0 || scale !== 1 || translateX !== 0 || translateY !== 0 || Boolean(settings["transform"]);

  return (
    <div data-testid="studio-position-controls" className="space-y-3.5 select-none text-[11px] text-[#17181c]">
      {/* 1. نوع الموضع (Position Mode) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#3f434a]">نوع الموضع (Position)</span>
          {isPositionCustomized && (
            <ResponsiveFieldBadge
              deviceMode={deviceMode}
              isCustomized={true}
              propName="position"
              onReset={() => onResetField?.("position")}
            />
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {POSITION_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              data-testid={`btn-position-${mode.id}`}
              onClick={() => handleUpdate("position", mode.id)}
              className={`rounded-lg border p-2 text-start transition-all ${
                currentPosition === mode.id
                  ? "border-[#2b6cf6] bg-[#2b6cf6]/10 text-[#2b6cf6] font-bold"
                  : "border-[#ececee] bg-[#f6f7f8] text-[#6f747b] hover:text-[#17181c]"
              }`}
            >
              <span className="block text-[10.5px]">{mode.label}</span>
              <span className="text-[9px] text-[#8a8f96] font-normal leading-tight">{mode.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. الإزاحات (Top / Right / Bottom / Left) */}
      {currentPosition !== "static" && (
        <div className="space-y-2 border-t border-[#f0f1f3] pt-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#3f434a]">الإزاحات (Offsets / Insets px)</span>
            {isInsetsCustomized && (
              <ResponsiveFieldBadge
                deviceMode={deviceMode}
                isCustomized={true}
                propName="insets"
                onReset={() => {
                  onResetField?.("top");
                  onResetField?.("right");
                  onResetField?.("bottom");
                  onResetField?.("left");
                }}
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <FreeNumberInput
              label="أعلى (Top)"
              value={top ?? 0}
              min={-500}
              max={1000}
              placeholder="auto"
              deviceMode={deviceMode}
              onChange={(val) => handleUpdate("top", Number(val))}
            />
            <FreeNumberInput
              label="يمين (Right)"
              value={right ?? 0}
              min={-500}
              max={1000}
              placeholder="auto"
              deviceMode={deviceMode}
              onChange={(val) => handleUpdate("right", Number(val))}
            />
            <FreeNumberInput
              label="أسفل (Bottom)"
              value={bottom ?? 0}
              min={-500}
              max={1000}
              placeholder="auto"
              deviceMode={deviceMode}
              onChange={(val) => handleUpdate("bottom", Number(val))}
            />
            <FreeNumberInput
              label="يسار (Left)"
              value={left ?? 0}
              min={-500}
              max={1000}
              placeholder="auto"
              deviceMode={deviceMode}
              onChange={(val) => handleUpdate("left", Number(val))}
            />
          </div>
        </div>
      )}

      {/* 3. ترتيب الطبقات (Z-Index) */}
      <div className="space-y-1.5 border-t border-[#f0f1f3] pt-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#3f434a]">ترتيب الطبقات (Z-Index)</span>
          {isZIndexCustomized && (
            <ResponsiveFieldBadge
              deviceMode={deviceMode}
              isCustomized={true}
              propName="zIndex"
              onReset={() => onResetField?.("zIndex")}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            data-testid="input-z-index"
            value={zIndex ?? ""}
            placeholder="تلقائي (auto)"
            onChange={(e) => {
              const val = e.target.value === "" ? null : Number(e.target.value);
              handleUpdate("zIndex", val);
            }}
            className="w-24 rounded-lg border border-[#ececee] bg-[#f6f7f8] px-2.5 py-1 text-center font-mono text-[11px] text-[#17181c] focus:bg-white focus:border-[#2b6cf6] outline-none"
          />
          <div className="flex items-center gap-1">
            {[0, 10, 50, 100].map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => handleUpdate("zIndex", z)}
                className={`rounded border px-2 py-1 text-center font-mono text-[9.5px] transition-all ${
                  zIndex === z
                    ? "border-[#2b6cf6] bg-[#2b6cf6]/10 text-[#2b6cf6] font-bold"
                    : "border-[#ececee] bg-[#f6f7f8] text-[#6f747b] hover:text-[#17181c]"
                }`}
              >
                {z}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. التحويلات الهندسية (Transform: Rotate / Scale / Translate) */}
      <div className="space-y-2 border-t border-[#f0f1f3] pt-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#3f434a]">التحويل الهندسي (Transform)</span>
          <div className="flex items-center gap-1.5">
            {isTransformCustomized && (
              <ResponsiveFieldBadge
                deviceMode={deviceMode}
                isCustomized={true}
                propName="transform"
                onReset={handleResetTransforms}
              />
            )}
            {hasTransformActive && (
              <button
                type="button"
                onClick={handleResetTransforms}
                title="إعادة ضبط التحويلات"
                className="flex items-center gap-1 text-[9.5px] text-[#8a8f96] hover:text-red-600 transition-colors"
              >
                <ArrowPathIcon className="h-3 w-3" />
                <span>إعادة ضبط</span>
              </button>
            )}
          </div>
        </div>

        {/* Rotate & Scale */}
        <div className="grid grid-cols-2 gap-2">
          {/* Rotate */}
          <div className="rounded-lg border border-[#ececee] bg-[#fafbfc] p-2 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-[#8a8f96]">
              <span>الدوران (Rotate)</span>
              <span className="font-mono font-bold text-[#17181c]">{rotate}°</span>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              data-testid="input-transform-rotate"
              value={rotate}
              onChange={(e) => handleUpdate("rotate", Number(e.target.value))}
              className="w-full accent-[#2b6cf6] cursor-pointer"
            />
          </div>

          {/* Scale */}
          <div className="rounded-lg border border-[#ececee] bg-[#fafbfc] p-2 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-[#8a8f96]">
              <span>المقياس (Scale)</span>
              <span className="font-mono font-bold text-[#17181c]">{scale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={2.5}
              step={0.05}
              data-testid="input-transform-scale"
              value={scale}
              onChange={(e) => handleUpdate("scale", parseFloat(e.target.value))}
              className="w-full accent-[#2b6cf6] cursor-pointer"
            />
          </div>
        </div>

        {/* Translate X & Y */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <FreeNumberInput
            label="إزاحة أففية X (px)"
            value={translateX}
            min={-300}
            max={300}
            placeholder="0"
            deviceMode={deviceMode}
            onChange={(val) => handleUpdate("translateX", Number(val))}
          />
          <FreeNumberInput
            label="إزاحة رأسية Y (px)"
            value={translateY}
            min={-300}
            max={300}
            placeholder="0"
            deviceMode={deviceMode}
            onChange={(val) => handleUpdate("translateY", Number(val))}
          />
        </div>
      </div>
    </div>
  );
};
