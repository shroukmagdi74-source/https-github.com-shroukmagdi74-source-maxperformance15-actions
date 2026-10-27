import React from "react";
import { ShoppingBag } from "lucide-react";
import { LandingSection, ProductLandingProduct } from "../../types";

interface MockMediaSectionProps {
  section: LandingSection;
  product: ProductLandingProduct | null;
  prodImg?: string;
  activeMockImageIndex: number;
  setActiveMockImageIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const MockMediaSection: React.FC<MockMediaSectionProps> = ({
  section,
  product,
  prodImg,
  activeMockImageIndex,
  setActiveMockImageIndex,
}) => {
  const { content, id } = section;
  const images =
    content.images && content.images.length > 0
      ? content.images
      : Array.isArray(product?.images) && product!.images.length > 0
        ? product!.images
        : prodImg
          ? [prodImg]
          : [];
  const currentMockImg = images[activeMockImageIndex] || images[0];

  const handleMockPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    setActiveMockImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleMockNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    setActiveMockImageIndex((prev) => (prev + 1) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    (e.currentTarget as any)._startX = e.touches[0]?.clientX ?? 0;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const startX = (e.currentTarget as any)._startX;
    const endX = e.changedTouches[0]?.clientX;
    if (typeof startX === "number" && typeof endX === "number") {
      const diff = startX - endX;
      if (Math.abs(diff) > 35) {
        if (diff > 0) handleMockNext();
        else handleMockPrev();
      }
    }
  };

  return (
    <div key={id} className="eo-sync-pure-media" style={{ padding: "8px 0" }}>
      <div
        className="eo-sync-hero-media"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: "relative",
          borderRadius: 12,
          overflow: "hidden",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          userSelect: "none",
          touchAction: "pan-y",
        }}
      >
        {currentMockImg ? (
          <img
            src={currentMockImg}
            alt=""
            className="eo-sync-hero-img"
            style={{
              width: "100%",
              maxHeight: 380,
              objectFit: "contain",
              display: "block",
              borderRadius: 12,
              pointerEvents: "none",
            }}
          />
        ) : (
          <div className="eo-sync-placeholder">
            <ShoppingBag size={40} />
            <span>لا توجد صورة</span>
          </div>
        )}

        {images.length > 1 && (
          <>
            <div
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                background: "rgba(15, 23, 42, 0.65)",
                color: "#ffffff",
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: 9999,
                zIndex: 4,
                direction: "ltr",
              }}
            >
              {activeMockImageIndex + 1} / {images.length}
            </div>
            <button
              type="button"
              onClick={handleMockPrev}
              style={{
                position: "absolute",
                top: "50%",
                right: 6,
                transform: "translateY(-50%)",
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.9)",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow: "0 1px 4px rgba(0, 0, 0, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 5,
              }}
              aria-label="الصورة السابقة"
            >
              ›
            </button>
            <button
              type="button"
              onClick={handleMockNext}
              style={{
                position: "absolute",
                top: "50%",
                left: 6,
                transform: "translateY(-50%)",
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.9)",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow: "0 1px 4px rgba(0, 0, 0, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 5,
              }}
              aria-label="الصورة التالية"
            >
              ‹
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div
          className="eo-sync-thumbs-strip"
          style={{
            marginTop: 10,
            display: "flex",
            gap: 6,
            justifyContent: "center",
            overflowX: "auto",
            padding: "2px",
          }}
        >
          {images.slice(0, 6).map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              onClick={() => setActiveMockImageIndex(i)}
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                objectFit: "cover",
                cursor: "pointer",
                border: i === activeMockImageIndex ? "2px solid #0f172a" : "1px solid #e2e8f0",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
