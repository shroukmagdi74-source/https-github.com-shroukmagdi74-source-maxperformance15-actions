import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
import tokenManager from "../../utils/tokenManager";
import {
  trackPlatformSiteInitiateCheckout,
  trackPlatformSiteLead,
} from "../../utils/platformSiteMetaPixel";

import { CsbNavbar } from "./complete-store/CsbNavbar";
import { CsbHero } from "./complete-store/CsbHero";
import { CsbStats } from "./complete-store/CsbStats";
import { CsbVideo } from "./complete-store/CsbVideo";
import { CsbJourney } from "./complete-store/CsbJourney";
import { CsbFamilies } from "./complete-store/CsbFamilies";
import { CsbCalculator } from "./complete-store/CsbCalculator";
import { CsbCompare } from "./complete-store/CsbCompare";
import { CsbLead } from "./complete-store/CsbLead";
import { CsbFaq } from "./complete-store/CsbFaq";
import { CsbFooter } from "./complete-store/CsbFooter";

import {
  BUNDLE_SLUG,
  LANDING_SLUG,
  UTM_KEYS,
  WHATSAPP_CONSULT_URL,
  csbFmt,
} from "./complete-store/csbData";
import { useRevealOnScroll } from "./complete-store/csbHooks";
import { useBundlePricing } from "./complete-store/useBundlePricing";
import "./complete-store/csb.css";

