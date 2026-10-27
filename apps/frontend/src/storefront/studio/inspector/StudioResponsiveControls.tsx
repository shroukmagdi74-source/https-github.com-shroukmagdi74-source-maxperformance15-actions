import React, { useState } from "react";
import {
  ComputerDesktopIcon,
  DeviceTabletIcon,
  DevicePhoneMobileIcon,
  EyeSlashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import type { StudioDeviceMode } from "../StudioTypes";
import {
  StudioBreakpoints,
  DEFAULT_STUDIO_BREAKPOINTS,
  validateBreakpoints,
  DeviceHiddenOnConfig,
  parseFreeNumber,
} from "../utils/studioStyleUtils";

export interface ResponsiveFieldBadgeProps {
  deviceMode?: StudioDeviceMode;
  isCustomized?: boolean;
  onReset?: () => void;
  className?: string;
  propName?: string;
}

/**
 * Micro-badge indicating per-breakpoint customization (Ticket 5R).
 * When active on mobile/tablet:
 * - Shows badge: «مُخصص للجوال» / «مُخصص للتابلت»
 * - Shows button: «إرجاع للأساسي» (clears the override key)
 */
export const ResponsiveFieldBadge: React.FC<ResponsiveFieldBadgeProps> = ({
  deviceMode = "desktop",
  isCustomized = true,
  onReset,
  className = "",
  propName,
}) => {
  if (deviceMode === "desktop" || !isCustomized) return null;

  return (
    <div
      data-responsive-badge-container={propName || "true"}
      className={`inline-flex items-center gap-1.5 ${className}`}
    >
      <span
        data-testid={propName ? `badge-customized-${propName}` : "responsive-customized-badge"}
        data-responsive-badge="true"
        className="inline-flex items-center gap-0.5 rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700"
      >
        {deviceMode === "mobile" ? "مُخصص للجوال" : "مُخصص للتابلت"}
      </span>
      {onReset && (
        <button
          type="button"
          data-action={propName ? `reset-${propName}` : "reset-to-base"}
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          title="إرجاع للأساسي"
          className="text-[9px] font-medium text-red-600 hover:text-red-700 hover:underline cursor-pointer"
        >
          إرجاع للأساسي
        </button>
      )}
    </div>
  );
};

export interface ResponsivePropertyHeaderProps {
  label: string;
  propName?: string;
  deviceMode?: StudioDeviceMode;
  isCustomized?: boolean;
  onReset?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const ResponsivePropertyHeader: React.FC<ResponsivePropertyHeaderProps> = ({
  label,
  propName,
  deviceMode = "desktop",
  isCustomized = false,
  onReset,
  className = "",
  children,
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold text-[#3f434a]">{label}</span>
        {isCustomized && (
          <ResponsiveFieldBadge
            deviceMode={deviceMode}
            isCustomized={isCustomized}
            propName={propName}
            onReset={onReset}
          />
        )}
      </div>
      {children}
    </div>
  );
};

export interface StudioDeviceVisibilityControlProps {
  hiddenOn?: DeviceHiddenOnConfig;
  onChange: (hiddenOn: DeviceHiddenOnConfig) => void;
  className?: string;
  label?: string;
}

/**
 * Control for selectively hiding sections/elements per device (Ticket RESP-1).
 * Generates media query scoped display:none without leaking inline styles to desktop.
 */
export const StudioDeviceVisibilityControl: React.FC<StudioDeviceVisibilityControlProps> = ({
  hiddenOn = {},
  onChange,
  className = "",
  label = "الظهور والإخفاء بالجهاز",
}) => {
  const isHiddenDesktop = Boolean(hiddenOn.desktop);
  const isHiddenTablet = Boolean(hiddenOn.tablet);
  const isHiddenMobile = Boolean(hiddenOn.mobile);

  const toggle = (device: "desktop" | "tablet" | "mobile") => {
    const next: DeviceHiddenOnConfig = {
      ...hiddenOn,
      [device]: !hiddenOn[device],
    };
    onChange(next);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[#8a8f96]">{label}</span>
        {(isHiddenDesktop || isHiddenTablet || isHiddenMobile) && (
          <button
            type="button"
            data-testid="btn-reset-hidden-on"
            onClick={() => onChange({ desktop: false, tablet: false, mobile: false })}
            className="text-[9px] font-medium text-red-600 hover:text-red-700 cursor-pointer"
          >
            إظهار على الكل
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {/* Desktop */}
        <button
          type="button"
          data-testid="visibility-btn-desktop"
          data-device="desktop"
          data-hidden={isHiddenDesktop ? "true" : "false"}
          onClick={() => toggle("desktop")}
          className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-all ${
            isHiddenDesktop
              ? "border-red-300 bg-red-50 text-red-700 font-bold"
              : "border-[#ececee] bg-[#f6f7f8] text-[#3f434a] hover:bg-white"
          }`}
          title={isHiddenDesktop ? "مخفي على سطح المكتب" : "ظاهر على سطح المكتب"}
        >
          <div className="flex items-center gap-1">
            <ComputerDesktopIcon className="h-3.5 w-3.5" />
            {isHiddenDesktop ? (
              <EyeSlashIcon className="h-3 w-3 text-red-600" />
            ) : (
              <EyeIcon className="h-3 w-3 text-emerald-600" />
            )}
          </div>
          <span className="text-[10px] mt-1">سطح المكتب</span>
          <span className={`text-[8.5px] ${isHiddenDesktop ? "text-red-600 font-semibold" : "text-[#8a8f96]"}`}>
            {isHiddenDesktop ? "مخفي" : "ظاهر"}
          </span>
        </button>

        {/* Tablet */}
        <button
          type="button"
          data-testid="visibility-btn-tablet"
          data-device="tablet"
          data-hidden={isHiddenTablet ? "true" : "false"}
          onClick={() => toggle("tablet")}
          className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-all ${
            isHiddenTablet
              ? "border-red-300 bg-red-50 text-red-700 font-bold"
              : "border-[#ececee] bg-[#f6f7f8] text-[#3f434a] hover:bg-white"
          }`}
          title={isHiddenTablet ? "مخفي على التابلت" : "ظاهر على التابلت"}
        >
          <div className="flex items-center gap-1">
            <DeviceTabletIcon className="h-3.5 w-3.5" />
            {isHiddenTablet ? (
              <EyeSlashIcon className="h-3 w-3 text-red-600" />
            ) : (
              <EyeIcon className="h-3 w-3 text-emerald-600" />
            )}
          </div>
          <span className="text-[10px] mt-1">تابلت</span>
          <span className={`text-[8.5px] ${isHiddenTablet ? "text-red-600 font-semibold" : "text-[#8a8f96]"}`}>
            {isHiddenTablet ? "مخفي" : "ظاهر"}
          </span>
        </button>

        {/* Mobile */}
        <button
          type="button"
          data-testid="visibility-btn-mobile"
          data-device="mobile"
          data-hidden={isHiddenMobile ? "true" : "false"}
          onClick={() => toggle("mobile")}
          className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-all ${
            isHiddenMobile
              ? "border-red-300 bg-red-50 text-red-700 font-bold"
              : "border-[#ececee] bg-[#f6f7f8] text-[#3f434a] hover:bg-white"
          }`}
          title={isHiddenMobile ? "مخفي على الجوال" : "ظاهر على الجوال"}
        >
          <div className="flex items-center gap-1">
            <DevicePhoneMobileIcon className="h-3.5 w-3.5" />
            {isHiddenMobile ? (
              <EyeSlashIcon className="h-3 w-3 text-red-600" />
            ) : (
              <EyeIcon className="h-3 w-3 text-emerald-600" />
            )}
          </div>
          <span className="text-[10px] mt-1">جوال</span>
          <span className={`text-[8.5px] ${isHiddenMobile ? "text-red-600 font-semibold" : "text-[#8a8f96]"}`}>
            {isHiddenMobile ? "مخفي" : "ظاهر"}
          </span>
        </button>
      </div>
    </div>
  );
};

export interface StudioBreakpointsControlProps {
  breakpoints?: Partial<StudioBreakpoints>;
  onChange: (breakpoints: StudioBreakpoints) => void;
  className?: string;
}

/**
 * Editor for custom responsive breakpoints (Ticket RESP-1).
 * Strictly enforces limits [320-1920] and non-intersecting order (mobile < tablet < desktop).
 */
export const StudioBreakpointsControl: React.FC<StudioBreakpointsControlProps> = ({
  breakpoints,
  onChange,
  className = "",
}) => {
  const current: StudioBreakpoints = {
    mobile: breakpoints?.mobile ?? DEFAULT_STUDIO_BREAKPOINTS.mobile,
    tablet: breakpoints?.tablet ?? DEFAULT_STUDIO_BREAKPOINTS.tablet,
    desktop: breakpoints?.desktop ?? DEFAULT_STUDIO_BREAKPOINTS.desktop,
  };

  const [localValues, setLocalValues] = useState<{ [key: string]: string }>({
    mobile: String(current.mobile),
    tablet: String(current.tablet),
    desktop: String(current.desktop),
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (field: "mobile" | "tablet" | "desktop", rawVal: string) => {
    setLocalValues((prev) => ({ ...prev, [field]: rawVal }));
    const parsed = parseFreeNumber(rawVal, NaN);
    if (isNaN(parsed)) return;

    const nextAttempt = {
      ...current,
      [field]: parsed,
    };

    const validation = validateBreakpoints(nextAttempt, current);
    if (!validation.valid) {
      setErrorMessage(validation.error || "قيم نقاط التوقف غير صالحة");
      return;
    }

    setErrorMessage(null);
    onChange(nextAttempt);
  };

  const handleReset = () => {
    setLocalValues({
      mobile: String(DEFAULT_STUDIO_BREAKPOINTS.mobile),
      tablet: String(DEFAULT_STUDIO_BREAKPOINTS.tablet),
      desktop: String(DEFAULT_STUDIO_BREAKPOINTS.desktop),
    });
    setErrorMessage(null);
    onChange(DEFAULT_STUDIO_BREAKPOINTS);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[#8a8f96]">
          نقاط التوقف المخصصة (Breakpoints px)
        </span>
        <button
          type="button"
          data-testid="btn-reset-breakpoints"
          onClick={handleReset}
          className="text-[9px] font-medium text-[#2b6cf6] hover:underline cursor-pointer"
        >
          استعادة الافتراضي
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* Mobile max */}
        <div>
          <label className="block text-[9px] text-[#8a8f96] mb-0.5">الجوال (Max)</label>
          <div className="relative">
            <input
              type="text"
              dir="ltr"
              data-testid="input-breakpoint-mobile"
              value={localValues.mobile}
              onChange={(e) => handleInputChange("mobile", e.target.value)}
              className="w-full rounded border border-[#ececee] bg-[#f6f7f8] px-2 py-1 text-center font-mono text-[10.5px] text-[#17181c] focus:bg-white focus:border-[#2b6cf6] outline-none"
            />
            <span className="absolute end-1.5 top-1 text-[8.5px] text-[#8a8f96] pointer-events-none">
              px
            </span>
          </div>
        </div>

        {/* Tablet max */}
        <div>
          <label className="block text-[9px] text-[#8a8f96] mb-0.5">التابلت (Max)</label>
          <div className="relative">
            <input
              type="text"
              dir="ltr"
              data-testid="input-breakpoint-tablet"
              value={localValues.tablet}
              onChange={(e) => handleInputChange("tablet", e.target.value)}
              className="w-full rounded border border-[#ececee] bg-[#f6f7f8] px-2 py-1 text-center font-mono text-[10.5px] text-[#17181c] focus:bg-white focus:border-[#2b6cf6] outline-none"
            />
            <span className="absolute end-1.5 top-1 text-[8.5px] text-[#8a8f96] pointer-events-none">
              px
            </span>
          </div>
        </div>

        {/* Desktop min */}
        <div>
          <label className="block text-[9px] text-[#8a8f96] mb-0.5">المكتب (Min)</label>
          <div className="relative">
            <input
              type="text"
              dir="ltr"
              data-testid="input-breakpoint-desktop"
              value={localValues.desktop}
              onChange={(e) => handleInputChange("desktop", e.target.value)}
              className="w-full rounded border border-[#ececee] bg-[#f6f7f8] px-2 py-1 text-center font-mono text-[10.5px] text-[#17181c] focus:bg-white focus:border-[#2b6cf6] outline-none"
            />
            <span className="absolute end-1.5 top-1 text-[8.5px] text-[#8a8f96] pointer-events-none">
              px
            </span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div
          data-testid="breakpoint-error-message"
          role="alert"
          className="flex items-start gap-1 rounded bg-red-50 p-1.5 text-[9.5px] text-red-700 border border-red-200"
        >
          <ExclamationTriangleIcon className="h-3.5 w-3.5 shrink-0 text-red-500 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
