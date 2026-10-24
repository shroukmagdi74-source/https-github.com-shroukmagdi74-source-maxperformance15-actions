import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { SingleSectionEditorProps } from "./types";
import { CommonSectionStylingFields } from "./CommonSectionStylingFields";

// 3. COUNTDOWN EDITOR
export const CountdownSectionEditor: React.FC<SingleSectionEditorProps> = ({ content, update }) => {
  return (
    <div className="eo-section-editor-body">
      <div className="eo-fields">
        <label>
          <span>نص التنبيه أو العرض الترويجي:</span>
          <input
            type="text"
            value={content.text || ""}
            onChange={(e) => update({ text: e.target.value })}
            placeholder="مثال: عرض خاص لفترة محدودة — اطلب الآن قبل انتهاء الكمية!"
          />
        </label>
      </div>
      <div className="eo-fields eo-fields-inline" style={{ marginTop: 10 }}>
        <label>
          <span>مدة العداد التنازلي (بالدقائق):</span>
          <input
            type="number"
            min={1}
            max={1440}
            className="font-mono tabular-nums"
            value={content.timerEndsMinutes ?? 45}
            onChange={(e) => update({ timerEndsMinutes: Number(e.target.value) || 45 })}
          />
        </label>
        <label>
          <span>عدد القطع المتبقية في شريط النفاد:</span>
          <input
            type="number"
            min={1}
            max={100}
            className="font-mono tabular-nums"
            value={content.lowStockCount ?? 14}
            onChange={(e) => update({ lowStockCount: Number(e.target.value) || 14 })}
          />
        </label>
      </div>
    </div>
  );
};