export const CompleteStoreBundleLanding: React.FC = () => {
  const navigate = useNavigate();
  const pricing = useBundlePricing();
  const [utm, setUtm] = useState<Record<string, string>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [spend, setSpend] = useState<number>(pricing.individualTotal);
  const [userEditedSpend, setUserEditedSpend] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  useRevealOnScroll(rootRef);

  // تحديث إنفاق الحاسبة تلقائياً إذا تغير إجمالي الكتالوج ولم يقم المستخدم بالتعديل اليدوي
  useEffect(() => {
    if (!userEditedSpend) {
      setSpend(pricing.individualTotal);
    }
  }, [pricing.individualTotal, userEditedSpend]);

  const handleSpendChange = useCallback((v: number) => {
    setUserEditedSpend(true);
    setSpend(v);
  }, []);

  // ── SEO tags + UTM first-touch ──
  useEffect(() => {
    const TITLE = "باقة المتجر الكاملة — متجرك كله في نظام واحد بـ999 ج.م/شهر | MaxP";
    const DESC =
      "المتجر + واتساب الأوردرات + الشحن الذكي + المخزون + المرتجعات + تحليلات الأرباح وإسناد الحملات — اشتراك واحد بـ999 ج.م/شهر، تفعيل فوري وإلغاء في أي وقت.";
    document.title = TITLE;

    const metaChanges: Array<{ el: HTMLMetaElement; prev: string | null }> = [];
    const setMeta = (attr: "name" | "property", key: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      const prev = el ? el.content : null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.content = content;
      metaChanges.push({ el, prev });
    };

    setMeta("property", "og:title", TITLE);
    setMeta("property", "og:description", DESC);
    setMeta("name", "twitter:title", TITLE);
    setMeta("name", "twitter:description", DESC);

    const robotsMeta = document.createElement("meta");
    robotsMeta.name = "robots";
    robotsMeta.content = "index, follow";
    document.head.appendChild(robotsMeta);

    try {
      const q = new URLSearchParams(window.location.search);
      const parsed: Record<string, string> = {};
      UTM_KEYS.forEach((k) => {
        const v = q.get(k);
        if (v) parsed[k] = v;
      });
      if (Object.keys(parsed).length > 0) {
        sessionStorage.setItem("csb_utm", JSON.stringify(parsed));
        setUtm(parsed);
      } else {
        const stored = sessionStorage.getItem("csb_utm");
        if (stored) setUtm(JSON.parse(stored));
      }
      if (sessionStorage.getItem("csb_activated") === "1") sessionStorage.removeItem("csb_activated");
    } catch {
      // ignore
    }

    return () => {
      metaChanges.forEach(({ el, prev }) => {
        if (prev === null) {
          el.parentNode?.removeChild(el);
        } else {
          el.content = prev;
        }
      });
      if (robotsMeta.parentNode) robotsMeta.parentNode.removeChild(robotsMeta);
    };
  }, []);

  const buildRegisterQuery = useCallback(
    (extra: Record<string, string> = {}) => {
      const parts: string[] = [`landingBundle=${BUNDLE_SLUG}`];
      Object.entries(extra).forEach(([k, v]) => {
        if (v) parts.push(`${k}=${encodeURIComponent(v)}`);
      });
      UTM_KEYS.forEach((k) => {
        if (utm[k]) parts.push(`${k}=${encodeURIComponent(utm[k])}`);
      });
      parts.push(`redirect=${encodeURIComponent(`/lp/${LANDING_SLUG}`)}`);
      return parts.join("&");
    },
    [utm]
  );

  /**
   * الاشتراك — دفع مباشر من غير تجربة:
   * مسجل؟ → بوابه الاشتراك على طول.
   * مش مسجل؟ → تسجيل سريع ورجوع للاندنج يكمّل الدفع.
   */
  const handleSubscribe = useCallback(async () => {
    try {
      trackPlatformSiteInitiateCheckout("csb_subscribe_cta", {
        content_name: "store-complete-bundle",
        value: pricing.bundlePrice,
        currency: "EGP",
        num_items: 17,
        bundle: BUNDLE_SLUG,
      });
      trackPlatformSiteLead("csb_subscribe_cta", {
        bundle: BUNDLE_SLUG,
        value: pricing.bundlePrice,
        currency: "EGP",
      });
    } catch {
      // ignore tracking errors
    }
    const token = tokenManager.getAccessToken
      ? tokenManager.getAccessToken()
      : tokenManager.getToken?.();

    if (!token) {
      navigate(
        `/auth/register?${buildRegisterQuery({ source: LANDING_SLUG, action: "paid" })}`
      );
      return;
    }

    if (isCheckingOut) return;
    setIsCheckingOut(true);
    try {
      const redirectSuccessUrl = `${window.location.origin}/subscription?status=success&bundle=${BUNDLE_SLUG}`;
      const res = await fetch(`/api/v1/marketplace/bundles/${BUNDLE_SLUG}/checkout`, {
        method: "POST",
        headers: tokenManager.createAuthHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
        body: JSON.stringify({ utm, redirectUrl: redirectSuccessUrl }),
      });
      const data = await res.json();
      if (data?.success && data?.sessionUrl) {
        window.location.href = data.sessionUrl;
        return;
      }
      alert(data?.message || "تعذر بدء الدفع، حاول مرة أخرى.");
    } catch {
      alert("تعذر الاتصال ببوابة الدفع، حاول مرة أخرى.");
    } finally {
      setIsCheckingOut(false);
    }
  }, [navigate, buildRegisterQuery, utm, isCheckingOut, pricing.bundlePrice]);

  const annualSaving = Math.max(0, Math.round(spend) - pricing.bundlePrice) * 12;

  return (
    <div className="csb-root" dir="rtl" ref={rootRef}>
      <CsbNavbar onSubscribe={handleSubscribe} bundlePrice={pricing.bundlePrice} />

      <main>
        <CsbHero
          onSubscribe={handleSubscribe}
          isCheckingOut={isCheckingOut}
          pricing={pricing}
        />
        <CsbStats />
        <CsbVideo />
        <CsbJourney />
        <CsbFamilies pricing={pricing} />
        <CsbCalculator
          spend={spend}
          onSpendChange={handleSpendChange}
          bundlePrice={pricing.bundlePrice}
          individualTotal={pricing.individualTotal}
        />
        <CsbCompare />
        <CsbLead utm={utm} />
        <CsbFaq />
        <CsbFooter onSubscribe={handleSubscribe} annualSaving={annualSaving} />
      </main>

      {/* الشريط اللاصق موبايل */}
      <div className="csb-sticky-mobile">
        <div className="csb-sticky-meta">
          <b>
            {csbFmt(pricing.bundlePrice)} ج.م/شهر — 17 أداة
          </b>
          تفعيل فوري · إلغاء في أي وقت
        </div>
        <div className="csb-sticky-actions">
          <a
            href={WHATSAPP_CONSULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="استشارة واتساب"
            className="csb-sticky-whatsapp"
            title="تواصل واتساب: 01123087745"
          >
            <MessageCircle size={20} strokeWidth={2.3} />
          </a>
          <button
            type="button"
            onClick={handleSubscribe}
            className="csb-btn csb-btn-primary csb-sticky-cta"
          >
            اشترك الآن
            <ArrowLeft size={15} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteStoreBundleLanding;
