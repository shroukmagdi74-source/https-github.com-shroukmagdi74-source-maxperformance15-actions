import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, MessageCircle } from "lucide-react";
import { WHATSAPP_CONSULT_URL, BUNDLE_PRICE, csbFmt } from "./csbData";

interface Props {
  onSubscribe: () => void;
  bundlePrice?: number;
}

export const CsbNavbar: React.FC<Props> = ({ onSubscribe, bundlePrice = BUNDLE_PRICE }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <nav className="csb-nav">
      <div className="csb-nav-inner">
        <Link to="/" className="csb-brand" aria-label="MaxP — الصفحة الرئيسية">
          {!imgError ? (
            <img
              src="/logo.png"
              alt="MaxP Logo"
              className="csb-brand-logo"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="csb-brand-mark" aria-hidden="true">
              M
            </span>
          )}
          <span>
            <strong>MaxP</strong>
            <small>منظومة التجارة المتكاملة</small>
          </span>
        </Link>

        <div className="csb-nav-links">
          <a href="#invoice">الفاتورة</a>
          <a href="#journey">رحلة الأوردر</a>
          <a href="#families">الأدوات</a>
          <a href="#calculator">احسب توفيرك</a>
          <a href="#faq">أسئلة شائعة</a>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a
            href={WHATSAPP_CONSULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="csb-btn csb-btn-ghost csb-btn-sm"
            style={{ display: "inline-flex", gap: 5, alignItems: "center" }}
            title="تواصل واتساب: 01123087745"
          >
            <MessageCircle size={14} strokeWidth={2.2} style={{ color: "#25D366" }} />
            <span>واتساب</span>
          </a>
          <Link to="/auth/login?redirect=/lp/store-complete-bundle" className="csb-btn csb-btn-ghost csb-btn-sm">
            دخول
          </Link>
          <button type="button" className="csb-btn csb-btn-primary csb-btn-sm" onClick={onSubscribe}>
            <CreditCard size={13} strokeWidth={2.2} />
            اشترك — {csbFmt(bundlePrice)}/شهر
          </button>
        </div>
      </div>
    </nav>
  );
};