// 4. FEATURES EDITOR
export const FeaturesSectionEditor: React.FC<SingleSectionEditorProps> = ({ content, update }) => {
  const features = content.features || [];
  const addFeature = () => {
    update({
      features: [
        ...features,
        { title: "ميزة جديدة", desc: "تفاصيل الميزة والضمان هنا", icon: "✓" },
      ],
    });
  };

  const updateFeature = (index: number, key: string, val: string) => {
    const next = features.map((f, i) => (i === index ? { ...f, [key]: val } : f));
    update({ features: next });
  };

  const removeFeature = (index: number) => {
    update({ features: features.filter((_, i) => i !== index) });
  };

  return (
    <div className="eo-section-editor-body">
      <div className="eo-items-list-editor">
        <div className="eo-list-head">
          <strong>مميزات وشارات الثقة:</strong>
          <button type="button" className="eo-btn eo-btn-xs" onClick={addFeature}>
            <Plus size={14} /> إضافة ميزة
          </button>
        </div>
        {features.map((f, i) => (
          <div key={i} className="eo-sub-card">
            <div className="eo-sub-card-row">
              <input
                type="text"
                className="eo-icon-input"
                value={f.icon}
                onChange={(e) => updateFeature(i, "icon", e.target.value)}
                placeholder="أيقونة أو رمز"
                title="أيقونة أو رمز تعبيري"
              />
              <input
                type="text"
                className="eo-title-input"
                value={f.title}
                onChange={(e) => updateFeature(i, "title", e.target.value)}
                placeholder="عنوان الميزة"
              />
              <button
                type="button"
                className="eo-sub-del-btn"
                onClick={() => removeFeature(i)}
                title="حذف"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <input
              type="text"
              value={f.desc}
              onChange={(e) => updateFeature(i, "desc", e.target.value)}
              placeholder="تفاصيل الميزة"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// 18. HOW_IT_WORKS EDITOR (EasyOrders "how-to-work")
export const HowItWorksSectionEditor: React.FC<SingleSectionEditorProps> = ({ content, update }) => {
  const steps = content.steps || [];
  const addStep = () => {
    update({
      steps: [
        ...steps,
        {
          number: steps.length + 1,
          title: `الخطوة ${steps.length + 1}`,
          desc: "اشرح للعميل كيفية استخدام المنتج أو خطوات الاستلام والتجربة.",
        },
      ],
    });
  };

  const updateStep = (index: number, key: string, val: unknown) => {
    const next = steps.map((s, idx) => (idx === index ? { ...s, [key]: val } : s));
    update({ steps: next });
  };

  const removeStep = (index: number) => {
    update({ steps: steps.filter((_, idx) => idx !== index) });
  };

  return (
    <div className="eo-section-editor-body">
      <div className="eo-fields">
        <label>
          <span>عنوان القسم الرئيسي:</span>
          <input
            type="text"
            value={content.title || ""}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="طريقة الاستخدام السهلة في 3 خطوات"
          />
        </label>
        <label style={{ marginTop: 8 }}>
          <span>وصف تمهيدي:</span>
          <input
            type="text"
            value={content.subtitle || ""}
            onChange={(e) => update({ subtitle: e.target.value })}
            placeholder="خطوات بسيطة تضمن لك أقصى استفادة من أول يوم"
          />
        </label>
      </div>
      <div className="eo-items-list-editor" style={{ marginTop: 12 }}>
        <div className="eo-list-head">
          <strong>الخطوات والمراحل:</strong>
          <button type="button" className="eo-btn eo-btn-xs" onClick={addStep}>
            <Plus size={14} /> إضافة خطوة
          </button>
        </div>
        {steps.map((step, i) => (
          <div key={i} className="eo-sub-card">
            <div className="eo-sub-card-row">
              <span style={{ fontWeight: 700, color: "#3b82f6", width: 24, textAlign: "center" }} className="font-mono tabular-nums">
                #{i + 1}
              </span>
              <input
                type="text"
                className="eo-title-input"
                value={step.title}
                onChange={(e) => updateStep(i, "title", e.target.value)}
                placeholder="عنوان الخطوة"
              />
              <button
                type="button"
                className="eo-sub-del-btn"
                onClick={() => removeStep(i)}
                title="حذف الخطوة"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              rows={2}
              value={step.desc}
              onChange={(e) => updateStep(i, "desc", e.target.value)}
              placeholder="شرح وتفاصيل الخطوة..."
            />
            <div style={{ marginTop: 6 }}>
              <input
                type="text"
                value={step.image || ""}
                onChange={(e) => updateStep(i, "image", e.target.value)}
                placeholder="رابط صورة توضيحية للخطوة (اختياري)"
                dir="ltr"
                style={{ fontSize: "0.8rem" }}
              />
            </div>
          </div>
        ))}
        <CommonSectionStylingFields content={content} update={update} />
      </div>
    </div>
  );
};

// 21. BUY_BUTTON EDITOR (EasyOrders "buy_button")
export const BuyButtonSectionEditor: React.FC<SingleSectionEditorProps> = ({ content, update }) => {
  return (
    <div className="eo-section-editor-body">
      <div className="eo-fields">
        <label>
          <span>نص الزر الرئيسي:</span>
          <input
            type="text"
            value={content.text || content.title || ""}
            onChange={(e) => update({ text: e.target.value, title: e.target.value })}
            placeholder="اضغط هنا لطلب المنتج الآن — الدفع عند الاستلام"
          />
        </label>
        <label style={{ marginTop: 8 }}>
          <span>نص فرعي محفز أسفل الزر (Subtext):</span>
          <input
            type="text"
            value={content.subtitle || content.subtext || ""}
            onChange={(e) => update({ subtitle: e.target.value, subtext: e.target.value })}
            placeholder="شحن سريع لجميع المحافظات + معاينة قبل الدفع وضمان 14 يوم"
          />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
          <label>
            <span>الإجراء عند النقر (Click Action):</span>
            <select
              value={content.targetAction || "scroll_to_form"}
              onChange={(e) => update({ targetAction: e.target.value })}
            >
              <option value="scroll_to_form">الانتقال السلس لنموذج الطلب (Scroll to Form)</option>
              <option value="open_whatsapp">مراسلة واتساب فوراً (WhatsApp Direct)</option>
              <option value="custom_url">فتح رابط مخصص (Custom URL)</option>
            </select>
          </label>
          <label>
            <span>تأثير الحركة (Animation Effect):</span>
            <select
              value={content.animation || "pulse"}
              onChange={(e) => update({ animation: e.target.value })}
            >
              <option value="pulse">نبض مستمر (Pulse Attention)</option>
              <option value="bounce">قفز لطيف (Bounce)</option>
              <option value="glow">إضاءة متوهجة (Glow)</option>
              <option value="none">بدون تأثير حركي (Static)</option>
            </select>
          </label>
        </div>
        {content.targetAction === "custom_url" && (
          <label style={{ marginTop: 8 }}>
            <span>الرابط المستهدف:</span>
            <input
              type="text"
              value={content.targetUrl || ""}
              onChange={(e) => update({ targetUrl: e.target.value })}
              placeholder="https://... أو رابط صفحة"
              dir="ltr"
            />
          </label>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
          <label>
            <span>لون الزر (Button Color):</span>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
              <input
                type="color"
                value={content.btnColor || "#16a34a"}
                onChange={(e) => update({ btnColor: e.target.value })}
                style={{ width: 34, height: 32, padding: 0, border: "none", cursor: "pointer", borderRadius: 6 }}
              />
              <input
                type="text"
                value={content.btnColor || "#16a34a"}
                onChange={(e) => update({ btnColor: e.target.value })}
                dir="ltr"
                style={{ flex: 1 }}
              />
            </div>
          </label>
          <label>
            <span>لون النص:</span>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
              <input
                type="color"
                value={content.btnTextColor || "#ffffff"}
                onChange={(e) => update({ btnTextColor: e.target.value })}
                style={{ width: 34, height: 32, padding: 0, border: "none", cursor: "pointer", borderRadius: 6 }}
              />
              <input
                type="text"
                value={content.btnTextColor || "#ffffff"}
                onChange={(e) => update({ btnTextColor: e.target.value })}
                dir="ltr"
                style={{ flex: 1 }}
              />
            </div>
          </label>
        </div>
        <CommonSectionStylingFields content={content} update={update} />
      </div>
    </div>
  );
};
