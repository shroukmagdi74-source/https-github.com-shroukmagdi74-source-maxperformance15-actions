import React from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  RefreshCw,
  Search,
  Zap,
  List,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
} from "lucide-react";
import { ViewMode } from "../ScheduleCalendar";
import { MODAL_INPUT_CLS } from "../shared";
import { STATUS_META, todayKey } from "./types";

interface ScheduleHeaderProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  search: string;
  onSearchChange: (search: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
  onToday: () => void;
  onRefresh: () => void;
  onOpenNew: (asWalkIn: boolean) => void;
}

const VIEW_TABS: { id: ViewMode; label: string; icon: typeof List }[] = [
  { id: "list", label: "radiology.scheduleCalendar.viewList", icon: List },
  { id: "day", label: "radiology.scheduleCalendar.viewDay", icon: CalendarDays },
  { id: "week", label: "radiology.scheduleCalendar.viewWeek", icon: CalendarRange },
  { id: "month", label: "radiology.scheduleCalendar.viewMonth", icon: CalendarCheck },
];

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  view,
  onViewChange,
  search,
  onSearchChange,
  status,
  onStatusChange,
  onToday,
  onRefresh,
  onOpenNew,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold">{t("radiology.schedule.title")}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("radiology.schedule.subtitle")}
        </p>
      </div>

      <div className="flex items-center gap-1.5 border dark:border-gray-600 rounded-lg p-1">
        {VIEW_TABS.map((v) => (
          <button
            key={v.id}
            onClick={() => onViewChange(v.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === v.id
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <v.icon className="w-4 h-4" />
            {t(v.label as never)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onToday}
          className="px-3 py-2 border dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {t("radiology.schedule.today")}
        </button>
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3 top-2.5 text-gray-400 dark:text-gray-500" />
          <input
            className={`${MODAL_INPUT_CLS} pr-9 w-44`}
            placeholder={t("radiology.schedule.searchByPatient")}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <select
          className={MODAL_INPUT_CLS}
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">{t("radiology.allStatuses")}</option>
          {Object.entries(STATUS_META).map(([k, v]) => (
            <option key={k} value={k}>
              {t(v.label as never)}
            </option>
          ))}
        </select>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 border dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw className="w-4 h-4" />
          {t("radiology.refresh")}
        </button>
        <button
          onClick={() => onOpenNew(true)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
        >
          <Zap className="w-4 h-4" />
          {t("radiology.schedule.walkIn")}
        </button>
        <button
          onClick={() => onOpenNew(false)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus className="w-4 h-4" />
          {t("radiology.schedule.newBooking")}
        </button>
      </div>
    </div>
  );
};
