import React from "react";
import {
  ClockIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { EditingTimeLogState, ConfirmModalState } from "./types";

export interface DevTaskTimeTabProps {
  timeLogs?: any[];
  isCurrentTaskTimerActive: boolean;
  isCurrentTaskTimerPaused: boolean;
  currentTaskElapsedSeconds: number;
  formatTime: (seconds: number) => string;
  handleStartTimer: () => void;
  handleStopTimer: () => void;
  handlePauseTimer: () => void;
  handleResumeTimer: () => void;
  setEditingTimeLog: React.Dispatch<React.SetStateAction<EditingTimeLogState | null>>;
  setConfirmModal: React.Dispatch<React.SetStateAction<ConfirmModalState>>;
  handleDeleteTimeLog: (id: string) => void;
}

export const DevTaskTimeTab: React.FC<DevTaskTimeTabProps> = ({
  timeLogs,
  isCurrentTaskTimerActive,
  isCurrentTaskTimerPaused,
  currentTaskElapsedSeconds,
  formatTime,
  handleStartTimer,
  handleStopTimer,
  handlePauseTimer,
  handleResumeTimer,
  setEditingTimeLog,
  setConfirmModal,
  handleDeleteTimeLog,
}) => {
  return (
    <div className="space-y-6">
      {/* Live Timer Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-5 sm:p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 text-center">
          <p className="text-indigo-100 font-medium mb-2 tracking-wide uppercase text-xs sm:text-sm">
            {isCurrentTaskTimerActive ? "جلسة نشطة" : "العداد متوقف"}
          </p>
          <p className="text-3xl sm:text-4xl font-mono font-bold mb-5 drop-shadow-md tracking-wider tabular-nums">
            {formatTime(currentTaskElapsedSeconds)}
          </p>

          <div className="flex justify-center">
            {isCurrentTaskTimerActive ? (
              <div className="flex flex-wrap justify-center gap-2.5">
                {isCurrentTaskTimerPaused ? (
                  <button
                    type="button"
                    onClick={handleResumeTimer}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold shadow-md transition-all text-sm"
                  >
                    <PlayIcon className="h-4 w-4" />
                    استئناف العداد
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePauseTimer}
                    className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full font-semibold shadow-md transition-all text-sm"
                  >
                    <PauseIcon className="h-4 w-4" />
                    إيقاف مؤقت
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleStopTimer}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold shadow-md transition-all text-sm"
                >
                  <StopIcon className="h-4 w-4" />
                  إيقاف العداد
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartTimer}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-full font-semibold shadow-md transition-all text-sm"
              >
                <PlayIcon className="h-4 w-4" />
                ابدأ التسجيل
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Time Logs History */}
      <div>
        <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <ClockIcon className="h-5 w-5 text-gray-500" />
          سجل الأوقات السابقة
        </h4>
        <div className="space-y-3">
          {timeLogs
            ?.filter((log: any) => !log.isRunning)
            .map((log: any) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                    {log.memberName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {log.memberName}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      <span>
                        {new Date(log.startTime).toLocaleDateString("ar-EG")}
                      </span>
                      <span>•</span>
                      <span>{log.description || "بدون وصف"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-left font-mono tabular-nums">
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {Math.round((log.duration / 60) * 100) / 100}h
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                      {log.duration}m
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingTimeLog({
                          id: log.id,
                          duration: log.duration,
                          description: log.description || "",
                        })
                      }
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmModal({
                          open: true,
                          message: "هل أنت متأكد من حذف سجل الوقت هذا؟",
                          onConfirm: () => handleDeleteTimeLog(log.id),
                        })
                      }
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

          {(!timeLogs ||
            timeLogs.filter((l: any) => !l.isRunning).length === 0) && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              <ClockIcon className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p>لا توجد سجلات وقت</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
