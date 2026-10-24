import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { SingleSectionEditorProps } from "./types";
import { CommonSectionStylingFields } from "./CommonSectionStylingFields";

// 16. IMAGE_ONLY EDITOR (EasyOrders "img_only")
export const ImageOnlySectionEditor: React.FC<SingleSectionEditorProps> = ({ content, update }) => {
  return (
    <div className="eo-section-editor-body">
      <div className="eo-fields">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>
            <span>صورة الحاسوب (Desktop Image):</span>
            <input
              type="text"
              value={content.imageUrl || ""}
              onChange={(e) => update({ imageUrl: e.target.value })}
              placeholder="https://.../desktop-banner.jpg"
              dir="ltr"
            />
          </label>
          <label>
            <span>صورة الهاتف (Mobile Image - اختياري):</span>
            <input
              type="text"
              value={content.mobileImage || ""}
              onChange={(e) => update({ mobileImage: e.target.value })}
              placeholder="https://.../mobile-banner.jpg"
              dir="ltr"
            />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
          <label>
            <span>نمط العرض (العرض والحواف):</span>
            <select
              value={content.variant || "rounded"}
              onChange={(e) => update({ variant: e.target.value })}
            >
              <option value="full">عرض كامل بدون هوامش (Full Width)</option>
              <option value="rounded">حواف دائرية أنيقة (Rounded Box)</option>
              <option value="contained">داخل إطار محدد (Contained Card)</option>
            </select>
          </label>
          <label>
            <span>النص البديل (Alt text لمحركات البحث):</span>
            <input
              type="text"
              value={content.altText || ""}
              onChange={(e) => update({ altText: e.target.value })}
              placeholder="صورة توضيحية للمنتج"
            />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10, background: "#f8fafc", padding: 10, borderRadius: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={Boolean(content.isCircle)}
              onChange={(e) => update({ isCircle: e.target.checked })}
            />
            <span>صورة دائرية</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={Boolean(content.isFullWidth)}
              onChange={(e) => update({ isFullWidth: e.target.checked })}
            />
            <span>ملء الشاشة على الموبايل</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem" }}>
            <span>دوران الحواف:</span>
            <input
              type="number"
              min={0}
              max={50}
              value={content.borderRadius ?? 12}
              onChange={(e) => update({ borderRadius: Number(e.target.value) })}
              style={{ width: 60, padding: "2px 6px", textAlign: "center" }}
            />
            <span>px</span>
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
          <label>
            <span>رابط التحويل عند النقر (Link URL):</span>
            <input
              type="text"
              value={content.linkUrl || ""}
              onChange={(e) => update({ linkUrl: e.target.value })}
              placeholder="#checkout-form أو رابط خارجي"
              dir="ltr"
            />
          </label>
          <label>
            <span>تسمية / وصف أسفل الصورة (اختياري):</span>
            <input
              type="text"
              value={content.caption || ""}
              onChange={(e) => update({ caption: e.target.value })}
              placeholder="تفاصيل دقيقة وخامة ممتازة..."
            />
          </label>
        </div>
        {(content.imageUrl || content.mobileImage) && (
          <div style={{ marginTop: 10, textAlign: "center", background: "#f8fafc", padding: 8, borderRadius: 8, display: "flex", justifyContent: "center", gap: 12 }}>
            {content.imageUrl && (
              <div>
                <small style={{ display: "block", color: "#64748b", fontSize: "0.7rem", marginBottom: 2 }}>الحاسوب</small>
                <img
                  src={content.imageUrl}
                  alt={content.altText || "Preview"}
                  style={{
                    maxHeight: 120,
                    maxWidth: 160,
                    borderRadius: content.isCircle ? "50%" : `${content.borderRadius ?? 6}px`,
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
            {content.mobileImage && (
              <div>
                <small style={{ display: "block", color: "#64748b", fontSize: "0.7rem", marginBottom: 2 }}>الموبايل</small>
                <img
                  src={content.mobileImage}
                  alt={content.altText || "Preview Mobile"}
                  style={{
                    maxHeight: 120,
                    maxWidth: 160,
                    borderRadius: content.isCircle ? "50%" : `${content.borderRadius ?? 6}px`,
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
          </div>
        )}
        <CommonSectionStylingFields content={content} update={update} />
      </div>
    </div>
  );
};

// 17. CAROUSEL EDITOR (EasyOrders "carousel")
export const CarouselSectionEditor: React.FC<SingleSectionEditorProps> = ({ content, update }) => {
  const images = content.carouselImages || (content.images ? content.images.map((url, i) => ({ id: `c-${i}`, url })) : []) || [];

  const addCarouselImage = () => {
    update({
      carouselImages: [
        ...images,
        { id: `c-${Date.now()}`, url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", caption: "" },
      ],
    });
  };

  const updateCarouselImage = (index: number, key: string, val: string) => {
    const next = images.map((item, idx) => (idx === index ? { ...item, [key]: val } : item));
    update({ carouselImages: next });
  };

  const removeCarouselImage = (index: number) => {
    update({ carouselImages: images.filter((_, idx) => idx !== index) });
  };

  return (
    <div className="eo-section-editor-body">
      <div className="eo-items-list-editor">
        <div className="eo-list-head">
          <strong>شرائح السلايدر (Carousel Images):</strong>
          <button type="button" className="eo-btn eo-btn-xs" onClick={addCarouselImage}>
            <Plus size={14} /> إضافة صورة للسلايدر
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <label>
            <span>التقليب التلقائي (Autoplay):</span>
            <select
              value={content.autoplay !== false ? "true" : "false"}
              onChange={(e) => update({ autoplay: e.target.value === "true" })}
            >
              <option value="true">مفعل تلقائياً</option>
              <option value="false">معطل (التحريك يدوي)</option>
            </select>
          </label>
          <label>
            <span>مدة التبديل بين الشرائح (بالثواني):</span>
            <input
              type="number"
              min={1}
              max={15}
              value={content.slideInterval || 3}
              onChange={(e) => update({ slideInterval: Number(e.target.value) })}
            />
          </label>
        </div>
        {images.map((imgItem, i) => (
          <div key={imgItem.id || i} className="eo-sub-card">
            <div className="eo-sub-card-row" style={{ gap: 8 }}>
              <input
                type="text"
                value={imgItem.url}
                onChange={(e) => updateCarouselImage(i, "url", e.target.value)}
                placeholder="رابط صورة الحاسوب (URL)"
                dir="ltr"
                style={{ flex: 1.5 }}
              />
              <input
                type="text"
                value={imgItem.mobileUrl || ""}
                onChange={(e) => updateCarouselImage(i, "mobileUrl", e.target.value)}
                placeholder="صورة الموبايل (اختياري)"
                dir="ltr"
                style={{ flex: 1.5 }}
              />
              <button
                type="button"
                className="eo-sub-del-btn"
                onClick={() => removeCarouselImage(i)}
                title="حذف الشريحة"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="eo-sub-card-row" style={{ gap: 8, marginTop: 6 }}>
              <input
                type="text"
                value={imgItem.caption || ""}
                onChange={(e) => updateCarouselImage(i, "caption", e.target.value)}
                placeholder="تسمية الشريحة / عنوان مختصر"
                style={{ flex: 1 }}
              />
              <input
                type="text"
                value={imgItem.linkUrl || ""}
                onChange={(e) => updateCarouselImage(i, "linkUrl", e.target.value)}
                placeholder="#checkout-form أو رابط توجيه عند النقر"
                dir="ltr"
                style={{ flex: 1 }}
              />
            </div>
            {(imgItem.url || imgItem.mobileUrl) && (
              <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                {imgItem.url && (
                  <img src={imgItem.url} alt="" style={{ height: 44, borderRadius: 4, objectFit: "cover" }} title="الحاسوب" />
                )}
                {imgItem.mobileUrl && (
                  <img src={imgItem.mobileUrl} alt="" style={{ height: 44, borderRadius: 4, objectFit: "cover" }} title="الموبايل" />
                )}
              </div>
            )}
          </div>
        ))}
        <CommonSectionStylingFields content={content} update={update} />
      </div>
    </div>
  );
};
