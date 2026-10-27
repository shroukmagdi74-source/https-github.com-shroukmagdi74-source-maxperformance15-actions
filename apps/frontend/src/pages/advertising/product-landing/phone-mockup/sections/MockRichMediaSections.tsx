import React from "react";
import { LandingSection, ProductLandingProduct } from "../../types";
import { formatMoney } from "../../types";
import { DeviceType } from "../types";

export const renderImageOnlySection = (
  section: LandingSection,
  device: DeviceType,
  prodImg?: string
) => {
  const { content, id } = section;
  const imgUrl =
    (device === "mobile" && content.mobileImage) ||
    content.imageUrl ||
    content.mainImage ||
    prodImg;
  const isFull = content.variant === "full" || content.isFullWidth;
  const isCircle = Boolean(content.isCircle);
  const bRadius = isCircle ? "50%" : isFull ? 0 : (content.borderRadius ?? 8);

  return (
    <div
      key={id}
      className="eo-sync-image-only"
      style={{
        margin: isFull ? "6px -8px" : "6px 0",
        borderRadius: bRadius,
        overflow: "hidden",
        background: content.bgColor || "transparent",
        textAlign: isCircle ? "center" : undefined,
      }}
    >
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={content.altText || ""}
          style={{
            width: isCircle ? 140 : "100%",
            height: isCircle ? 140 : "auto",
            borderRadius: bRadius,
            display: "block",
            objectFit: "cover",
            margin: isCircle ? "0 auto" : undefined,
          }}
        />
      ) : (
        <div style={{ height: 140, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
          صورة مفردة
        </div>
      )}
      {content.caption && (
        <p style={{ fontSize: "0.72rem", color: "#64748b", textAlign: "center", margin: "4px 0" }}>
          {content.caption}
        </p>
      )}
    </div>
  );
};

