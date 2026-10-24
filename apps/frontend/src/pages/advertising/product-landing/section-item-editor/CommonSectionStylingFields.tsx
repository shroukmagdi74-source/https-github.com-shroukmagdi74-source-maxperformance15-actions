import React, { useState } from "react";
import { Palette } from "lucide-react";
import { CommonStylingProps } from "./types";

export const CommonSectionStylingFields: React.FC<CommonStylingProps> = ({ content, update }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="eo-common-style-box" style={{ marginTop: 14, borderTop: "1px dashed #e2e8f0", paddingTop: 10 }}>
      <button
        type="button"
        className="eo-style-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#475569",
          fontSize: "0.82rem",
          fontWeight: 600,
          padding: "4px 0",
          width: "100%",
        }}
      >
        <Palette size={14} style={{ color: "#3b82f6" }} />
        <span>خيارات التصميم المتقدمة للقسم (ألوان الخلفية، كود CSS، تبديل مكان الصورة)</span>
        <span style={{ marginInlineStart: "auto", fontSize: "0.75rem", color: "#64748b" }}>
          {isOpen ? "▲ إخفاء" : "▼ إظهار"}
        </span>
      </button>
      {isOpen && (
        <div className="eo-style-fields-grid" style={{ marginTop: 8, padding: 10, background: "#f8fafc", borderRadius: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label>
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>لون خلفية القسم:</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
                <input
                  type="color"
                  value={content.bgColor || "#ffffff"}
                  onChange={(e) => update({ bgColor: e.target.value })}
                  style={{ width: 34, height: 32, padding: 0, border: "none", cursor: "pointer", borderRadius: 6 }}
                />
                <input
                  type="text"
                  value={content.bgColor || ""}
                  onChange={(e) => update({ bgColor: e.target.value })}
                  placeholder="#ffffff أو transparent"
                  dir="ltr"
                  style={{ flex: 1 }}
                />
              </div>
            </label>
            <label>
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>رابط صورة خلفية للقسم:</span>
              <input
                type="text"
                value={content.bgImage || ""}
                onChange={(e) => update({ bgImage: e.target.value })}
                placeholder="https://.../bg.jpg"
                dir="ltr"
                style={{ marginTop: 2 }}
              />
            </label>
          </div>
          <div style={{ marginTop: 8 }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer", fontSize: "0.82rem" }}>
              <input
                type="checkbox"
                checked={Boolean(content.reversed)}
                onChange={(e) => update({ reversed: e.target.checked })}
              />
              <span>تبديل مكان الصورة مع النص (عكس الترتيب أفقياً / رأسياً)</span>
            </label>
          </div>
          <label style={{ marginTop: 8, display: "block" }}>
            <span style={{ fontSize: "0.78rem", color: "#64748b" }}>كود CSS مخصص لهذا القسم:</span>
            <textarea
              rows={2}
              value={content.customCss || ""}
              onChange={(e) => update({ customCss: e.target.value })}
              placeholder="/* أضف كود CSS إضافي خاص بهذا القسم فقط */"
              className="eo-code-textarea"
              dir="ltr"
              style={{ marginTop: 2, fontSize: "0.75rem", fontFamily: "monospace" }}
            />
          </label>
        </div>
      )}
    </div>
  );
};
