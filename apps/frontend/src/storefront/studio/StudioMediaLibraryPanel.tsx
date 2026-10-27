import React, { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  PlusIcon,
  PhotoIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { apiClient } from "../../services/apiClient";
import imageGalleryService from "../../services/imageGalleryService";

export interface MediaLibraryItem {
  id: string;
  url: string;
  filename: string;
  alt: string;
  webp?: Record<string | number, string>;
  width?: number;
  height?: number;
  bytes?: number;
  uploadedAt?: string;
}

export interface StudioMediaLibraryPanelProps {
  onClose?: () => void;
  onInsertImage?: (item: {
    url: string;
    alt?: string;
    webp?: Record<string | number, string>;
    width?: number;
    height?: number;
  }) => void;
  selectedUrl?: string;
}

const STORAGE_KEY = "storefront_media_library_items";

export const StudioMediaLibraryPanel: React.FC<StudioMediaLibraryPanelProps> = ({
  onClose,
  onInsertImage,
  selectedUrl,
}) => {
  const [items, setItems] = useState<MediaLibraryItem[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [search, setSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync to local storage for quick offline / session resilience
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore quota exceeded
    }
  }, [items]);

  // Load from backend gallery on mount
  useEffect(() => {
    let isMounted = true;
    const fetchGallery = async () => {
      try {
        const gallery = await imageGalleryService.listImages();
        if (!isMounted || !Array.isArray(gallery)) return;

        setItems((current) => {
          const map = new Map<string, MediaLibraryItem>();
          // Existing items first (they may contain webp / custom alt)
          current.forEach((it) => map.set(it.id || it.url, it));

          gallery.forEach((g) => {
            const key = g.id || g.url;
            if (!map.has(key)) {
              map.set(key, {
                id: g.id || g.url,
                url: g.url,
                filename: g.filename || "image",
                alt: "",
                uploadedAt: g.uploadedAt,
              });
            }
          });

          return Array.from(map.values());
        });
      } catch {
        // Fallback silently to local items
      }
    };

    void fetchGallery();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    const newItems: MediaLibraryItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        toast.error(`الملف ${file.name} ليس صورة صالحة`);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        // Post to storefront-image endpoint with sharp webp conversion
        const res = await apiClient.post("/upload/storefront-image", formData, {
          timeout: 45000,
        });

        const data = res.data?.data || res.data;
        const newItem: MediaLibraryItem = {
          id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          url: data.url || res.data?.url,
          filename: file.name,
          alt: file.name.replace(/\.[^/.]+$/, ""),
          webp: data.webp || res.data?.webp,
          width: data.width || res.data?.width,
          height: data.height || res.data?.height,
          bytes: data.bytes || res.data?.bytes,
          uploadedAt: new Date().toISOString(),
        };

        newItems.unshift(newItem);
      } catch {
        // Fallback: upload to general gallery
        try {
          const uploaded = await imageGalleryService.uploadImage(file);
          newItems.unshift({
            id: uploaded.id,
            url: uploaded.url,
            filename: uploaded.filename,
            alt: uploaded.filename.replace(/\.[^/.]+$/, ""),
            uploadedAt: uploaded.uploadedAt,
          });
        } catch (err: any) {
          toast.error(`فشل رفع ${file.name}: ${err.message || "خطأ غير معروف"}`);
        }
      }
    }

    if (newItems.length > 0) {
      setItems((prev) => [...newItems, ...prev]);
      toast.success(`تم رفع ${newItems.length} صورة بنجاح`);
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteItem = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setItems((prev) => prev.filter((it) => it.id !== id));
    toast.success("تم حذف الصورة من المكتبة");
  };

  const handleUpdateAlt = (id: string, newAlt: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, alt: newAlt } : it))
    );
  };

  const handleInsert = (item: MediaLibraryItem) => {
    if (onInsertImage) {
      onInsertImage({
        url: item.url,
        alt: item.alt,
        webp: item.webp,
        width: item.width,
        height: item.height,
      });
      toast.success("تم إدراج الصورة بنجاح");
    }
  };

  const filteredItems = items.filter((it) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      it.filename.toLowerCase().includes(q) ||
      it.alt.toLowerCase().includes(q)
    );
  });

  return (
    <div
      data-testid="studio-media-library-panel"
      className="flex flex-col h-full w-[340px] sm:w-[380px] bg-[#17181c] border-e border-[#202226] text-[#e8eaee] select-none"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#202226] p-3">
        <div className="flex items-center gap-2">
          <PhotoIcon className="h-4 w-4 text-[#2b6cf6]" />
          <h2 className="text-sm font-semibold text-white">مكتبة الوسائط</h2>
          <span className="text-[11px] rounded-full bg-[#202226] px-2 py-0.5 text-[#9ba0a8]">
            {filteredItems.length}
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#9ba0a8] hover:bg-[#202226] hover:text-white"
            aria-label="إغلاق المكتبة"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Upload & Search Bar */}
      <div className="p-3 border-b border-[#202226] space-y-2.5">
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
          <input
            type="text"
            data-testid="media-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو النص البديل (Alt)..."
            className="w-full rounded-lg border border-[#26282e] bg-[#0c0d0f] py-1.5 ps-9 pe-3 text-xs text-white placeholder-[#64748b] focus:border-[#2b6cf6] focus:outline-none"
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          data-testid="media-upload-input"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void handleUploadFiles(e.target.files);
          }}
        />

        <button
          type="button"
          data-testid="media-upload-button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2b6cf6] py-2 px-3 text-xs font-medium text-white transition-all hover:bg-[#205adb] active:scale-[0.98] disabled:opacity-50"
        >
          <ArrowUpTrayIcon className="h-4 w-4" />
          <span>{isUploading ? "جارٍ تحويل ورفع الصور..." : "رفع صور متعددة (WebP تلقائي)"}</span>
        </button>
      </div>

      {/* Images Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-xs text-[#64748b] gap-2">
            <PhotoIcon className="h-10 w-10 text-[#2f333c]" />
            <p>لا توجد صور في المكتبة بعد</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 text-[#2b6cf6] hover:underline"
            >
              اضغط لرفع صورك الأولى
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredItems.map((item) => {
              const isSelected = selectedUrl === item.url;
              const hasWebp = Boolean(item.webp && Object.keys(item.webp).length > 0);

              return (
                <div
                  key={item.id}
                  data-testid={`media-item-${item.id}`}
                  onClick={() => setActiveItemId(item.id)}
                  className={`group relative flex flex-col rounded-xl border bg-[#0c0d0f] overflow-hidden transition-all ${
                    isSelected
                      ? "border-[#2b6cf6] ring-2 ring-[#2b6cf6]/30"
                      : "border-[#202226] hover:border-[#333742]"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-square w-full bg-[#14151a] overflow-hidden">
                    <img
                      src={item.url}
                      alt={item.alt || item.filename}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />

                    {/* Responsive Badges */}
                    <div className="absolute top-1.5 start-1.5 flex flex-wrap gap-1">
                      {hasWebp && (
                        <span className="rounded bg-emerald-500/90 text-white text-[9px] font-mono px-1 py-0.5">
                          WebP
                        </span>
                      )}
                      {item.width && item.height && (
                        <span className="rounded bg-black/60 backdrop-blur-xs text-[#9ba0a8] text-[9px] font-mono px-1 py-0.5">
                          {item.width}w
                        </span>
                      )}
                    </div>

                    {/* Quick Delete */}
                    <button
                      type="button"
                      data-testid={`media-delete-${item.id}`}
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      title="حذف الصورة"
                      className="absolute top-1.5 end-1.5 rounded-md bg-black/70 p-1 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 hover:text-white"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Metadata & Actions */}
                  <div className="p-2 space-y-1.5 flex flex-col">
                    <div className="flex items-center justify-between text-[10px] text-[#9ba0a8]">
                      <span className="truncate max-w-[110px]" title={item.filename}>
                        {item.filename}
                      </span>
                    </div>

                    {/* Alt Text Input */}
                    <input
                      type="text"
                      data-testid={`media-alt-input-${item.id}`}
                      value={item.alt}
                      onChange={(e) => handleUpdateAlt(item.id, e.target.value)}
                      placeholder="النص البديل (Alt)..."
                      className="w-full rounded border border-[#202226] bg-[#14151a] px-1.5 py-0.5 text-[10px] text-white placeholder-[#4b5563] focus:border-[#2b6cf6] focus:outline-none"
                    />

                    {/* Insert Button */}
                    <button
                      type="button"
                      data-testid={`media-insert-${item.id}`}
                      onClick={() => handleInsert(item)}
                      className="flex w-full items-center justify-center gap-1 rounded bg-[#202226] py-1 text-[11px] font-medium text-white transition-colors hover:bg-[#2b6cf6] active:scale-[0.98]"
                    >
                      <PlusIcon className="h-3 w-3" />
                      <span>إدراج كصورة</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioMediaLibraryPanel;
