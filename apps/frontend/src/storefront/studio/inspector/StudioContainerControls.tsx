import React, { useState } from "react";
import {
  ChevronDownIcon,
  Squares2X2Icon,
  ArrowsPointingOutIcon,
  ViewColumnsIcon,
  LinkIcon,
  RectangleStackIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { FreeNumberInput } from "./StudioDimensionControls";
import {
  ContainerSettings,
  ContainerResponsiveSettings,
  StudioDeviceMode,
  DEFAULT_CONTAINER_SETTINGS,
} from "../StudioTypes";
import { parseFreeNumber } from "../utils/studioStyleUtils";
import { ResponsiveFieldBadge } from "./StudioResponsiveControls";

export interface StudioContainerControlsProps {
  settings: Record<string, any> | ContainerSettings;
  deviceMode?: StudioDeviceMode;
  rawSettings?: Record<string, any> | ContainerSettings;
  onResetField?: (field: string) => void;
  onUpdateField: (field: string, value: any) => void;
  onBatchUpdateFields?: (updates: Record<string, any>) => void;
  onSave?: () => void;
}

export const GRID_FRACTION_PRESETS: Array<{
  id: string;
  label: string;
  fractions: number[] | null;
  description: string;
}> = [
  { id: "equal", label: "متساوي", fractions: null, description: "أعمدة متساوية 1fr" },
  { id: "2:1", label: "2:1", fractions: [2, 1], description: "العمود الأول ضعف الثاني (66% / 33%)" },
  { id: "1:2", label: "1:2", fractions: [1, 2], description: "العمود الثاني ضعف الأول (33% / 66%)" },
  { id: "3:1", label: "3:1", fractions: [3, 1], description: "عمود عريض وشريط جانبي (75% / 25%)" },
  { id: "1:3", label: "1:3", fractions: [1, 3], description: "شريط جانبي وعمود عريض (25% / 75%)" },
  { id: "70/30", label: "70/30", fractions: [70, 30], description: "نسبة 70% إلى 30%" },
];

export const StudioChildLayoutControls: React.FC<{
  settings: Record<string, any>;
  deviceMode?: StudioDeviceMode;
  onUpdateField: (field: string, value: any) => void;
  onBatchUpdateFields?: (updates: Record<string, any>) => void;
  onSave?: () => void;
}> = ({ settings = {}, onUpdateField, onSave }) => {
  const currentOrder = typeof settings["order"] === "number" ? (settings["order"] as number) : 0;
  const currentSpan = typeof settings["columnSpan"] === "number" ? (settings["columnSpan"] as number) : 1;

  const handleUpdate = (field: string, val: any) => {
    onUpdateField(field, val);
    onSave?.();
  };

  return (
    <div data-child-layout-controls="true" className="space-y-3.5">
      {/* 1. Order (الترتيب) */}
      <div data-control="child-order" className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#8a8f96]">
            ترتيب الظهور (Order)
          </span>
          <span className="text-[10px] font-mono font-bold text-[#2b6cf6]">
            {currentOrder}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-action="decrement-order"
            onClick={() => handleUpdate("order", currentOrder - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ececee] bg-[#f6f7f8] text-[13px] font-bold text-[#6f747b] hover:bg-[#ececee] transition-colors"
          >
            -
          </button>
          <input
            type="number"
            data-testid="input-child-order"
            data-field="order"
            value={currentOrder}
            onChange={(e) => handleUpdate("order", Number(e.target.value))}
            className="flex-1 rounded-lg border border-[#ececee] bg-[#f6f7f8] px-2.5 py-1 text-center font-mono text-[11px] text-[#17181c] focus:bg-white focus:border-[#2b6cf6] outline-none"
          />
          <button
            type="button"
            data-action="increment-order"
            onClick={() => handleUpdate("order", currentOrder + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ececee] bg-[#f6f7f8] text-[13px] font-bold text-[#6f747b] hover:bg-[#ececee] transition-colors"
          >
            +
          </button>
        </div>
        <p className="text-[9px] text-[#8a8f96]">
          تحديد أسبقية ظهور هذا العنصر بالنسبة للعناصر الأخرى في نفس الحاوية (CSS Order).
        </p>
      </div>

      {/* 2. Column Span (الامتداد) */}
      <div data-control="child-column-span" className="space-y-1.5 border-t border-[#f0f1f3] pt-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#8a8f96]">
            امتداد الأعمدة (Column Span)
          </span>
          <span className="text-[10px] font-mono font-bold text-[#2b6cf6]">
            {currentSpan} {currentSpan === 1 ? "عمود" : "أعمدة"}
          </span>
        </div>
        <div className="grid grid-cols-6 gap-1">
          {[1, 2, 3, 4, 5, 6].map((span) => (
            <button
              key={span}
              type="button"
              data-span-btn={String(span)}
              onClick={() => handleUpdate("columnSpan", span)}
              className={`rounded-md py-1 text-center font-mono text-[10.5px] font-bold transition-all ${
                currentSpan === span
                  ? "border border-[#2b6cf6] bg-[#2b6cf6]/10 text-[#2b6cf6]"
                  : "border border-[#ececee] bg-[#f6f7f8] text-[#6f747b] hover:text-[#17181c]"
              }`}
            >
              {span}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <input
            type="number"
            min={1}
            max={6}
            data-testid="input-child-span"
            data-field="columnSpan"
            value={currentSpan}
            onChange={(e) => handleUpdate("columnSpan", Math.max(1, Number(e.target.value)))}
            className="w-20 rounded-lg border border-[#ececee] bg-[#f6f7f8] px-2.5 py-1 text-center font-mono text-[11px] text-[#17181c] focus:bg-white focus:border-[#2b6cf6] outline-none"
          />
          <span className="text-[9.5px] text-[#8a8f96]">
            عدد الأعمدة التي يشغلها العنصر (grid-column: span N)
          </span>
        </div>
      </div>
    </div>
  );
};

export const StudioContainerControls: React.FC<StudioContainerControlsProps> = ({
  settings = {},
  deviceMode = "desktop",
  onUpdateField,
  onBatchUpdateFields,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<"container" | "child">("container");

  const [openAcc, setOpenAcc] = useState<{ [key: string]: boolean }>({
    direction: true,
    grid: true,
    childLayout: true,
    spacing: true,
    padding: true,
  });

  const [isPaddingLinked, setIsPaddingLinked] = useState<boolean>(
    (settings as any)["paddingLinked"] ?? true
  );

  const toggleAcc = (key: string) => {
    setOpenAcc((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isDeviceOverrideMode = deviceMode === "mobile" || deviceMode === "tablet";
  const responsiveObj: Record<string, ContainerResponsiveSettings | undefined> =
    (settings["responsive"] as any) || {};
  const currentDeviceOverrides: ContainerResponsiveSettings =
    (isDeviceOverrideMode ? responsiveObj[deviceMode] : undefined) || {};

  // Helper to read effective value for current inspector deviceMode
  const getValue = <T,>(field: string, fallback: T): T => {
    if (isDeviceOverrideMode && (currentDeviceOverrides as any)[field] !== undefined) {
      return (currentDeviceOverrides as any)[field] as unknown as T;
    }
    if ((settings as any)[field] !== undefined) {
      return (settings as any)[field] as T;
    }
    return fallback;
  };

  const direction = getValue<"column" | "row">(
    "direction",
    DEFAULT_CONTAINER_SETTINGS.direction || "column"
  );
  const columns = getValue<number>("columns", DEFAULT_CONTAINER_SETTINGS.columns || 1);
  const gap = getValue<number>("gap", DEFAULT_CONTAINER_SETTINGS.gap ?? 12);
  const align = getValue<"start" | "center" | "end" | "stretch">(
    "align",
    DEFAULT_CONTAINER_SETTINGS.align || "stretch"
  );
  const wrap = getValue<boolean>("wrap", Boolean(DEFAULT_CONTAINER_SETTINGS.wrap));

  const columnFractions = getValue<number[] | string | null | undefined>(
    "columnFractions",
    (settings as any)["columnFractions"]
  );
  const columnWidths = getValue<number[] | string | null | undefined>(
    "columnWidths",
    (settings as any)["columnWidths"]
  );

  const paddingTop = parseFreeNumber(
    getValue<number | string>("paddingTop", (settings as any)["padding"] ?? 0),
    0
  );
  const paddingBottom = parseFreeNumber(
    getValue<number | string>("paddingBottom", (settings as any)["padding"] ?? 0),
    0
  );
  const paddingLeft = parseFreeNumber(
    getValue<number | string>("paddingLeft", (settings as any)["padding"] ?? 0),
    0
  );
  const paddingRight = parseFreeNumber(
    getValue<number | string>("paddingRight", (settings as any)["padding"] ?? 0),
    0
  );

  // Dispatch single field update respecting deviceMode
  const handleUpdate = (field: string, value: any) => {
    if (isDeviceOverrideMode) {
      const nextResponsive = {
        ...responsiveObj,
        [deviceMode]: {
          ...(responsiveObj[deviceMode] || {}),
          [field]: value,
        },
      };

      if (onBatchUpdateFields) {
        onBatchUpdateFields({
          [field]: value,
          responsive: nextResponsive,
        });
      } else {
        onUpdateField("responsive", nextResponsive);
        onUpdateField(field, value);
      }
    } else {
      onUpdateField(field, value);
    }
    onSave?.();
  };

  // Dispatch multi-field update (batch) respecting deviceMode
  const handleBatchUpdate = (updates: Record<string, any>) => {
    if (isDeviceOverrideMode) {
      const nextDeviceOverrides = {
        ...(responsiveObj[deviceMode] || {}),
        ...updates,
      };
      const nextResponsive = {
        ...responsiveObj,
        [deviceMode]: nextDeviceOverrides,
      };

      if (onBatchUpdateFields) {
        onBatchUpdateFields({
          ...updates,
          responsive: nextResponsive,
        });
      } else {
        onUpdateField("responsive", nextResponsive);
        Object.entries(updates).forEach(([k, v]) => onUpdateField(k, v));
      }
    } else {
      if (onBatchUpdateFields) {
        onBatchUpdateFields(updates);
      } else {
        Object.entries(updates).forEach(([k, v]) => onUpdateField(k, v));
      }
    }
    onSave?.();
  };

  const handleResetProp = (field: string) => {
    if (isDeviceOverrideMode) {
      const nextOverrides = { ...(responsiveObj[deviceMode] || {}) };
      delete (nextOverrides as any)[field];
      const nextResponsive = {
        ...responsiveObj,
        [deviceMode]: nextOverrides,
      };
      if (onBatchUpdateFields) {
        onBatchUpdateFields({
          [field]: null,
          responsive: nextResponsive,
        });
      } else {
        onUpdateField("responsive", nextResponsive);
        onUpdateField(field, null);
      }
    } else {
      onUpdateField(field, null);
    }
    onSave?.();
  };

  // Preset Fractions handler (writes columnFractions, clears columnWidths)
  const handleSetFractionPreset = (fractions: number[] | null) => {
    if (fractions === null) {
      handleResetColumnsEqual();
      return;
    }
    handleBatchUpdate({
      columnFractions: fractions,
      columnWidths: null,
    });
  };

  // Reset to Equal handler (removes both columnFractions and columnWidths)
  const handleResetColumnsEqual = () => {
    handleBatchUpdate({
      columnFractions: null,
      columnWidths: null,
    });
  };

  // Column Widths % change handler
  const currentWidthsArray: number[] = (() => {
    if (Array.isArray(columnWidths) && columnWidths.length === columns) {
      return columnWidths.map((w) => Number(w));
    }
    const equalW = Math.round(100 / Math.max(1, columns));
    return Array.from({ length: columns }, () => equalW);
  })();

  const handleColumnWidthChange = (colIndex: number, newWidth: number) => {
    const nextWidths = [...currentWidthsArray];
    nextWidths[colIndex] = newWidth;
    handleBatchUpdate({
      columnWidths: nextWidths,
      columnFractions: null,
    });
  };

  const handlePaddingChange = (
    side: "top" | "bottom" | "left" | "right",
    val: number
  ) => {
    if (isPaddingLinked) {
      handleBatchUpdate({
        paddingTop: val,
        paddingBottom: val,
        paddingLeft: val,
        paddingRight: val,
        padding: val,
        paddingLinked: true,
      });
    } else {
      const fieldMap: Record<string, string> = {
        top: "paddingTop",
        bottom: "paddingBottom",
        left: "paddingLeft",
        right: "paddingRight",
      };
      const field = fieldMap[side] || "paddingTop";
      handleUpdate(field, val);
    }
  };

  const handleTogglePaddingLinked = () => {
    const nextLinked = !isPaddingLinked;
    setIsPaddingLinked(nextLinked);
    handleUpdate("paddingLinked", nextLinked);
  };

  return (
    <div
      data-studio-container-controls="true"
      className="space-y-3.5 select-none text-[11.5px] text-[#17181c]"
    >
      {/* Tab Switcher: Container vs Child Item (في تبويب الطفل الواحد: حقل الترتيب والامتداد) */}
      <div className="flex items-center rounded-lg border border-[#ececee] bg-[#f6f7f8] p-1 gap-1">
        <button
          type="button"
          data-tab="container"
          role="tab"
          aria-selected={activeTab === "container"}
          onClick={() => setActiveTab("container")}
          className={`flex-1 rounded-md py-1.5 text-center text-[10.5px] font-medium transition-all ${
            activeTab === "container"
              ? "bg-white text-[#2b6cf6] shadow-xs font-bold"
              : "text-[#6f747b] hover:text-[#17181c]"
          }`}
        >
          إعدادات الحاوية
        </button>
        <button
          type="button"
          data-tab="child"
          role="tab"
          aria-selected={activeTab === "child"}
          data-testid="container-child-tab"
          onClick={() => setActiveTab("child")}
          className={`flex-1 rounded-md py-1.5 text-center text-[10.5px] font-medium transition-all ${
            activeTab === "child"
              ? "bg-white text-[#2b6cf6] shadow-xs font-bold"
              : "text-[#6f747b] hover:text-[#17181c]"
          }`}
        >
          عنصر الطفل (Child)
        </button>
      </div>

      {/* Device Mode Context Notification */}
      {isDeviceOverrideMode && (
        <div
          data-container-responsive-notice="true"
          data-testid="container-responsive-notice"
          className="rounded-lg border border-blue-200 bg-blue-50/80 p-2 text-start text-[10.5px] text-blue-900 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold">
              تخصيص {deviceMode === "mobile" ? "الجوال (Mobile)" : "التابلت (Tablet)"}
            </span>
            <span
              data-container-override-badge="true"
              data-testid="container-override-badge"
              className="rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs"
            >
              responsive.{deviceMode}
            </span>
          </div>
          <p className="mt-0.5 text-[9.5px] text-blue-700">
            أي تعديل هنا يُحفظ في إعدادات {deviceMode === "mobile" ? "الجوال" : "التابلت"} فقط دون تغيير الديسكتوب.
          </p>
        </div>
      )}

      {/* VIEW A: Child Item View (عند التواجد في تبويب الطفل الواحد) */}
      {activeTab === "child" && (
        <div className="overflow-hidden rounded-lg border border-[#ececee] bg-white p-3 space-y-3">
          <div className="flex items-center gap-1.5 font-bold text-[#3f434a] border-b border-[#f0f1f3] pb-2">
            <RectangleStackIcon className="h-3.5 w-3.5 text-[#2b6cf6]" />
            <span>خصائص ترتيب وامتداد العنصر (Grid Item)</span>
          </div>
          <StudioChildLayoutControls
            settings={settings}
            deviceMode={deviceMode}
            onUpdateField={handleUpdate}
            onBatchUpdateFields={handleBatchUpdate}
            onSave={onSave}
          />
        </div>
      )}

      {/* VIEW B: Container View (إعدادات الحاوية والأعمدة) */}
      {activeTab === "container" && (
        <>
          {/* 1. Accordion: Direction & Alignment (الاتجاه والمحاذاة) */}
          <div className="overflow-hidden rounded-lg border border-[#ececee]">
            <button
              type="button"
              onClick={() => toggleAcc("direction")}
              className="flex w-full items-center justify-between bg-[#fafbfc] px-3 py-2 text-start font-medium text-[#3f434a]"
            >
              <div className="flex items-center gap-1.5 font-bold">
                <Squares2X2Icon className="h-3.5 w-3.5 text-[#2b6cf6]" />
                <span>اتجاه وتدفق الحاوية (Flex Flow)</span>
              </div>
              <ChevronDownIcon
                className={`h-3.5 w-3.5 text-[#9aa0a8] transition-transform ${
                  openAcc["direction"] ? "rotate-180" : ""
                }`}
              />
            </button>

            {openAcc["direction"] && (
              <div className="p-3 bg-white space-y-3">
                {/* Direction Segmented (row vs column) */}
                <div data-control="container-direction" className="space-y-1.5">
                  <span className="block text-[10px] font-bold text-[#8a8f96]">
                    اتجاه العناصر (Direction)
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-[#ececee] bg-[#f6f7f8] p-1">
                    <button
                      type="button"
                      data-direction-btn="column"
                      onClick={() => handleUpdate("direction", "column")}
                      className={`rounded-md py-1.5 text-center text-[10.5px] font-medium transition-all ${
                        direction === "column"
                          ? "bg-white text-[#2b6cf6] shadow-xs font-bold"
                          : "text-[#6f747b] hover:text-[#17181c]"
                      }`}
                    >
                      عمودي (Column)
                    </button>
                    <button
                      type="button"
                      data-direction-btn="row"
                      onClick={() => handleUpdate("direction", "row")}
                      className={`rounded-md py-1.5 text-center text-[10.5px] font-medium transition-all ${
                        direction === "row"
                          ? "bg-white text-[#2b6cf6] shadow-xs font-bold"
                          : "text-[#6f747b] hover:text-[#17181c]"
                      }`}
                    >
                      أفقي (Row)
                    </button>
                  </div>
                </div>

                {/* Align Select / Segmented (start | center | end | stretch) */}
                <div data-control="container-align" className="border-t border-[#f0f1f3] pt-2.5 space-y-1.5">
                  <span className="block text-[10px] font-bold text-[#8a8f96]">
                    محاذاة العناصر (Alignment)
                  </span>
                  <div className="grid grid-cols-4 gap-1 rounded-lg border border-[#ececee] bg-[#f6f7f8] p-1">
                    {[
                      { id: "stretch", label: "تمدد" },
                      { id: "start", label: "بداية" },
                      { id: "center", label: "توسيط" },
                      { id: "end", label: "نهاية" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        data-align-btn={item.id}
                        onClick={() => handleUpdate("align", item.id)}
                        className={`rounded-md py-1 text-center text-[10px] font-medium transition-all ${
                          align === item.id
                            ? "bg-white text-[#2b6cf6] shadow-xs font-bold"
                            : "text-[#6f747b] hover:text-[#17181c]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wrap Toggle */}
                <div data-control="container-wrap" className="border-t border-[#f0f1f3] pt-2.5 flex items-center justify-between">
                  <div>
                    <span className="block text-[10.5px] font-bold text-[#17181c]">
                      التفاف العناصر (Flex Wrap)
                    </span>
                    <span className="text-[9px] text-[#8a8f96]">
                      انتقال العناصر للسطر التالي عند ضيق المساحة
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={wrap}
                    data-wrap-toggle="true"
                    onClick={() => handleUpdate("wrap", !wrap)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      wrap ? "bg-[#2b6cf6]" : "bg-[#d1d5db]"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        wrap ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Accordion: Grid & Columns (الشبكة والأعمدة 1-6 + نِسَب الأعمدة وبريسيتات) */}
          <div className="overflow-hidden rounded-lg border border-[#ececee]">
            <button
              type="button"
              onClick={() => toggleAcc("grid")}
              className="flex w-full items-center justify-between bg-[#fafbfc] px-3 py-2 text-start font-medium text-[#3f434a]"
            >
              <div className="flex items-center gap-1.5 font-bold">
                <ViewColumnsIcon className="h-3.5 w-3.5 text-[#2b6cf6]" />
                <span>الأعمدة والشبكة (Grid Columns 1-6)</span>
              </div>
              <ChevronDownIcon
                className={`h-3.5 w-3.5 text-[#9aa0a8] transition-transform ${
                  openAcc["grid"] ? "rotate-180" : ""
                }`}
              />
            </button>

            {openAcc["grid"] && (
              <div className="p-3 bg-white space-y-3.5">
                <div data-control="container-columns" className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#8a8f96]">
                      عدد الأعمدة (1-6)
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#2b6cf6]">
                      {columns} {columns === 1 ? "عمود (Flex)" : "أعمدة (Grid)"}
                    </span>
                  </div>

                  {/* Stepper & Number Pills */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      data-action="decrement-columns"
                      disabled={columns <= 1}
                      onClick={() => handleUpdate("columns", Math.max(1, columns - 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ececee] bg-[#f6f7f8] text-[13px] font-bold text-[#6f747b] hover:bg-[#ececee] disabled:opacity-40 transition-colors"
                    >
                      -
                    </button>

                    <div className="grid flex-1 grid-cols-6 gap-1">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          data-columns-btn={String(num)}
                          onClick={() => handleUpdate("columns", num)}
                          className={`rounded-md py-1 text-center font-mono text-[10.5px] font-bold transition-all ${
                            columns === num
                              ? "border border-[#2b6cf6] bg-[#2b6cf6]/10 text-[#2b6cf6]"
                              : "border border-[#ececee] bg-[#f6f7f8] text-[#6f747b] hover:text-[#17181c]"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      data-action="increment-columns"
                      disabled={columns >= 6}
                      onClick={() => handleUpdate("columns", Math.min(6, columns + 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ececee] bg-[#f6f7f8] text-[13px] font-bold text-[#6f747b] hover:bg-[#ececee] disabled:opacity-40 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* GRID-1: اختيار نسب جاهزة (متساوي · 2:1 · 1:2 · 3:1 · 1:3 · 70/30) writes columnFractions */}
                {columns > 1 && (
                  <div data-control="column-fractions-presets" className="border-t border-[#f0f1f3] pt-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#8a8f96]">
                        نِسَب الأعمدة الجاهزة (Presets)
                      </span>
                      {columnFractions ? (
                        <span className="text-[9px] font-mono text-[#2b6cf6]">
                          {Array.isArray(columnFractions)
                            ? columnFractions.join(":")
                            : String(columnFractions)}
                        </span>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {GRID_FRACTION_PRESETS.map((p) => {
                        const isSelected =
                          p.fractions === null
                            ? !columnFractions && !columnWidths
                            : Array.isArray(columnFractions) &&
                              columnFractions.length === p.fractions.length &&
                              columnFractions.every((val, i) => val === p.fractions![i]);

                        return (
                          <button
                            key={p.id}
                            type="button"
                            data-preset={p.id}
                            data-fraction-preset={p.id}
                            title={p.description}
                            onClick={() => handleSetFractionPreset(p.fractions)}
                            className={`rounded-md py-1.5 text-center font-mono text-[10px] font-bold transition-all ${
                              isSelected
                                ? "border border-[#2b6cf6] bg-[#2b6cf6]/10 text-[#2b6cf6]"
                                : "border border-[#ececee] bg-[#f6f7f8] text-[#6f747b] hover:text-[#17181c]"
                            }`}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* GRID-1: سلايدر/أرقام لعرض كل عمود % (يظهر بس لما columns>1) — writes columnWidths مع زر إرجاع للمتساوي */}
                {columns > 1 && (
                  <div data-control="column-widths-custom" className="border-t border-[#f0f1f3] pt-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#8a8f96]">
                        عرض كل عمود (% كاستم)
                      </span>
                      <button
                        type="button"
                        data-action="reset-columns-equal"
                        onClick={handleResetColumnsEqual}
                        className="flex items-center gap-1 text-[9.5px] font-bold text-[#2b6cf6] hover:underline"
                        title="إلغاء النسب والكاستم والرجوع لأعمدة متساوية"
                      >
                        <ArrowPathIcon className="h-3 w-3" />
                        <span>إرجاع للمتساوي</span>
                      </button>
                    </div>

                    <div className="space-y-1.5 bg-[#fbfcfd] p-2 rounded-lg border border-[#f0f1f3]">
                      {Array.from({ length: columns }).map((_, colIdx) => {
                        const val = currentWidthsArray[colIdx] ?? Math.round(100 / columns);
                        return (
                          <div key={colIdx} className="flex items-center gap-2">
                            <span className="w-14 shrink-0 text-[10px] font-bold text-[#6f747b]">
                              العمود {colIdx + 1}
                            </span>
                            <input
                              type="range"
                              min={5}
                              max={95}
                              value={val}
                              onChange={(e) => handleColumnWidthChange(colIdx, Number(e.target.value))}
                              className="flex-1 h-1.5 bg-[#ececee] rounded-lg appearance-none cursor-pointer accent-[#2b6cf6]"
                              data-testid={`slider-col-width-${colIdx}`}
                            />
                            <div className="flex items-center gap-1 w-16 justify-end">
                              <input
                                type="number"
                                min={5}
                                max={95}
                                value={val}
                                onChange={(e) => handleColumnWidthChange(colIdx, Number(e.target.value))}
                                className="w-12 rounded border border-[#ececee] bg-white px-1 py-0.5 text-center font-mono text-[10.5px] text-[#17181c]"
                                data-testid={`input-col-width-${colIdx}`}
                              />
                              <span className="text-[10px] text-[#8a8f96]">%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Accordion: Spacing & Gap (الفجوة) */}
          <div className="overflow-hidden rounded-lg border border-[#ececee]">
            <button
              type="button"
              onClick={() => toggleAcc("spacing")}
              className="flex w-full items-center justify-between bg-[#fafbfc] px-3 py-2 text-start font-medium text-[#3f434a]"
            >
              <div className="flex items-center gap-1.5 font-bold">
                <ArrowsPointingOutIcon className="h-3.5 w-3.5 text-[#2b6cf6]" />
                <span>الفجوة بين العناصر (Gap)</span>
              </div>
              <ChevronDownIcon
                className={`h-3.5 w-3.5 text-[#9aa0a8] transition-transform ${
                  openAcc["spacing"] ? "rotate-180" : ""
                }`}
              />
            </button>

            {openAcc["spacing"] && (
              <div className="p-3 bg-white space-y-3">
                <div data-control="container-gap">
                  <FreeNumberInput
                    label="الفجوة (Gap)"
                    value={gap}
                    min={0}
                    max={120}
                    step={2}
                    unit="px"
                    placeholder="12"
                    onChange={(val) => handleUpdate("gap", Number(val))}
                  />
                </div>

                {/* Quick Gap Presets */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { label: "0px", val: 0 },
                    { label: "8px", val: 8 },
                    { label: "12px", val: 12 },
                    { label: "24px", val: 24 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      data-gap-preset={String(p.val)}
                      onClick={() => handleUpdate("gap", p.val)}
                      className={`rounded-md py-1 text-center font-mono text-[9.5px] transition-all ${
                        gap === p.val
                          ? "border border-[#2b6cf6] bg-[#2b6cf6]/10 text-[#2b6cf6] font-bold"
                          : "border border-[#ececee] bg-[#f6f7f8] text-[#6f747b] hover:text-[#17181c]"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Accordion: Padding (حشو الحاوية) */}
          <div className="overflow-hidden rounded-lg border border-[#ececee]">
            <button
              type="button"
              onClick={() => toggleAcc("padding")}
              className="flex w-full items-center justify-between bg-[#fafbfc] px-3 py-2 text-start font-medium text-[#3f434a]"
            >
              <div className="flex items-center gap-1.5 font-bold">
                <ArrowsPointingOutIcon className="h-3.5 w-3.5 text-[#2b6cf6]" />
                <span>حشو الحاوية (Padding)</span>
              </div>
              <ChevronDownIcon
                className={`h-3.5 w-3.5 text-[#9aa0a8] transition-transform ${
                  openAcc["padding"] ? "rotate-180" : ""
                }`}
              />
            </button>

            {openAcc["padding"] && (
              <div className="p-3 bg-white space-y-3" data-control="container-padding">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[#8a8f96]">
                      الحشو الداخلي (Padding)
                    </span>
                    {isDeviceOverrideMode &&
                      (currentDeviceOverrides.paddingTop !== undefined ||
                       currentDeviceOverrides.paddingBottom !== undefined ||
                       currentDeviceOverrides.paddingLeft !== undefined ||
                       currentDeviceOverrides.paddingRight !== undefined) && (
                        <ResponsiveFieldBadge
                          deviceMode={deviceMode}
                          isCustomized={true}
                          propName="padding"
                          onReset={() => {
                            handleResetProp("paddingTop");
                            handleResetProp("paddingBottom");
                            handleResetProp("paddingLeft");
                            handleResetProp("paddingRight");
                          }}
                        />
                      )}
                  </div>
                  <button
                    type="button"
                    onClick={handleTogglePaddingLinked}
                    title={isPaddingLinked ? "فك ربط الجهات" : "ربط جميع الجهات بقيمة واحدة"}
                    className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[9.5px] font-semibold transition-colors ${
                      isPaddingLinked
                        ? "bg-[#2b6cf6]/10 text-[#2b6cf6]"
                        : "bg-[#f6f7f8] text-[#8a8f96] hover:text-[#17181c]"
                    }`}
                  >
                    <LinkIcon className="h-3 w-3" />
                    <span>{isPaddingLinked ? "مربوط (Uniform)" : "منفصل"}</span>
                  </button>
                </div>

                {isPaddingLinked ? (
                  <FreeNumberInput
                    label="كافة الجهات"
                    value={paddingTop}
                    min={0}
                    max={200}
                    unit="px"
                    deviceMode={deviceMode}
                    isCustomized={
                      currentDeviceOverrides.paddingTop !== undefined ||
                      currentDeviceOverrides.paddingBottom !== undefined ||
                      currentDeviceOverrides.paddingLeft !== undefined ||
                      currentDeviceOverrides.paddingRight !== undefined
                    }
                    propName="padding"
                    onReset={() => {
                      handleResetProp("paddingTop");
                      handleResetProp("paddingBottom");
                      handleResetProp("paddingLeft");
                      handleResetProp("paddingRight");
                    }}
                    onChange={(val) => handlePaddingChange("top", Number(val))}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <FreeNumberInput
                      label="أعلى (Top)"
                      value={paddingTop}
                      min={0}
                      max={200}
                      unit="px"
                      deviceMode={deviceMode}
                      isCustomized={currentDeviceOverrides.paddingTop !== undefined}
                      propName="paddingTop"
                      onReset={() => handleResetProp("paddingTop")}
                      onChange={(val) => handlePaddingChange("top", Number(val))}
                    />
                    <FreeNumberInput
                      label="أسفل (Bottom)"
                      value={paddingBottom}
                      min={0}
                      max={200}
                      unit="px"
                      deviceMode={deviceMode}
                      isCustomized={currentDeviceOverrides.paddingBottom !== undefined}
                      propName="paddingBottom"
                      onReset={() => handleResetProp("paddingBottom")}
                      onChange={(val) => handlePaddingChange("bottom", Number(val))}
                    />
                    <FreeNumberInput
                      label="يمين (Right)"
                      value={paddingRight}
                      min={0}
                      max={200}
                      unit="px"
                      deviceMode={deviceMode}
                      isCustomized={currentDeviceOverrides.paddingRight !== undefined}
                      propName="paddingRight"
                      onReset={() => handleResetProp("paddingRight")}
                      onChange={(val) => handlePaddingChange("right", Number(val))}
                    />
                    <FreeNumberInput
                      label="يسار (Left)"
                      value={paddingLeft}
                      min={0}
                      max={200}
                      unit="px"
                      deviceMode={deviceMode}
                      isCustomized={currentDeviceOverrides.paddingLeft !== undefined}
                      propName="paddingLeft"
                      onReset={() => handleResetProp("paddingLeft")}
                      onChange={(val) => handlePaddingChange("left", Number(val))}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 5. Accordion: Child Item Grid Layout (الترتيب والامتداد للعنصر) */}
          <div className="overflow-hidden rounded-lg border border-[#ececee]">
            <button
              type="button"
              onClick={() => toggleAcc("childLayout")}
              className="flex w-full items-center justify-between bg-[#fafbfc] px-3 py-2 text-start font-medium text-[#3f434a]"
            >
              <div className="flex items-center gap-1.5 font-bold">
                <RectangleStackIcon className="h-3.5 w-3.5 text-[#2b6cf6]" />
                <span>الترتيب والامتداد (Grid Item: Order & Span)</span>
              </div>
              <ChevronDownIcon
                className={`h-3.5 w-3.5 text-[#9aa0a8] transition-transform ${
                  openAcc["childLayout"] ? "rotate-180" : ""
                }`}
              />
            </button>

            {openAcc["childLayout"] && (
              <div className="p-3 bg-white">
                <StudioChildLayoutControls
                  settings={settings}
                  deviceMode={deviceMode}
                  onUpdateField={handleUpdate}
                  onBatchUpdateFields={handleBatchUpdate}
                  onSave={onSave}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
