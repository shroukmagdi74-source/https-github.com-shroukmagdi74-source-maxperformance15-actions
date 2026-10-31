import React from "react";
import {
  CalendarIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import {
  headingStyle,
  panelStyle,
  controlInputStyle,
  primaryActionStyle,
  disabledActionStyle,
} from "./styles";

export interface FacebookScheduleAndPublishProps {
  isScheduled: boolean;
  onIsScheduledChange: (val: boolean) => void;
  scheduledDate: string;
  onScheduledDateChange: (val: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  disabled: boolean;
}

export const FacebookScheduleAndPublish: React.FC<
  FacebookScheduleAndPublishProps
> = ({
  isScheduled,
  onIsScheduledChange,
  scheduledDate,
  onScheduledDateChange,
  onSubmit,
  submitting,
  disabled,
}) => {
  const { t } = useTranslation();

  return (
    <div className="business-page-panel p-5" style={panelStyle}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 space-x-reverse mb-2">
            <input
              type="checkbox"
              id="schedule"
              checked={isScheduled}
              onChange={(e) => onIsScheduledChange(e.target.checked)}
              className="h-4 w-4 rounded"
              style={{ accentColor: "var(--color-primary)" }}
            />
            <label
              htmlFor="schedule"
              className="cursor-pointer select-none font-medium text-sm"
              style={headingStyle}
            >
              {t("facebookPostCreator.scheduleLabel")}
            </label>
          </div>
          {isScheduled && (
            <div className="mt-2">
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => onScheduledDateChange(e.target.value)}
                className="block w-full rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/40"
                style={controlInputStyle}
              />
              <p
                className="mt-1 text-xs"
                style={{ color: "var(--business-warning)" }}
              >
                {t("facebookPostCreator.scheduleHint")}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onSubmit}
          disabled={disabled}
          className={`flex w-full items-center justify-center rounded-lg px-8 py-3 font-bold transition-all transform hover:-translate-y-0.5 sm:w-auto ${
            disabled ? "cursor-not-allowed" : ""
          }`}
          style={disabled ? disabledActionStyle : primaryActionStyle}
          aria-label={
            submitting
              ? t("facebookPostCreator.publishing")
              : isScheduled
                ? t("facebookPostCreator.schedulePost")
                : t("facebookPostCreator.publishNow")
          }
        >
          {submitting ? (
            t("facebookPostCreator.publishing")
          ) : (
            <>
              <PaperAirplaneIcon
                className={`w-5 h-5 ml-2 ${isScheduled ? "hidden" : ""}`}
              />
              <CalendarIcon
                className={`w-5 h-5 ml-2 ${!isScheduled ? "hidden" : ""}`}
              />
              {isScheduled
                ? t("facebookPostCreator.schedulePost")
                : t("facebookPostCreator.publishNow")}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
