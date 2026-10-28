import React from "react";
import { RefreshCw, RotateCcw, XCircle, ExternalLink, AlertCircle, CheckCircle, Clock } from "lucide-react";
import {
  type YouTubeVideo,
  type YouTubePagination,
} from "../../services/youtubePublishService";

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "مجدول",
  UPLOADING: "قيد الرفع",
  PROCESSING: "قيد المعالجة",
  PUBLISHED: "منشور بنجاح",
  FAILED: "فشل النشر",
  CANCELLED: "تم الإلغاء",
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  SCHEDULED: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  UPLOADING: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  PROCESSING: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  PUBLISHED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  FAILED: "bg-red-500/10 text-red-500 border-red-500/20",
  CANCELLED: "bg-muted text-muted-foreground border-border/50",
};

interface YoutubePublishTableProps {
  videos: YouTubeVideo[];
  pagination: YouTubePagination | null;
  loading: boolean;
  actionLoadingId: string | null;
  onRefresh: (id: string) => void;
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
  formatDate: (value?: string | null) => string;
}

export const YoutubePublishTable: React.FC<YoutubePublishTableProps> = ({
  videos,
  pagination,
  loading,
  actionLoadingId,
  onRefresh,
  onRetry,
  onCancel,
  formatDate,
}) => {
  return (
    <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-sm">
      <div className="p-4 bg-muted/20 border-b border-border/70 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          سجل فيديوهات YouTube المجدولة والمنشورة
        </h2>
        {pagination && (
          <span className="text-xs font-mono tabular-nums text-muted-foreground">
            إجمالي {pagination.total} فيديو
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-10 text-center text-xs text-muted-foreground font-mono">
          جاري تحميل وتحديث الفيديوهات...
        </div>
      ) : videos.length === 0 ? (
        <div className="py-10 text-center text-xs text-muted-foreground">
          لا توجد مقاطع فيديو مسجلة حالياً
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-border/70 bg-muted/30 text-muted-foreground text-[11px] font-medium">
                <th className="px-4 py-2.5">عنوان الفيديو</th>
                <th className="px-4 py-2.5">القناة</th>
                <th className="px-4 py-2.5">الحالة</th>
                <th className="px-4 py-2.5">موعد الجدولة</th>
                <th className="px-4 py-2.5">تاريخ النشر / الرابط</th>
                <th className="px-4 py-2.5">الملاحظات / الخطأ</th>
                <th className="px-4 py-2.5">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {videos.map((video) => {
                const isWorking = actionLoadingId === video.id;
                const canRetry = video.status === "FAILED" && video.attempts < 5;
                const canCancel = video.status === "SCHEDULED";

                return (
                  <tr key={video.id} className="hover:bg-muted/25 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="max-w-[240px] truncate text-foreground font-medium" title={video.title}>
                        {video.title}
                      </div>
                      {video.description && (
                        <div className="max-w-[240px] truncate text-[11px] text-muted-foreground">
                          {video.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                      {video.account?.channelTitle || "YouTube"}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          STATUS_BADGE_CLASSES[video.status] || STATUS_BADGE_CLASSES.SCHEDULED
                        }`}
                      >
                        {video.status === "PUBLISHED" && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                        {video.status === "SCHEDULED" && <Clock className="w-3 h-3 text-amber-500" />}
                        {video.status === "FAILED" && <AlertCircle className="w-3 h-3 text-red-500" />}
                        {STATUS_LABELS[video.status] || video.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                      {formatDate(video.scheduledAt)}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-[11px]">
                      {video.publishedAt ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-muted-foreground font-mono">{formatDate(video.publishedAt)}</span>
                          {video.youtubeVideoId && (
                            <a
                              href={`https://youtu.be/${video.youtubeVideoId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline font-mono text-[10px]"
                            >
                              <ExternalLink className="w-3 h-3" />
                              youtu.be/{video.youtubeVideoId}
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {video.errorMessage ? (
                        <span className="text-red-500 text-[11px] max-w-[200px] truncate block" title={video.errorMessage}>
                          {video.errorMessage}
                        </span>
                      ) : video.attempts > 0 ? (
                        <span className="text-muted-foreground font-mono text-[11px]">
                          محاولة {video.attempts}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onRefresh(video.id)}
                          disabled={isWorking}
                          title="تحديث الحالة"
                          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isWorking ? "animate-spin" : ""}`} />
                        </button>

                        {canRetry && (
                          <button
                            type="button"
                            onClick={() => onRetry(video.id)}
                            disabled={isWorking}
                            title="إعادة المحاولة"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/30 transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className="w-3 h-3" />
                            إعادة محاولة
                          </button>
                        )}

                        {canCancel && (
                          <button
                            type="button"
                            onClick={() => onCancel(video.id)}
                            disabled={isWorking}
                            title="إلغاء الجدولة"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/30 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3" />
                            إلغاء
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default YoutubePublishTable;