export const renderCarouselSection = (
  section: LandingSection,
  prodImg?: string
) => {
  const { content, id } = section;
  const cImages = content.carouselImages || (content.images ? content.images.map((u: string) => ({ url: u })) : []) || [];
  const firstImg = cImages[0]?.url || prodImg;

  return (
    <div
      key={id}
      className="eo-sync-carousel"
      style={{
        margin: "6px 0",
        borderRadius: 10,
        overflow: "hidden",
        background: content.bgColor || "#0f172a",
        position: "relative",
      }}
    >
      {firstImg ? (
        <img
          src={firstImg}
          alt=""
          style={{ width: "100%", height: 190, objectFit: "cover", display: "block" }}
        />
      ) : (
        <div style={{ height: 160, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
          سلايدر صور متقلب
        </div>
      )}
      {cImages.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 5,
          }}
        >
          {cImages.slice(0, 5).map((_: any, i: number) => (
            <span
              key={i}
              style={{
                width: i === 0 ? 14 : 6,
                height: 6,
                borderRadius: 3,
                background: i === 0 ? "#ffffff" : "rgba(255,255,255,0.5)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const renderHowItWorksSection = (section: LandingSection) => {
  const { content, id } = section;
  const steps = content.steps || [];

  return (
    <div
      key={id}
      className="eo-sync-howitworks"
      style={{
        padding: "12px 10px",
        background: content.bgColor || "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        margin: "8px 0",
      }}
    >
      <h4 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 2px", textAlign: "center" }}>
        {content.title || content.heading || "طريقة الاستخدام في 3 خطوات"}
      </h4>
      {content.subtitle && (
        <p style={{ fontSize: "0.7rem", color: "#64748b", textAlign: "center", margin: "0 0 10px" }}>
          {content.subtitle}
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {steps.map((st: any, i: number) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              background: "#f8fafc",
              padding: "8px",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#2563eb",
                color: "#fff",
                fontSize: "0.72rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {st.number || st.stepNumber || i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: "0.75rem", color: "#0f172a", display: "block" }}>{st.title}</strong>
              <p style={{ fontSize: "0.68rem", color: "#64748b", margin: 0, lineHeight: 1.3 }}>{st.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const renderFeaturedProductSection = (
  section: LandingSection,
  product: ProductLandingProduct | null,
  priceNum: number,
  prodImg?: string
) => {
  const { content, id } = section;
  const bullets = content.featuredBullets || content.bullets || [];
  const featImg = content.imageUrl || content.mainImage || prodImg;
  const pPrice = content.price ?? priceNum;
  const pOldPrice = content.oldPrice ?? (pPrice ? Math.round(pPrice * 1.3) : 0);

  return (
    <div
      key={id}
      className="eo-sync-featured-product"
      style={{
        padding: "12px",
        background: content.bgColor || "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
        border: "1px solid #bfdbfe",
        borderRadius: 12,
        margin: "8px 0",
        position: "relative",
      }}
    >
      {(content.featuredBadge || content.badge) && (
        <span
          style={{
            position: "absolute",
            top: -8,
            right: 12,
            background: "#2563eb",
            color: "#fff",
            fontSize: "0.65rem",
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 10,
          }}
        >
          {content.featuredBadge || content.badge}
        </span>
      )}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {featImg && (
          <img
            src={featImg}
            alt=""
            style={{ width: 70, height: 70, borderRadius: 8, objectFit: "cover" }}
          />
        )}
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: "0.82rem", fontWeight: 800, margin: "0 0 4px" }}>
            {content.productName || product?.name}
          </h4>
          <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
            <strong style={{ fontSize: "0.9rem", color: "#16a34a" }} className="tabular-nums">
              {formatMoney(Number(pPrice))}
            </strong>
            {pOldPrice > pPrice && (
              <del style={{ fontSize: "0.72rem", color: "#94a3b8" }} className="tabular-nums">
                {formatMoney(Number(pOldPrice))}
              </del>
            )}
          </div>
        </div>
      </div>
      {bullets.length > 0 && (
        <div style={{ marginTop: 8, borderTop: "1px dashed #cbd5e1", paddingTop: 6 }}>
          {bullets.map((b: string, idx: number) => (
            <div key={idx} style={{ fontSize: "0.68rem", color: "#334155", display: "flex", gap: 4, alignItems: "center", marginTop: 2 }}>
              <span style={{ color: "#10b981", fontWeight: 700 }}>✓</span>
              <span>{b}</span>
            </div>
          ))}
        </div>
      )}
      <a
        href="#checkout-form"
        style={{
          display: "block",
          marginTop: 10,
          padding: "8px",
          background: "#0f172a",
          color: "#ffffff",
          textAlign: "center",
          borderRadius: 8,
          fontSize: "0.78rem",
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        {content.ctaText || "اطلب الآن واستفد من العرض"}
      </a>
    </div>
  );
};

export const renderYouTubeVideoSection = (section: LandingSection) => {
  const { content, id } = section;
  const rawUrl = content.videoUrl || content.youtubeUrl || "";
  let ytId = content.videoId || "";
  if (!ytId && rawUrl) {
    const match = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    ytId = match ? match[1] : "";
  }

  return (
    <div
      key={id}
      className="eo-sync-yt-video"
      style={{ margin: "8px 0", borderRadius: 10, overflow: "hidden", background: "#000" }}
    >
      {content.title || content.heading ? (
        <div style={{ padding: "6px 10px", background: "#0f172a", color: "#fff", fontSize: "0.75rem", fontWeight: 700 }}>
          {content.title || content.heading}
        </div>
      ) : null}
      {ytId ? (
        <iframe
          src={`https://www.youtube.com/embed/${ytId}`}
          title="YouTube video"
          style={{ width: "100%", height: 160, border: "none", display: "block" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div style={{ height: 140, background: "#1e293b", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>
          فيديو يوتيوب (أدخل الرابط)
        </div>
      )}
    </div>
  );
};
