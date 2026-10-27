import React from "react";
import { LandingSection, ProductLandingProduct } from "../../types";
import { formatMoney } from "../../types";
import { BundleTier } from "../types";

interface MockFormSectionProps {
  section: LandingSection;
  product: ProductLandingProduct | null;
  formConfig: {
    orderKicker: string;
    orderTitle: string;
    orderCopy: string;
    buttonLabel: string;
  };
  bundleTiers: BundleTier[];
  selectedBundleQty: number;
  setSelectedBundleQty: (qty: number) => void;
  bundleTotal: number;
  priceNum: number;
  mockColors: string[];
  mockSizes: string[];
}

export const MockFormSection: React.FC<MockFormSectionProps> = ({
  section,
  product,
  formConfig,
  bundleTiers,
  selectedBundleQty,
  setSelectedBundleQty,
  bundleTotal,
  priceNum,
  mockColors,
  mockSizes,
}) => {
  const { content, id } = section;

  return (
    <div key={id} className="eo-sync-form-container">
      <div className="eo-sync-form-head">
        <span className="eo-sync-kicker-badge">
          {content.orderKicker || formConfig.orderKicker || "نموذج الطلب"}
        </span>
        <h5>{content.orderTitle || formConfig.orderTitle || `اطلب ${product?.name || "المنتج"}`}</h5>
        <p>{content.orderCopy || formConfig.orderCopy}</p>
      </div>

      {/* Bundle Tiers Selection */}
      <div className="eo-sync-bundles-box">
        <label>اختر الكمية والعرض:</label>
        <div className="eo-sync-bundles-list">
          {bundleTiers.map((tier) => {
            const isSelected = selectedBundleQty === tier.qty;
            const tierUnit =
              tier.discount > 0
                ? Math.round(priceNum * (1 - tier.discount / 100))
                : priceNum;
            const tierTot = tierUnit * tier.qty;

            return (
              <div
                key={tier.qty}
                className={`eo-sync-bundle-pill ${isSelected ? "is-selected" : ""}`}
                onClick={() => setSelectedBundleQty(tier.qty)}
              >
                {tier.badge && (
                  <span className="eo-sync-bundle-tag">{tier.badge}</span>
                )}
                <div className="eo-sync-bundle-left">
                  <strong>{tier.label}</strong>
                  {tier.qty > 1 && <small>وفر {tier.discount}%</small>}
                </div>
                <div className="eo-sync-bundle-right">
                  <strong className="tabular-nums">{formatMoney(tierTot)}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mock Variant Selectors */}
      {selectedBundleQty > 1 ? (
        <div className="eo-sync-bundle-customizer-mock">
          <span className="eo-sync-customizer-mock-title">
            تحديد المواصفات لكل قطعة ({selectedBundleQty} قطع):
          </span>
          {Array.from({ length: selectedBundleQty }).map((_, idx) => (
            <div key={idx} className="eo-sync-customizer-mock-item">
              <span className="eo-sync-customizer-mock-tag">القطعة {idx + 1}</span>
              {mockColors.length > 0 && (
                <div className="eo-sync-mock-chips-row">
                  <span className="eo-sync-mock-label">اللون:</span>
                  {mockColors.map((c, cIdx) => (
                    <span
                      key={c}
                      className={`eo-sync-mock-chip eo-sync-mock-chip-radio ${cIdx === (idx % mockColors.length) ? "is-selected" : ""}`}
                    >
                      <span style={{ fontSize: 9 }}>{cIdx === (idx % mockColors.length) ? "●" : "○"}</span> {c}
                    </span>
                  ))}
                </div>
              )}
              {mockSizes.length > 0 && (
                <div className="eo-sync-mock-chips-row">
                  <span className="eo-sync-mock-label">المقاس:</span>
                  {mockSizes.map((s, sIdx) => (
                    <span
                      key={s}
                      className={`eo-sync-mock-chip eo-sync-mock-chip-size ${sIdx === 0 ? "is-selected" : ""}`}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="eo-sync-variants-mock">
          {mockColors.length > 0 && (
            <div className="eo-sync-mock-variant-field">
              <span className="eo-sync-mock-label">اللون:</span>
              <div className="eo-sync-mock-chips-row">
                {mockColors.map((c, i) => (
                  <span
                    key={c}
                    className={`eo-sync-mock-chip eo-sync-mock-chip-radio ${i === 0 ? "is-selected" : ""}`}
                  >
                    <span style={{ fontSize: 9 }}>{i === 0 ? "●" : "○"}</span> {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {mockSizes.length > 0 && (
            <div className="eo-sync-mock-variant-field">
              <span className="eo-sync-mock-label">المقاس:</span>
              <div className="eo-sync-mock-chips-row">
                {mockSizes.map((s, i) => (
                  <span
                    key={s}
                    className={`eo-sync-mock-chip eo-sync-mock-chip-size ${i === 0 ? "is-selected" : ""}`}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mock Customer Info & Address in one contiguous block */}
      <div className="eo-sync-inputs-group">
        <div className="eo-sync-mock-field">اكتب اسمك بالكامل...</div>
        <div className="eo-sync-mock-field">01xxxxxxxxx</div>
        <div className="eo-sync-mock-field">المحافظة: اختار...</div>
        <div className="eo-sync-mock-field">مثال: مدينة نصر...</div>
        <div className="eo-sync-mock-field">الشارع، العمارة، الدور...</div>

        <div className="eo-sync-submit-btn">
          {content.buttonLabel || formConfig.buttonLabel || "تأكيد الطلب الآن 🚚"}
          <span className="eo-sync-submit-price tabular-nums">({formatMoney(bundleTotal)})</span>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="eo-sync-trust-row">
        <div className="eo-sync-trust-badge-item">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>معاينة قبل الدفع</span>
        </div>
        <div className="eo-sync-trust-badge-item">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          <span>دفع عند الاستلام</span>
        </div>
        <div className="eo-sync-trust-badge-item">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          <span>استبدال 14 يوم</span>
        </div>
      </div>
    </div>
  );
};
