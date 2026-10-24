import React, { useState } from "react";
import { Library, Loader2, Upload } from "lucide-react";
import { imageGalleryService, GalleryImage } from "../../../../services/imageGalleryService";

/**
 * Upload-from-device + personal media library controls for image fields.
 * Uploads go through the authenticated per-company image gallery and the
 * returned URL is inserted like any pasted image URL.
 */
export const MediaUploadControls: React.FC<{
  onAddImage: (url: string) => void;
}> = ({ onAddImage }) => {
  const [uploading, setUploading] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChosen = async (file: File | undefined) => {
    if (!file) return;
    try {
      setUploading(true);
      const uploaded = await imageGalleryService.uploadImage(file);
      onAddImage(uploaded.url);
    } catch {
      // Gallery service already surfaces errors via apiClient toasts; keep
      // the editor usable on failure.
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openGallery = async () => {
    const next = !galleryOpen;
    setGalleryOpen(next);
    if (next && galleryImages.length === 0 && !galleryLoading) {
      try {
        setGalleryLoading(true);
        setGalleryImages(await imageGalleryService.listImages());
      } catch {
        setGalleryImages([]);
      } finally {
        setGalleryLoading(false);
      }
    }
  };

  return (
    <div className="eo-media-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => void handleFileChosen(e.target.files?.[0])}
      />
      <button
        type="button"
        className="eo-btn eo-btn-outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? <Loader2 size={15} className="eo-spin" /> : <Upload size={15} />}
        <span>{uploading ? "جاري الرفع…" : "رفع من الجهاز"}</span>
      </button>
      <button
        type="button"
        className="eo-btn eo-btn-outline"
        onClick={() => void openGallery()}
      >
        <Library size={15} />
        <span>من مكتبتك</span>
      </button>

      {galleryOpen && (
        <div className="eo-gallery-pop">
          {galleryLoading ? (
            <div className="eo-gallery-empty">
              <Loader2 size={15} className="eo-spin" /> جاري التحميل…
            </div>
          ) : galleryImages.length === 0 ? (
            <div className="eo-gallery-empty">مكتبتك فاضية — ارفع أول صورة</div>
          ) : (
            <div className="eo-gallery-grid">
              {galleryImages.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  className="eo-gallery-thumb"
                  onClick={() => onAddImage(img.url)}
                  title={img.filename}
                >
                  <img src={img.url} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
