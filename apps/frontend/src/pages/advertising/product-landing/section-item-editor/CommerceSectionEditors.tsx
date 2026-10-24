import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { SingleSectionEditorProps } from "./types";
import { CommonSectionStylingFields } from "./CommonSectionStylingFields";

// 5. FORM EDITOR
export const FormSectionEditor: React.FC<SingleSectionEditorProps> = ({ content, update }) => {
  const bundles = content.bundles || [
    { qty: 1, label: "قطعة واحدة", discountPercent: 0, badge: "", freeGift: "" },
    { qty: 2, label: "قطعتين (وفر 15%)", discountPercent: 15, badge: "الأكثر طلباً", freeGift: "" },
    { qty: 3, label: "3 قطع (وفر 25% + شحن مجاني)", discountPercent: 25, badge: "أفضل قيمة", freeGift: "شحن مجاني + هدية" },
  ];

  const updateBundle = (idx: number, field: string, val: string | number) => {
    const next = bundles.map((b, i) => (i === idx ? { ...b, [field]: val } : b));
    update({ bundles: next });
  };

  const addBundle = () => {
    const nextQty = bundles.length + 1;
    update({
      bundles: [
        ...bundles,
        { qty: nextQty, label: `${nextQty} قطع (عرض خاص)`, discountPercent: 20, badge: "توفير إضافي", freeGift: "" },
      ],
    });
  };

  const removeBundle = (idx: number) => {
    update({ bundles: bundles.filter((_, i) => i !== idx) });
  };

  return (
    <div className="eo-section-editor-body">
      <div className="eo-fields">
        <label>
          <span>العنوان الفرعي الصغير (Kicker):</span>
          <input
            type="text"
            value={content.orderKicker || ""}
            onChange={(e) => update({ orderKicker: e.target.value })}
            placeholder="نموذج الطلب السريع"
          />
        </label>
        <label>
          <span>عنوان نموذج الشراء الرئيسي:</span>
          <input
            type="text"
            value={content.orderTitle || ""}
            onChange={(e) => update({ orderTitle: e.target.value })}
            placeholder="اطلب المنتج الآن..."
          />
        </label>
        <label>
          <span>النص التوجيهي تحت العنوان:</span>
          <textarea
            rows={2}
            value={content.orderCopy || ""}
            onChange={(e) => update({ orderCopy: e.target.value })}
            placeholder="املأ البيانات وسيتم التواصل معك لتأكيد الشحن فوراً..."
          />
        </label>
        <label>
          <span>نص زر التأكيد والشحن (CTA Button):</span>
          <input
            type="text"
            value={content.buttonLabel || ""}
            onChange={(e) => update({ buttonLabel: e.target.value })}
            placeholder="تأكيد الطلب الآن — دفع عند الاستلام"
          />
        </label>
        <label>
          <span>رقم واتساب المساعدة والدعم السريع العائم (اختياري):</span>
          <input
            type="text"
            value={content.whatsappSupportPhone || ""}
            onChange={(e) => update({ whatsappSupportPhone: e.target.value })}
            placeholder="مثال: 201012345678 (يظهر كزر واتساب عائم للاستفسارات السريعة)"
            dir="ltr"
            className="font-mono tabular-nums"
          />
        </label>
      </div>

      {/* Custom Bundles & Volume Discounts */}
      <div className="eo-items-list-editor" style={{ marginTop: 16 }}>
        <div className="eo-list-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <strong>باقات التوفير ومضاعفة السلة (Bundles & Tiers):</strong>
          <button type="button" className="eo-btn eo-btn-xs" onClick={addBundle}>
            <Plus size={14} /> إضافة باقة
          </button>
        </div>
        {bundles.map((bundle, i) => (
          <div key={i} className="eo-sub-card" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, marginBottom: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", gap: 8, alignItems: "center" }}>
              <input
                type="number"
                min={1}
                max={20}
                value={bundle.qty}
                onChange={(e) => updateBundle(i, "qty", Number(e.target.value) || 1)}
                title="الكمية"
                placeholder="الكمية"
                className="font-mono tabular-nums"
              />
              <input
                type="text"
                value={bundle.label}
                onChange={(e) => updateBundle(i, "label", e.target.value)}
                placeholder="تسمية الباقة (مثال: قطعتين - وفر 15%)"
                style={{ fontWeight: 600 }}
              />
              <button
                type="button"
                className="eo-sub-del-btn"
                onClick={() => removeBundle(i)}
                title="حذف الباقة"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 6 }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>نسبة الخصم %:</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={bundle.discountPercent}
                  onChange={(e) => updateBundle(i, "discountPercent", Number(e.target.value) || 0)}
                  className="font-mono tabular-nums"
                />
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>شارة العرض:</span>
                <input
                  type="text"
                  value={bundle.badge || ""}
                  onChange={(e) => updateBundle(i, "badge", e.target.value)}
                  placeholder="الأكثر طلباً"
                />
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>هدية مجانية:</span>
                <input
                  type="text"
                  value={bundle.freeGift || ""}
                  onChange={(e) => updateBundle(i, "freeGift", e.target.value)}
                  placeholder="+ هدية خاصة"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 19. FEATURED_PRODUCT EDITOR (EasyOrders "featured-product")
export const FeaturedProductSectionEditor: React.FC<SingleSectionEditorProps> = ({
  content,
  update,
  product,
}) => {
  const bullets = content.featuredBullets || [
    "خامات أصلية عالية الجودة ومقاومة للاهتراء",
    "تصميم مريح يدعم الاستخدام اليومي المكثف",
    "ضمان ذهبي للاستبدال والاسترجاع مجاناً",
  ];

  const addBullet = () => {
    update({ featuredBullets: [...bullets, "ميزة إضافية تبرز قوة المنتج"] });
  };

  const updateBullet = (index: number, val: string) => {
    const next = bullets.map((b, idx) => (idx === index ? val : b));
    update({ featuredBullets: next });
  };

  const removeBullet = (index: number) => {
    update({ featuredBullets: bullets.filter((_, idx) => idx !== index) });
  };

  return (
    <div className="eo-section-editor-body">
      <div className="eo-fields">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
          <label>
            <span>اسم المنتج البارز:</span>
            <input
              type="text"
              value={content.productName || product?.title || ""}
              onChange={(e) => update({ productName: e.target.value })}
              placeholder="اسم المنتج المميز"
            />
          </label>
          <label>
            <span>شارة بارزة (Badge):</span>
            <input
              type="text"
              value={content.featuredBadge || ""}
              onChange={(e) => update({ featuredBadge: e.target.value })}
              placeholder="الأكثر مبيعاً"
            />
          </label>
        </div>
        <label style={{ marginTop: 8 }}>
          <span>رابط صورة المنتج الرئيسية:</span>
          <input
            type="text"
            value={content.imageUrl || product?.image_url || ""}
            onChange={(e) => update({ imageUrl: e.target.value })}
            placeholder="https://.../product.jpg"
            dir="ltr"
          />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 8 }}>
          <label>
            <span>السعر الحالي:</span>
            <input
              type="number"
              value={content.price ?? product?.price ?? ""}
              onChange={(e) => update({ price: Number(e.target.value) })}
              placeholder="499"
              className="font-mono tabular-nums"
            />
          </label>
          <label>
            <span>السعر القديم المشطوب:</span>
            <input
              type="number"
              value={content.oldPrice ?? product?.compare_at_price ?? ""}
              onChange={(e) => update({ oldPrice: Number(e.target.value) })}
              placeholder="750"
              className="font-mono tabular-nums"
            />
          </label>
          <label>
            <span>العملة:</span>
            <input
              type="text"
              value={content.currency || "ج.م"}
              onChange={(e) => update({ currency: e.target.value })}
              placeholder="ج.م"
            />
          </label>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
          <label>
            <span>نص زر الشراء (CTA):</span>
            <input
              type="text"
              value={content.ctaText || ""}
              onChange={(e) => update({ ctaText: e.target.value })}
              placeholder="اطلب الآن واستفد من العرض"
            />
          </label>
          <label>
            <span>التقييم (من 5):</span>
            <input
              type="number"
              step="0.1"
              min="1"
              max="5"
              value={content.rating || 4.9}
              onChange={(e) => update({ rating: Number(e.target.value) })}
              className="font-mono tabular-nums"
            />
          </label>
        </div>
        <div className="eo-items-list-editor" style={{ marginTop: 12 }}>
          <div className="eo-list-head">
            <strong>نقاط ومميزات المنتج البارزة:</strong>
            <button type="button" className="eo-btn eo-btn-xs" onClick={addBullet}>
              <Plus size={14} /> إضافة نقطة
            </button>
          </div>
          {bullets.map((bullet, i) => (
            <div key={i} className="eo-sub-card" style={{ padding: "6px 10px" }}>
              <div className="eo-sub-card-row">
                <span style={{ color: "#10b981", fontWeight: 700 }}>✓</span>
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) => updateBullet(i, e.target.value)}
                  placeholder="ميزة المنتج..."
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="eo-sub-del-btn"
                  onClick={() => removeBullet(i)}
                  title="حذف"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <CommonSectionStylingFields content={content} update={update} />
      </div>
    </div>
  );
};
