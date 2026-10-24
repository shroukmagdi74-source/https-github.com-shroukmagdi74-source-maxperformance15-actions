import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { SingleSectionEditorProps } from "./types";
import { CommonSectionStylingFields } from "./CommonSectionStylingFields";

// 6. REVIEWS EDITOR
export const ReviewsSectionEditor: React.FC<SingleSectionEditorProps> = ({ content, update }) => {
  const reviews = content.reviews || [];
  const addReview = () => {
    update({
      reviews: [
        ...reviews,
        { name: "عميل راضي", text: "المنتج تحفة ووصلني في الميعاد المحدد وجودته عالية جداً.", rating: 5 },
      ],
    });
  };

  const updateReview = (index: number, key: string, val: string | number) => {
    const next = reviews.map((r, i) => (i === index ? { ...r, [key]: val } : r));
    update({ reviews: next });
  };

  const removeReview = (index: number) => {
    update({ reviews: reviews.filter((_, i) => i !== index) });
  };

  return (
    <div className="eo-section-editor-body">
      <div className="eo-items-list-editor">
        <div className="eo-list-head">
          <strong>تقييمات وآراء العملاء:</strong>
          <button type="button" className="eo-btn eo-btn-xs" onClick={addReview}>
            <Plus size={14} /> إضافة تقييم
          </button>
        </div>
        {reviews.map((rev, i) => (
          <div key={i} className="eo-sub-card">
            <div className="eo-sub-card-row">
              <input
                type="text"
                className="eo-title-input"
                value={rev.name}
                onChange={(e) => updateReview(i, "name", e.target.value)}
                placeholder="اسم العميل"
              />
              <select
                value={rev.rating}
                onChange={(e) => updateReview(i, "rating", Number(e.target.value))}
                className="eo-rating-select font-mono tabular-nums"
              >
                <option value={5}>★★★★★ (5)</option>
                <option value={4}>★★★★☆ (4)</option>
                <option value={3}>★★★☆☆ (3)</option>
              </select>
              <button
                type="button"
                className="eo-sub-del-btn"
                onClick={() => removeReview(i)}
                title="حذف"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              rows={2}
              value={rev.text}
              onChange={(e) => updateReview(i, "text", e.target.value)}
              placeholder="نص التقييم ورأي العميل..."
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// 7. FAQ EDITOR
export const FaqSectionEditor: React.FC<SingleSectionEditorProps> = ({ content, update }) => {
  const faqs = content.faqs || [];
  const addFaq = () => {
    update({
      faqs: [
        ...faqs,
        { question: "سؤال متكرر جديد؟", answer: "الإجابة التوضيحية والتفصيلية للعميل هنا." },
      ],
    });
  };

  const updateFaq = (index: number, key: "question" | "answer", val: string) => {
    const next = faqs.map((q, i) => (i === index ? { ...q, [key]: val } : q));
    update({ faqs: next });
  };

  const removeFaq = (index: number) => {
    update({ faqs: faqs.filter((_, i) => i !== index) });
  };

  return (
    <div className="eo-section-editor-body">
      <div className="eo-items-list-editor">
        <div className="eo-list-head">
          <strong>الأسئلة الشائعة وإجاباتها:</strong>
          <button type="button" className="eo-btn eo-btn-xs" onClick={addFaq}>
            <Plus size={14} /> إضافة سؤال
          </button>
        </div>
        {faqs.map((faq, i) => (
          <div key={i} className="eo-sub-card">
            <div className="eo-sub-card-row">
              <input
                type="text"
                value={faq.question}
                onChange={(e) => updateFaq(i, "question", e.target.value)}
                placeholder="السؤال..."
                className="eo-flex-1"
              />
              <button
                type="button"
                className="eo-sub-del-btn"
                onClick={() => removeFaq(i)}
                title="حذف"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              rows={2}
              value={faq.answer}
              onChange={(e) => updateFaq(i, "answer", e.target.value)}
              placeholder="الإجابة..."
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// 13. LIVE_PROOF EDITOR
export const LiveProofSectionEditor: React.FC<SingleSectionEditorProps> = ({ content, update }) => {
  return (
    <div className="eo-section-editor-body">
      <div className="eo-fields">
        <label>
          <span>نسبة رضا وتقييم المشترين:</span>
          <input
            type="text"
            value={content.satisfactionRate || ""}
            onChange={(e) => update({ satisfactionRate: e.target.value })}
            placeholder="4.9 / 5 (أكثر من 1,420 تقييم)"
            className="font-mono tabular-nums"
          />
        </label>
        <p className="eo-hint" style={{ fontSize: "0.85rem", color: "#64748b", marginTop: 6 }}>
          يتم توليد إشعارات الطلبات الحديثة تلقائياً بناءً على بيانات المنتج والمحافظات لإعطاء مصداقية حية وفورية تزيد من مبيعات الدفع عند الاستلام.
        </p>
      </div>
    </div>
  );
};

// 15. BEFORE_AFTER EDITOR
export const BeforeAfterSectionEditor: React.FC<SingleSectionEditorProps> = ({ content, update }) => {
  return (
    <div className="eo-section-editor-body">
      <div className="eo-fields">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>
            <span>تسمية الصورة الأولى (قبل / البديل العادي):</span>
            <input
              type="text"
              value={content.beforeLabel || ""}
              onChange={(e) => update({ beforeLabel: e.target.value })}
              placeholder="المنتجات العادية في السوق"
            />
          </label>
          <label>
            <span>رابط صورة (قبل):</span>
            <input
              type="text"
              value={content.beforeImage || ""}
              onChange={(e) => update({ beforeImage: e.target.value })}
              placeholder="https://.../before.jpg"
              dir="ltr"
            />
          </label>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
          <label>
            <span>تسمية الصورة الثانية (بعد / منتجنا الأصلي):</span>
            <input
              type="text"
              value={content.afterLabel || ""}
              onChange={(e) => update({ afterLabel: e.target.value })}
              placeholder="منتجنا الأصلي المتميز"
            />
          </label>
          <label>
            <span>رابط صورة (بعد):</span>
            <input
              type="text"
              value={content.afterImage || ""}
              onChange={(e) => update({ afterImage: e.target.value })}
              placeholder="https://.../after.jpg"
              dir="ltr"
            />
          </label>
        </div>
        <p className="eo-hint" style={{ fontSize: "0.85rem", color: "#64748b", marginTop: 8 }}>
          سلايدر قبل وبعد يتيح للعميل سحب المقبض التفاعلي يميناً ويساراً لمقارنة النتائج بصرياً بشكل فوري.
        </p>
        <CommonSectionStylingFields content={content} update={update} />
      </div>
    </div>
  );
};
