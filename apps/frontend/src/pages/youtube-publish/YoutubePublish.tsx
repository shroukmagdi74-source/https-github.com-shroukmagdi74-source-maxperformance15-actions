import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Send,
  AlertTriangle,
  Film,
  Upload,
  Calendar,
  CheckCircle2,
  Lock,
  Globe,
  EyeOff,
  Radio,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../../services/apiClient";
import {
  getAccountStatus,
  getLoginUrl,
  createVideo,
  listVideos,
  getVideo,
  retryVideo,
  cancelVideo,
  type YouTubeAccountStatus,
  type YouTubeVideo,
  type YouTubePagination,
  type YouTubePrivacyStatus,
} from "../../services/youtubePublishService";
import YoutubePublishTable from "./YoutubePublishTable";

const POLL_INTERVAL_MS = 8000;
const MAX_POLL_TRIES = 12;

const PRIVACY_OPTIONS: { value: YouTubePrivacyStatus; label: string; icon: React.ReactNode }[] = [
  { value: "private", label: "خاص (Private)", icon: <Lock className="w-3.5 h-3.5 text-muted-foreground" /> },
  { value: "unlisted", label: "غير مدرج (Unlisted)", icon: <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> },
  { value: "public", label: "علني (Public)", icon: <Globe className="w-3.5 h-3.5 text-muted-foreground" /> },
];

const inputClass =
  "w-full rounded-md border border-border/80 bg-background px-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
const labelClass = "mb-1 block text-xs font-medium text-foreground";

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("ar-EG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDefaultScheduledTime(): string {
  const d = new Date(Date.now() + 10 * 60 * 1000);
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function extractError(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as { response?: { data?: { error?: string | { message?: string }; message?: string } }; message?: string };
    const errField = e.response?.data?.error;
    if (typeof errField === "string") return errField;
    if (errField && typeof errField === "object" && errField.message) return errField.message;
    if (e.response?.data?.message) return e.response.data.message;
    if (e.message) return e.message;
  }
  return "حدث خطأ غير متوقع";
}

