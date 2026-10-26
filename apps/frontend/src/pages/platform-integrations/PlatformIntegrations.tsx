import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Table,
  ShoppingCart,
  Link2,
  ShoppingBag,
  Sparkles,
  Boxes,
  CheckCircle2,
  Clock
} from "lucide-react";

import EasyOrdersImport from "../products/EasyOrdersImport";
import WooCommerceSync from "../woocommerce/WooCommerceSync";
import InternalIntegrations from "./InternalIntegrations";
import GoogleSheetsIntegration from "./GoogleSheetsIntegration";

const PlatformIntegrations: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const hash = location.hash.replace("#", "");
    return hash || "easyorders";
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  const tabs = [
    {
      id: "easyorders",
      label: "EasyOrders",
      icon: FileText,
      description: t('platform.k_1', 'استيراد وإدارة الطلبات عبر ملفات EasyOrders'),
      component: EasyOrdersImport,
      available: true,
    },
    {
      id: "google-sheets",
      label: "Google Sheets",
      icon: Table,
      description: t('platform.k_2', 'مزامنة وتصدير جداول البيانات عبر Google Drive'),
      component: GoogleSheetsIntegration,
      available: true,
    },
    {
      id: "woocommerce",
      label: "WooCommerce",
      icon: ShoppingCart,
      description: t('platform.k_3', 'الربط المباشر مع متجر ووكومرس والمنتجات'),
      component: WooCommerceSync,
      available: true,
    },
    {
      id: "internal",
      label: t('platform.k_4', 'الربط الداخلي'),
      icon: Link2,
      description: t('platform.k_5', 'واجهات Webhooks والتكاملات البرمجية الخاصة'),
      component: InternalIntegrations,
      available: true,
    },
    {
      id: "shopify",
      label: "Shopify",
      icon: ShoppingBag,
      description: t('platform.k_6', 'الربط التلقائي مع متاجر شوبيفاي السحابية'),
      component: () => (
        <div className="p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto flex items-center justify-center">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-foreground">
              {t('platform.k_83', 'تكامل شوبيفاي الرسمي قيد التجهيز')}
            </h3>
            <p className="text-xs text-primary font-semibold">
              {t('platform.k_84', 'المزامنة الثنائية للطلبات والكتالوجات')}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('platform.k_85', 'سيتم إطلاق التكامل المباشر مع متجر تطبيقات Shopify قريباً لتمكين الربط التلقائي بنقرة واحدة.')}
            </p>
          </div>
        </div>
      ),
      available: false,
    },
  ];

  const handleTabChange = (tabId: string) => {
    if (tabs.find((t) => t.id === tabId)?.available) {
      setActiveTab(tabId);
      navigate(`#${tabId}`);
    }
  };

  const ActiveComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || tabs[0].component;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground">
                {t('platform.k_86', 'تكاملات المنصات الخارجية')}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('platform.k_87', 'ربط منصة MaxP بالمتاجر والأنظمة المحاسبية وجداول البيانات')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>نظام التكاملات السحابية نشط</span>
          </span>
        </div>
      </div>

      {/* Platform Navigation Tabs Bar */}
      <div className="bg-card border border-border/70 rounded-xl p-1.5 shadow-xs overflow-hidden">
        <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => tab.available && handleTabChange(tab.id)}
                disabled={!tab.available}
                className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : tab.available
                      ? "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      : "text-muted-foreground/40 cursor-not-allowed opacity-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                <span>{tab.label}</span>
                {!tab.available && (
                  <span className="text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded font-medium shrink-0">
                    {t('platform.k_89', 'قريباً')}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="w-full min-w-0">
        <ActiveComponent embedded={true} />
      </div>
    </div>
  );
};

export default PlatformIntegrations;
