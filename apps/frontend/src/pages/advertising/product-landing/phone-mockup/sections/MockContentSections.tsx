import React from "react";
import { Clock, Flame } from "lucide-react";
import { LandingSection } from "../../types";

export const renderBannerSection = (section: LandingSection) => {
  const { content, id } = section;
  return (
    <div
      key={id}
      className="eo-sync-banner"
      style={{
        backgroundColor: content.bannerBg || "#0284c7",
        color: content.textColor || "#ffffff",
      }}
    >
      <span>{content.bannerText || content.text || "عرض خاص لفترة محدودة — شحن سريع وتأكيد فوري"}</span>
    </div>
  );
};

export const renderTextSection = (section: LandingSection) => {
  const { content, id } = section;
  return (
    <div key={id} className="eo-sync-text-section">
      <h4>{content.heading || "مواصفات وتفاصيل المنتج"}</h4>
      {content.subheading && <p className="eo-sync-subheading">{content.subheading}</p>}
      {content.bodyText && <p className="eo-sync-body-text">{content.bodyText}</p>}
    </div>
  );
};

export const renderFeaturesSection = (section: LandingSection) => {
  const { content, id } = section;
  const features = content.features || [];
  return (
    <div key={id} className="eo-sync-features-section">
      <span className="eo-sync-sec-label">مميزات المنتج:</span>
      <div className="eo-sync-features-grid">
        {features.map((f: any, i: number) => (
          <div key={i} className="eo-sync-feature-box">
            <span className="eo-sync-feat-ico">{f.icon || "✨"}</span>
            <div>
              <strong>{f.title}</strong>
              <small>{f.desc}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const renderCountdownSection = (section: LandingSection) => {
  const { content, id } = section;
  return (
    <div key={id} className="eo-sync-countdown-bar">
      <div className="eo-sync-timer-label">
        <Clock size={14} />
        <span>ينتهي العرض خلال: <strong className="tabular-nums">44:59</strong></span>
      </div>
      <div className="eo-sync-stock-chip">
        <Flame size={13} />
        <span className="tabular-nums">باقي {content.lowStockCount || 12} قطعة فقط</span>
      </div>
    </div>
  );
};

export const renderHeadingSection = (section: LandingSection) => {
  const { content, id } = section;
  const align = content.alignment || content.titleAlign || "center";
  return (
    <div
      key={id}
      className="eo-sync-heading-section"
      style={{
        margin: "12px 0 6px",
        textAlign: align as any,
        padding: "6px 4px",
      }}
    >
      {content.badge && (
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: 12,
            background: "#eff6ff",
            color: "#2563eb",
            fontSize: "0.65rem",
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          {content.badge}
        </span>
      )}
      <h3
        style={{
          margin: 0,
          fontSize: content.headingLevel === "h1" ? "1.1rem" : "0.95rem",
          fontWeight: 800,
          color: content.textColor || "#0f172a",
          lineHeight: 1.3,
        }}
      >
        {content.title || content.heading || "عنوان القسم الرئيسي"}
      </h3>
      {(content.subtitle || content.subheading) && (
        <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#64748b" }}>
          {content.subtitle || content.subheading}
        </p>
      )}
    </div>
  );
};

export const renderBuyButtonSection = (section: LandingSection) => {
  const { content, id } = section;
  const btnBg = content.btnColor || content.buyButtonBg || "#16a34a";
  const btnColor = content.btnTextColor || content.buyButtonTextColor || "#ffffff";
  const text = content.text || content.buyButtonText || content.title || "اضغط هنا للطلب الآن — دفع عند الاستلام";
  return (
    <div
      key={id}
      className="eo-sync-buy-button-wrapper"
      style={{ margin: "10px 0", textAlign: "center" }}
    >
      <a
        href="#checkout-form"
        style={{
          display: "block",
          padding: "10px 14px",
          borderRadius: 8,
          background: btnBg,
          color: btnColor,
          fontWeight: 700,
          fontSize: "0.82rem",
          textDecoration: "none",
          boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)",
        }}
      >
        {text}
      </a>
      {(content.subtitle || content.subtext) && (
        <span style={{ fontSize: "0.68rem", color: "#64748b", display: "block", marginTop: 4 }}>
          {content.subtitle || content.subtext}
        </span>
      )}
    </div>
  );
};

export const renderBeforeAfterSection = (section: LandingSection) => {
  const { content, id } = section;
  return (
    <div
      key={id}
      className="eo-sync-beforeafter-section"
      style={{
        margin: "8px 0",
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        background: "#f8fafc",
        padding: 8,
      }}
    >
      <h4 style={{ fontSize: "0.8rem", fontWeight: 700, margin: "0 0 6px", textAlign: "center" }}>
        مقارنة النتائج (قبل وبعد)
      </h4>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ height: 80, background: "#fee2e2", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {content.beforeImage ? (
              <img src={content.beforeImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "0.7rem", color: "#dc2626" }}>قبل (العادي)</span>
            )}
          </div>
          <span style={{ fontSize: "0.65rem", color: "#ef4444", fontWeight: 600, display: "block", marginTop: 3 }}>
            {content.beforeLabel || "قبل"}
          </span>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ height: 80, background: "#dcfce7", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {content.afterImage ? (
              <img src={content.afterImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "0.7rem", color: "#16a34a" }}>بعد (الأصلي)</span>
            )}
          </div>
          <span style={{ fontSize: "0.65rem", color: "#16a34a", fontWeight: 600, display: "block", marginTop: 3 }}>
            {content.afterLabel || "بعد"}
          </span>
        </div>
      </div>
    </div>
  );
};

export const renderHtmlSection = (section: LandingSection) => {
  const { content, id } = section;
  return (
    <div
      key={id}
      className="eo-sync-html-section"
      style={{ margin: "6px 0", fontSize: "0.75rem" }}
      dangerouslySetInnerHTML={{ __html: content.htmlContent || "<!-- مخصص -->" }}
    />
  );
};
