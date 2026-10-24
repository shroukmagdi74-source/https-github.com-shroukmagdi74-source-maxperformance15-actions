import React from "react";
import { SingleSectionEditorProps } from "./types";
import { CommonSectionStylingFields } from "./CommonSectionStylingFields";

// 2. TEXT EDITOR
export const TextSectionEditor: React.FC<SingleSectionEditorProps> = ({ content, update }) => {
  return (
    <div className="eo-section-editor-body">
      <div className="eo-fields">
        <label>
          <span>العنوان الرئيسي للقسم:</span>
          <input
            type="text"
            value={content.heading || ""}
            onChange={(e) => update({ heading: e.target.value })}
            placeholder="عنوان تسويقي جذاب..."
          />
        </label>
        <label>
          <span>العنوان الفرعي (مختصر):</span>
          <input
            type="text"
            value={content.subheading || ""}
            onChange={(e) => update({ subheading: e.target.value })}
            placeholder="نص فرعي يشرح القيمة..."
          />
        </label>
        <label>
          <span>الوصف التسويقي والتفاصيل:</span>
          <textarea
            rows={4}
            value={content.bodyText || ""}
            onChange={(e) => update({ bodyText: e.target.value })}
            placeholder="اكتب مواصفات وتفاصيل المنتج بأسلوب تسويقي واضح ومحفز..."
          />
        </label>
      </div>
    </div>
  );
};

// 22. HEADING EDITOR (EasyOrders "heading")
export const HeadingSectionEditor: React.FC<SingleSectionEditorProps> = ({ content, update }) => {
  return (
    <div className="eo-section-editor-body">
      <div className="eo-fields">
        <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 12 }}>
          <label>
            <span>نص العنوان الرئيسي:</span>
            <input
              type="text"
              value={content.title || ""}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="عنوان جذاب يلفت انتباه العميل"
            />
          </label>
          <label>
            <span>حجم العنوان:</span>
            <select
              value={content.headingLevel || "h2"}
              onChange={(e) => update({ headingLevel: e.target.value })}
            >
              <option value="h1">كبير جداً (H1)</option>
              <option value="h2">كبير رئيسي (H2)</option>
              <option value="h3">متوسط فرعي (H3)</option>
            </select>
          </label>
        </div>
        <label style={{ marginTop: 8 }}>
          <span>نص فرعي / توضيحي تحت العنوان:</span>
          <input
            type="text"
            value={content.subtitle || ""}
            onChange={(e) => update({ subtitle: e.target.value })}
            placeholder="نص توضيحي مكمل للعنوان يوضح القيمة المضافة..."
          />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 8 }}>
          <label>
            <span>محاذاة النص:</span>
            <select
              value={content.alignment || "center"}
              onChange={(e) => update({ alignment: e.target.value })}
            >
              <option value="center">في المنتصف (Center)</option>
              <option value="right">يمين (Right / RTL)</option>
              <option value="left">يسار (Left)</option>
            </select>
          </label>
          <label>
            <span>شارة أو تاج علوي (Badge):</span>
            <input
              type="text"
              value={content.badge || ""}
              onChange={(e) => update({ badge: e.target.value })}
              placeholder="ميزة حصرية"
            />
          </label>
          <label>
            <span>لون خط العنوان:</span>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
              <input
                type="color"
                value={content.textColor || "#0f172a"}
                onChange={(e) => update({ textColor: e.target.value })}
                style={{ width: 34, height: 32, padding: 0, border: "none", cursor: "pointer", borderRadius: 6 }}
              />
              <input
                type="text"
                value={content.textColor || "#0f172a"}
                onChange={(e) => update({ textColor: e.target.value })}
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

// 8. BANNERS EDITOR
export const BannersSectionEditor: React.FC<SingleSectionEditorProps> = ({ content, update }) => {
  return (
    <div className="eo-section-editor-body">
      <div className="eo-fields">
        <label>
          <span>نص اللافتة الترويجية (Banner Text):</span>
          <input
            type="text"
            value={content.bannerText || ""}
            onChange={(e) => update({ bannerText: e.target.value })}
            placeholder="عرض حصري لفترة محدودة — خصم 30% + شحن مجاني"
          />
        </label>
      </div>
    </div>
  );
};

// 9. HTML EDITOR
export const HtmlSectionEditor: React.FC<SingleSectionEditorProps> = ({ content, update }) => {
  return (
    <div className="eo-section-editor-body">
      <div className="eo-fields">
        <label>
          <span>كود HTML / سكريبت التتبع المخصص:</span>
          <textarea
            rows={5}
            value={content.htmlCode || ""}
            onChange={(e) => update({ htmlCode: e.target.value })}
            placeholder="<div>كود HTML مخصص أو سكريبتات إضافية...</div>"
            className="eo-code-textarea"
            dir="ltr"
          />
        </label>
      </div>
    </div>
  );
};
