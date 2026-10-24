import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { SingleSectionEditorProps } from "./types";

// 10. COMPARISON EDITOR
export const ComparisonSectionEditor: React.FC<SingleSectionEditorProps> = ({ content, update }) => {
  const items = content.comparisonItems || [];
  const updateItem = (
    index: number,
    field: "feature" | "us" | "them",
    val: string,
  ) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: val };
    update({ comparisonItems: next });
  };
  const addItem = () => {
    update({
      comparisonItems: [
        ...items,
        {
          feature: "ميزة جديدة",
          us: "مواصفات ممتازة لمنتجنا الأصلي",
          them: "عيوب المنتجات المقلدة في السوق",
        },
      ],
    });
  };
  const removeItem = (idx: number) => {
    update({ comparisonItems: items.filter((_, i) => i !== idx) });
  };

  return (
    <div className="eo-section-editor-body">
      <div className="eo-fields">
        <label>
          <span>عنوان جدول المقارنة:</span>
          <input
            type="text"
            value={content.comparisonTitle || ""}
            onChange={(e) => update({ comparisonTitle: e.target.value })}
            placeholder="لماذا تختار منتجنا الأصلي بدلاً من البدائل في السوق؟"
          />
        </label>
        <div className="eo-two-cols-inline" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
          <label>
            <span>تسمية منتجنا:</span>
            <input
              type="text"
              value={content.comparisonUsLabel || ""}
              onChange={(e) => update({ comparisonUsLabel: e.target.value })}
              placeholder="منتجنا الأصلي"
            />
          </label>
          <label>
            <span>تسمية البدائل في السوق:</span>
            <input
              type="text"
              value={content.comparisonThemLabel || ""}
              onChange={(e) => update({ comparisonThemLabel: e.target.value })}
              placeholder="المنتجات المقلدة في السوق"
            />
          </label>
        </div>
      </div>

      <div className="eo-items-list-editor" style={{ marginTop: 16 }}>
        <div className="eo-list-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <strong>عناصر ومحاور المقارنة:</strong>
          <button type="button" className="eo-btn eo-btn-xs" onClick={addItem}>
            <Plus size={14} /> إضافة محور
          </button>
        </div>
        {items.map((item, i) => (
          <div key={i} className="eo-sub-card" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, marginBottom: 8 }}>
            <div className="eo-sub-card-row" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="text"
                value={item.feature}
                onChange={(e) => updateItem(i, "feature", e.target.value)}
                placeholder="وجه المقارنة (مثال: جودة الخامات)"
                style={{ flex: 1, fontWeight: "bold" }}
              />
              <button
                type="button"
                className="eo-sub-del-btn"
                onClick={() => removeItem(i)}
                title="حذف"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 6 }}>
              <input
                type="text"
                value={item.us}
                onChange={(e) => updateItem(i, "us", e.target.value)}
                placeholder="ميزة منتجنا"
                style={{ borderColor: "#10b981" }}
              />
              <input
                type="text"
                value={item.them}
                onChange={(e) => updateItem(i, "them", e.target.value)}
                placeholder="عيب المنافس"
                style={{ borderColor: "#ef4444" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 11. BREAKDOWN EDITOR
export const BreakdownSectionEditor: React.FC<SingleSectionEditorProps> = ({ content, update }) => {
  const items = content.breakdownItems || [];
  const updateItem = (
    index: number,
    field: "title" | "desc" | "icon" | "tag",
    val: string,
  ) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: val };
    update({ breakdownItems: next });
  };
  const addItem = () => {
    update({
      breakdownItems: [
        ...items,
        {
          title: "ميزة تصنيع جديدة",
          desc: "شرح دقيق للميزة وكيف تفيد المشتري",
          icon: "★",
          tag: "ميزة حصرية",
        },
      ],
    });
  };
  const removeItem = (idx: number) => {
    update({ breakdownItems: items.filter((_, i) => i !== idx) });
  };

  return (
    <div className="eo-section-editor-body">
      <div className="eo-fields">
        <label>
          <span>عنوان قسم التشريح والمواصفات:</span>
          <input
            type="text"
            value={content.breakdownTitle || ""}
            onChange={(e) => update({ breakdownTitle: e.target.value })}
            placeholder="تشريح ومواصفات المنتج الدقيقة"
          />
        </label>
      </div>

      <div className="eo-items-list-editor" style={{ marginTop: 16 }}>
        <div className="eo-list-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <strong>كروت ومميزات التصنيع:</strong>
          <button type="button" className="eo-btn eo-btn-xs" onClick={addItem}>
            <Plus size={14} /> إضافة كارت
          </button>
        </div>
        {items.map((item, i) => (
          <div key={i} className="eo-sub-card" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, marginBottom: 8 }}>
            <div className="eo-sub-card-row" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="text"
                value={item.icon || "★"}
                onChange={(e) => updateItem(i, "icon", e.target.value)}
                style={{ width: 48, textAlign: "center", fontSize: "1.1rem" }}
                placeholder="أيقونة"
              />
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(i, "title", e.target.value)}
                placeholder="عنوان الميزة (مثال: خامات أصلية)"
                style={{ flex: 1, fontWeight: "bold" }}
              />
              <input
                type="text"
                value={item.tag || ""}
                onChange={(e) => updateItem(i, "tag", e.target.value)}
                placeholder="وسم (مثال: جودة 100%)"
                style={{ width: 120 }}
              />
              <button
                type="button"
                className="eo-sub-del-btn"
                onClick={() => removeItem(i)}
                title="حذف"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              rows={2}
              value={item.desc}
              onChange={(e) => updateItem(i, "desc", e.target.value)}
              placeholder="شرح تفاصيل الميزة وفائدتها للمشتري..."
              style={{ marginTop: 6, width: "100%" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