export default function YoutubePublish() {
  const [account, setAccount] = useState<YouTubeAccountStatus | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [pagination, setPagination] = useState<YouTubePagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [privacyStatus, setPrivacyStatus] = useState<YouTubePrivacyStatus>("private");
  const [mediaUrl, setMediaUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState(getDefaultScheduledTime());

  const pollTimersRef = useRef<Record<string, number>>({});

  const loadAccount = useCallback(async () => {
    try {
      const res = await getAccountStatus();
      setAccount(res);
    } catch (err) {
      setError(extractError(err));
    }
  }, []);

  const loadVideos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listVideos({ page: 1, limit: 50 });
      setVideos(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccount();
    loadVideos();
  }, [loadAccount, loadVideos]);

  // Polling for active items
  useEffect(() => {
    const timers = pollTimersRef.current;
    const activeVideos = videos.filter(
      (v) => v.status === "SCHEDULED" || v.status === "UPLOADING" || v.status === "PROCESSING"
    );

    activeVideos.forEach((v) => {
      if (timers[v.id]) return;
      let tries = 0;

      const timerId = window.setInterval(async () => {
        tries += 1;
        try {
          const updated = await getVideo(v.id);
          setVideos((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
          if (
            updated.status === "PUBLISHED" ||
            updated.status === "FAILED" ||
            updated.status === "CANCELLED" ||
            tries >= MAX_POLL_TRIES
          ) {
            window.clearInterval(timerId);
            delete timers[v.id];
          }
        } catch {
          window.clearInterval(timerId);
          delete timers[v.id];
        }
      }, POLL_INTERVAL_MS);

      timers[v.id] = timerId;
    });

    return () => {
      Object.keys(timers).forEach((id) => {
        window.clearInterval(timers[id]);
        delete timers[id];
      });
    };
  }, [videos]);

  const handleConnectChannel = async () => {
    try {
      const { url } = await getLoginUrl();
      if (url) {
        window.location.href = url;
      } else {
        toast.error("فشل الحصول على رابط ربط القناة");
      }
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      toast.error("حجم ملف الفيديو يتجاوز الحد الأقصى المسموح به (100 ميجابايت)");
      return;
    }

    setUploadingFile(true);
    const formData = new FormData();
    formData.append("media", file);

    try {
      const res = await apiClient.post<any>("/uploads/media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const returnedUrl = (res.data as any)?.url || (res.data as any)?.mediaUrl || (res.data as any)?.data?.url;
      if (returnedUrl) {
        setMediaUrl(returnedUrl);
        toast.success("تم رفع ملف الفيديو بنجاح");
      } else {
        toast.error("لم يتم استلام مسار الملف من الخادم");
      }
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account?.connected) {
      toast.error("يرجى ربط قناة YouTube أولاً");
      return;
    }

    if (!title.trim()) {
      toast.error("عنوان الفيديو مطلوب");
      return;
    }

    if (title.trim().length > 100) {
      toast.error("عنوان الفيديو يجب ألا يتجاوز 100 حرف");
      return;
    }

    if (!mediaUrl.trim()) {
      toast.error("ملف الفيديو مطلوب، يرجى رفع ملف أو إدخال مساره");
      return;
    }

    setPublishing(true);
    try {
      const created = await createVideo({
        title: title.trim(),
        description: description.trim() || undefined,
        tags: tags.trim() || undefined,
        privacyStatus,
        mediaUrl: mediaUrl.trim(),
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      });

      toast.success("تمت جدولة نشر الفيديو بنجاح");
      setTitle("");
      setDescription("");
      setTags("");
      setMediaUrl("");
      setScheduledAt(getDefaultScheduledTime());
      setVideos((prev) => [created, ...prev]);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setPublishing(false);
    }
  };

  const handleRefresh = async (id: string) => {
    setActionLoadingId(id);
    try {
      const updated = await getVideo(id);
      setVideos((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      toast.success("تم تحديث حالة الفيديو");
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRetry = async (id: string) => {
    setActionLoadingId(id);
    try {
      const retried = await retryVideo(id);
      setVideos((prev) => prev.map((item) => (item.id === retried.id ? retried : item)));
      toast.success("تمت إعادة جدولة الفيديو للمحاولة من جديد");
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    setActionLoadingId(id);
    try {
      const cancelled = await cancelVideo(id);
      setVideos((prev) => prev.map((item) => (item.id === cancelled.id ? cancelled : item)));
      toast.success("تم إلغاء جدولة الفيديو");
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/70 pb-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Radio className="w-6 h-6 text-red-600" />
            نشر وجدولة مقاطع YouTube
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            إدارة رفع ونشر مقاطع الفيديو تلقائياً وجدولتها على قناة YouTube الخاصة بك
          </p>
        </div>

        {/* Channel connection badge & action */}
        <div>
          {account?.connected ? (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-md text-emerald-600 text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>متصل: <strong>{account.channelTitle || account.channelId}</strong></span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConnectChannel}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-4 py-2 rounded-md shadow-sm transition-colors"
            >
              <Radio className="w-4 h-4" />
              ربط قناة YouTube
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-3 rounded-md text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Form + Video History Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-1 rounded-lg border border-border/70 bg-card p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b border-border/50">
            <Film className="w-4 h-4 text-primary" />
            جدولة فيديو جديد
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={labelClass}>عنوان الفيديو *</label>
                <span className={`text-[10px] font-mono ${title.length > 100 ? "text-red-500" : "text-muted-foreground"}`}>
                  {title.length}/100
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنواناً جذاباً لمقطع الفيديو..."
                maxLength={100}
                required
                className={inputClass}
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>الوصف (اختياري)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب وصفاً مفصلاً أو روابط الفيديو..."
                rows={3}
                className={inputClass}
              />
            </div>

            {/* Tags */}
            <div>
              <label className={labelClass}>الوسوم / الكلمات الدلالية (Tags)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="مثال: تسويق, منتجات, تجارة"
                className={inputClass}
              />
            </div>

            {/* Privacy */}
            <div>
              <label className={labelClass}>مستوى الخصوصية</label>
              <div className="grid grid-cols-3 gap-2">
                {PRIVACY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPrivacyStatus(opt.value)}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-md border text-[11px] font-medium transition-all ${
                      privacyStatus === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/70 bg-background text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Video File Upload */}
            <div>
              <label className={labelClass}>ملف الفيديو (بحد أقصى 100MB) *</label>
              <div className="space-y-2">
                <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-border/80 rounded-md cursor-pointer hover:border-primary/60 hover:bg-muted/30 transition-colors">
                  <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                  <span className="text-[11px] text-muted-foreground">
                    {uploadingFile ? "جاري رفع الملف إلى السيرفر..." : "اختر ملف فيديو من جهازك"}
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="أو اكتب مسار الملف على السيرفر (مثل /uploads/media/vid.mp4)"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* Scheduled At */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  موعد الجدولة والنشر التلقائي *
                </span>
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
                className={inputClass}
              />
              <span className="text-[10px] text-muted-foreground block mt-1">
                سيقوم النظام تلقائياً بنشر الفيديو في هذا الموعد بدقة عبر مشغل المهام.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={publishing || uploadingFile || !account?.connected}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold py-2 px-4 rounded-md shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              {publishing ? "جاري الجدولة..." : "جدولة الفيديو للنشر"}
            </button>
          </form>
        </div>

        {/* Video History & Status Table */}
        <div className="lg:col-span-2">
          <YoutubePublishTable
            videos={videos}
            pagination={pagination}
            loading={loading}
            actionLoadingId={actionLoadingId}
            onRefresh={handleRefresh}
            onRetry={handleRetry}
            onCancel={handleCancel}
            formatDate={formatDate}
          />
        </div>
      </div>
    </div>
  );
}
