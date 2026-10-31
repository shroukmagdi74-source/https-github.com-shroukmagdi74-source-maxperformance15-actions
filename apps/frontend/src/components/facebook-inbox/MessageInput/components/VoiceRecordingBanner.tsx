import React from "react";
import { Mic, Trash2 } from "lucide-react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

interface VoiceRecordingBannerProps {
  recordingSeconds: number;
  recordingStatus: string;
  recordingError?: any;
  formatRecordingTime: (seconds: number) => string;
  onCancel: () => void;
  onStopAndSend: () => void;
}

export const VoiceRecordingBanner: React.FC<VoiceRecordingBannerProps> = ({
  recordingSeconds,
  recordingStatus,
  recordingError,
  formatRecordingTime,
  onCancel,
  onStopAndSend,
}) => {
  return (
    <div className="flex w-full items-center gap-2 rounded-xl bg-red-500/10 px-3 py-1.5 border border-red-500/30">
      {/* Cancel Button */}
      <button
        type="button"
        onClick={onCancel}
        className="p-1.5 sm:p-2 rounded-full text-red-500 hover:bg-red-500/20 active:scale-95 transition-all flex items-center justify-center"
        title="إلغاء التسجيل"
        aria-label="إلغاء التسجيل"
      >
        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Recording pulse & time */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-500"></span>
        </span>
        <Mic className="w-4 h-4 text-red-500 animate-pulse flex-shrink-0" />
        <span className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 tabular-nums">
          {formatRecordingTime(recordingSeconds)}
        </span>
        <span className="text-xs text-muted-foreground truncate hidden sm:inline">
          {recordingStatus === "recording"
            ? "جاري تسجيل صوتي..."
            : "جاري المعالجة..."}
        </span>
        {recordingError && (
          <span className="text-xs text-red-500 truncate">
            يرجى السماح بالميكروفون
          </span>
        )}
      </div>

      {/* Send Voice Button */}
      <button
        type="button"
        onClick={onStopAndSend}
        disabled={recordingStatus === "acquiring_media" || recordingSeconds === 0}
        className="business-chip-button flex h-[34px] sm:h-[38px] items-center gap-1.5 rounded-xl px-3 sm:px-4 text-xs sm:text-sm font-semibold text-white shadow-sm transition-transform active:scale-95 disabled:opacity-50"
        style={{
          background: "var(--color-primary, #3b82f6)",
        }}
        title="إرسال الفويس"
      >
        <PaperAirplaneIcon className="h-4 w-4 rtl:-scale-x-100" />
        <span>إرسال</span>
      </button>
    </div>
  );
};
