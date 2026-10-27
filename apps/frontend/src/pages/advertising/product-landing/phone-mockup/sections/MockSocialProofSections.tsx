import React from "react";
import { LandingSection } from "../../types";

export const renderReviewsSection = (section: LandingSection) => {
  const { content, id } = section;
  const reviews = content.reviews || [];
  const isWhatsApp = section.variant === "WHATSAPP";

  if (isWhatsApp) {
    return (
      <div key={id} className="eo-sync-wa-preview-section" style={{ margin: "10px 0", borderRadius: 10, overflow: "hidden", border: "1px solid #d1d5db", background: "#efeae2" }}>
        <div style={{ background: "#008069", color: "#ffffff", padding: "7px 10px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, background: "#25d366", borderRadius: "50%" }} />
          <strong style={{ fontSize: "0.75rem" }}>فريق خدمة العملاء — واتساب</strong>
        </div>
        <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: 6 }}>
          {reviews.map((rev: any, i: number) => (
            <div key={i} style={{ background: "#ffffff", borderRadius: "8px 8px 0 8px", padding: "6px 8px", maxWidth: "90%", alignSelf: "flex-start", boxShadow: "0 1px 1px rgba(0,0,0,0.08)", fontSize: "0.7rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 4, marginBottom: 2 }}>
                <strong style={{ color: "#128c7e", fontSize: "0.68rem" }}>{rev.name}</strong>
                <span style={{ fontSize: "0.6rem", background: "#dcfce7", color: "#15803d", padding: "0 4px", borderRadius: 4 }}>مشتري مؤكد ✓</span>
              </div>
              <p style={{ margin: 0, color: "#111827", lineHeight: 1.4 }}>{rev.text || rev.comment}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div key={id} className="eo-sync-reviews-section">
      <span className="eo-sync-sec-label">آراء وتجارب العملاء:</span>
      <div className="eo-sync-reviews-stack">
        {reviews.map((rev: any, i: number) => (
          <div key={i} className="eo-sync-rev-card">
            <div className="eo-sync-rev-header">
              <strong>{rev.name}</strong>
              <span className="eo-sync-stars">
                {"★".repeat(rev.rating || 5)}
              </span>
            </div>
            <p>{rev.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const renderFaqSection = (section: LandingSection) => {
  const { content, id } = section;
  const faqs = content.faqs || [];
  return (
    <div key={id} className="eo-sync-faqs-section">
      <span className="eo-sync-sec-label">الأسئلة الشائعة:</span>
      {faqs.map((faq: any, i: number) => (
        <div key={i} className="eo-sync-faq-card">
          <strong>س: {faq.question}</strong>
          <p>ج: {faq.answer}</p>
        </div>
      ))}
    </div>
  );
};

export const renderBreakdownSection = (section: LandingSection) => {
  const { content, id } = section;
  const items = content.breakdownItems || [];
  return (
    <div key={id} className="eo-sync-breakdown-section" style={{ padding: "12px 8px", background: "#f8fafc", borderRadius: 10, margin: "8px 0" }}>
      <h4 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 8px" }}>{content.breakdownTitle || "تشريح ومواصفات المنتج"}</h4>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {items.map((item: any, i: number) => (
          <div key={i} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
              <span>{item.icon || "✨"}</span>
              <strong style={{ fontSize: "0.75rem", color: "#0f172a" }}>{item.title}</strong>
            </div>
            <p style={{ fontSize: "0.68rem", color: "#64748b", margin: 0, lineHeight: 1.3 }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const renderComparisonSection = (section: LandingSection) => {
  const { content, id } = section;
  const items = content.comparisonItems || [];
  return (
    <div key={id} className="eo-sync-comp-section" style={{ padding: "12px 8px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, margin: "8px 0" }}>
      <h4 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 8px", color: "#0f172a" }}>{content.comparisonTitle || "جدول مقارنة التميز"}</h4>
      <div style={{ fontSize: "0.72rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", background: "#0f172a", color: "#fff", padding: "6px 8px", borderRadius: 6, fontWeight: 700 }}>
          <span>الميزة</span>
          <span style={{ color: "#34d399" }}>{content.comparisonUsLabel || "الأصلي"}</span>
          <span style={{ color: "#94a3b8" }}>{content.comparisonThemLabel || "التقليد"}</span>
        </div>
        {items.map((it: any, i: number) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", padding: "6px 8px", borderBottom: "1px solid #f1f5f9", alignItems: "center" }}>
            <strong>{it.feature}</strong>
            <span style={{ color: "#059669", fontWeight: 600 }}>✓ {it.us}</span>
            <span style={{ color: "#dc2626" }}>✕ {it.them}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const renderLiveProofSection = (section: LandingSection) => {
  const { content, id } = section;
  const recent = content.recentOrders || [];
  return (
    <div key={id} className="eo-sync-liveproof-bar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff", border: "1px solid #e2e8f0", padding: "6px 10px", borderRadius: 8, margin: "6px 0", fontSize: "0.72rem", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 6, height: 6, background: "#10b981", borderRadius: "50%", display: "inline-block" }} />
        <strong style={{ color: "#0f172a", fontSize: "0.7rem" }}>طلب مباشر:</strong>
        <span style={{ color: "#475569" }}>
          {recent[0]?.city || "القاهرة"} — {recent[0]?.item || "المنتج"}
        </span>
      </div>
      <span style={{ color: "#92400e", background: "#fffbeb", padding: "1px 6px", borderRadius: 10, fontSize: "0.68rem", fontWeight: 700 }}>
        ★ 4.9
      </span>
    </div>
  );
};

export const renderWhatsAppChatSection = (section: LandingSection) => {
  const { content, id } = section;
  const messages = content.messages || [
    { sender: "customer", text: "هو المنتج ده أصلي ومضمون؟" },
    { sender: "store", text: "أه طبعاً يا فندم أصلي 100% ومعاه ضمان استرجاع ومعاينة قبل الدفع" },
  ];
  return (
    <div
      key={id}
      className="eo-sync-wa-section"
      style={{
        margin: "8px 0",
        padding: "10px 8px",
        background: "#efeae2",
        borderRadius: 10,
        border: "1px solid #d1d5db",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid #d9d9d9" }}>
        <span style={{ width: 8, height: 8, background: "#25d366", borderRadius: "50%" }} />
        <strong style={{ fontSize: "0.75rem", color: "#075e54" }}>خدمة عملاء واتساب المباشرة</strong>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {messages.map((m: any, idx: number) => {
          const isMe = m.sender === "store";
          return (
            <div
              key={idx}
              style={{
                alignSelf: isMe ? "flex-start" : "flex-end",
                background: isMe ? "#ffffff" : "#dcf8c6",
                padding: "5px 8px",
                borderRadius: 6,
                maxWidth: "85%",
                fontSize: "0.7rem",
                color: "#111827",
                boxShadow: "0 1px 1px rgba(0,0,0,0.06)",
              }}
            >
              {m.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};
