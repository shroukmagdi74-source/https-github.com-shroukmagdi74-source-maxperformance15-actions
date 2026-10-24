import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { SingleSectionEditorProps } from "./types";
import { MediaUploadControls } from "./MediaUploadControls";

// 1. MEDIA EDITOR
export const MediaSectionEditor: React.FC<SingleSectionEditorProps> = ({
  content,
  update,
  product,
}) => {
  const [newImageUrl, setNewImageUrl] = useState("");
  const images = content.images || [];

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    update({ images: [...images, newImageUrl.trim()] });
    setNewImageUrl("");
  };

  const addProductImage = (src: string) => {
    if (images.includes(src)) return;
    update({ images: [...images, src] });
  };

  const removeImage = (idx: number) => {
    update({ images: images.filter((_, i) => i !== idx) });
  };

  return (
    <div className="eo-section-editor-body">
      <div className="eo-media-editor">
        <label>
          <strong>صور ومعرض المنتج:</strong>
        </label>
        <div className="eo-media-grid">
          {images.map((img, idx) => (
            <div key={`${img}-${idx}`} className="eo-media-card">
              <img src={img} alt="" className="eo-media-thumb" />
              <button
                type="button"
                className="eo-media-remove-btn"
                onClick={() => removeImage(idx)}
                title="حذف الصورة"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        <div className="eo-add-image-bar">
          <input
            type="text"
            placeholder="الصق رابط صورة جديدة (URL)..."
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            dir="ltr"
          />
          <button type="button" className="eo-btn eo-btn-outline" onClick={addImage}>
            <Plus size={15} />
            <span>إضافة رابط</span>
          </button>
          <MediaUploadControls
            onAddImage={(url) => {
              if (images.includes(url)) return;
              update({ images: [...images, url] });
            }}
          />
        </div>

        {/* Quick Add from product images */}
        {product && (
          <div className="eo-product-quick-images">
            <span className="eo-hint">صور متاحة من بيانات المنتج:</span>
            <div className="eo-quick-thumbs">
              {product.mainImage && (
                <button
                  type="button"
                  className="eo-quick-thumb-btn"
                  onClick={() => addProductImage(product.mainImage!)}
                  title="إضافة الصورة الرئيسية"
                >
                  <img src={product.mainImage} alt="" />
                  <span>الرئيسية +</span>
                </button>
              )}
              {Array.isArray(product.images) &&
                product.images.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    className="eo-quick-thumb-btn"
                    onClick={() => addProductImage(src)}
                  >
                    <img src={src} alt="" />
                    <span>+ إضافة</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 12. GALLERY EDITOR
export const GallerySectionEditor: React.FC<SingleSectionEditorProps> = ({ content, update }) => {
  const [newImageUrl, setNewImageUrl] = useState("");
  const images = content.galleryImages || [];

  const addImg = () => {
    if (!newImageUrl.trim()) return;
    update({
      galleryImages: [
        ...images,
        { url: newImageUrl.trim(), caption: "لقطة تفصيلية للمنتج" },
      ],
    });
    setNewImageUrl("");
  };

  const removeImg = (idx: number) => {
    update({ galleryImages: images.filter((_, i) => i !== idx) });
  };

  return (
    <div className="eo-section-editor-body">
      <div className="eo-fields">
        <label>
          <span>عنوان المعرض:</span>
          <input
            type="text"
            value={content.galleryTitle || ""}
            onChange={(e) => update({ galleryTitle: e.target.value })}
            placeholder="لقطات حية للمنتج على الطبيعة"
          />
        </label>
      </div>
      <div className="eo-add-image-bar" style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="رابط صورة زاوية جديدة..."
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          dir="ltr"
          style={{ flex: 1 }}
        />
        <button type="button" className="eo-btn eo-btn-outline" onClick={addImg}>
          <Plus size={15} /> إضافة صورة للمعرض
        </button>
      </div>
      <div className="eo-media-grid" style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {images.map((img, idx) => (
          <div key={idx} className="eo-media-card" style={{ position: "relative" }}>
            <img src={img.url} alt="" className="eo-media-thumb" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
            <button
              type="button"
              className="eo-media-remove-btn"
              onClick={() => removeImg(idx)}
              title="حذف"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
