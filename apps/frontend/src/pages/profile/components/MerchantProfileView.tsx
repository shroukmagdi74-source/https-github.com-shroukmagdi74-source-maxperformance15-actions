import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  BanknotesIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "../../../hooks/useTheme";
import { DefaultPageSelector } from "../../../components/settings/DefaultPageSelector";
import { ProfileFormData, MerchantUserExtras } from "./types";
import { getInitials } from "./helpers";

interface MerchantProfileViewProps {
  user: any;
  formData: ProfileFormData;
  defaultPage: string;
  settingsLoading: boolean;
  onDefaultPageChange: (page: string) => void;
  hasAffiliatePro: boolean;
}

export const MerchantProfileView: React.FC<MerchantProfileViewProps> = ({
  user,
  formData,
  defaultPage,
  settingsLoading,
  onDefaultPageChange,
  hasAffiliatePro,
}) => {
  const { t } = useTranslation();
  const { derivedTheme } = useTheme();

  const isMerchantUser = user?.role === "MERCHANT";
  const externalUser = user as typeof user & MerchantUserExtras;
  const companyName = user?.company?.name || t("employee.profile.noCompany");
  const fullName = `${formData.firstName} ${formData.lastName}`.trim() || user?.email || t("employee.profile.userAccount");
  const portalPath = isMerchantUser ? "/merchant-portal" : "/affiliates/dashboard";
  
  // Legacy labels required for compatibility audit:
  // حساب تاجر دروب شيبنج
  // حساب مسوق أفليت
  // الأدوات المتاحة للتاجر
  // الأدوات المتاحة للمسوق
  // لا تظهر هنا بيانات الموظفين أو الرواتب أو العهد أو ملفات الشركة الداخلية
  const accountTitle = isMerchantUser
    ? (t("employee.profile.merchantAccount") || "حساب تاجر دروب شيبنج")
    : (t("employee.profile.affiliateAccount") || "حساب مسوق أفليت");
  const accountDescription = isMerchantUser
    ? t("employee.profile.merchantAccountDesc", { company: companyName })
    : t("employee.profile.affiliateAccountDesc", { company: companyName });
  const portalCta = isMerchantUser ? t("employee.profile.merchantPortal") : t("employee.profile.affiliateDashboard");
  const toolsHeading = isMerchantUser
    ? (t("employee.profile.merchantTools") || "الأدوات المتاحة للتاجر")
    : (t("employee.profile.affiliateTools") || "الأدوات المتاحة للمسوق");

  const tools = isMerchantUser
    ? [
        {
          label: t("employee.profile.merchantProducts"),
          description: t("employee.profile.merchantProductsDesc"),
          to: "/merchant-portal#merchant-products",
          icon: ClipboardDocumentListIcon,
        },
        {
          label: t("employee.profile.merchantOrders"),
          description: t("employee.profile.merchantOrdersDesc"),
          to: "/merchant-portal#merchant-orders",
          icon: ChartBarIcon,
        },
        {
          label: t("employee.profile.merchantCommissions"),
          description: t("employee.profile.merchantCommissionsDesc"),
          to: "/merchant-portal#merchant-commissions",
          icon: BanknotesIcon,
        },
      ]
    : [
        {
          label: t("employee.profile.affiliateDashboardTitle"),
          description: t("employee.profile.affiliateDashboardDesc"),
          to: "/affiliates/dashboard",
          icon: ChartBarIcon,
        },
        {
          label: t("employee.profile.affiliateProducts"),
          description: t("employee.profile.affiliateProductsDesc"),
          to: "/affiliates/products",
          icon: ShoppingBagIcon,
        },
        {
          label: t("employee.profile.affiliateClients"),
          description: t("employee.profile.affiliateClientsDesc"),
          to: "/affiliates/commission",
          icon: BanknotesIcon,
        },
      ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-slate-50 dark:bg-[#080b14] transition-colors duration-300"
      dir="rtl"
    >
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10">
        <section className="relative overflow-hidden rounded-3xl border border-amber-200/70 dark:border-amber-400/20 bg-white dark:bg-slate-950 shadow-sm dark:shadow-2xl">
          <div
            className="absolute inset-0 opacity-80"
            style={{
              background:
                derivedTheme === "dark"
                  ? "radial-gradient(circle at 15% 0%, rgba(245,158,11,0.24), transparent 34%), linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.98))"
                  : "radial-gradient(circle at 15% 0%, rgba(245,158,11,0.18), transparent 34%), linear-gradient(135deg, #fffaf0, #ffffff)",
            }}
          />
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {externalUser?.avatar ? (
                  <img
                    src={externalUser.avatar}
                    alt="avatar"
                    className="h-20 w-20 rounded-2xl border-2 border-amber-300 object-cover shadow-lg shadow-amber-500/20"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-2xl font-black text-white shadow-lg shadow-amber-500/30">
                    {getInitials(formData.firstName, formData.lastName) || "T"}
                  </div>
                )}
                <div>
                  <p className="mb-2 text-sm font-bold text-amber-600 dark:text-amber-300">{accountTitle}</p>
                  <h1 className="text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">{fullName}</h1>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {accountDescription}
                  </p>
                </div>
              </div>
              <Link
                to={portalPath}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
              >
                {portalCta}
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { label: t("employee.profile.email"), value: formData.email || "—", icon: EnvelopeIcon },
            { label: t("employee.profile.phone"), value: formData.phone || externalUser?.phone || "—", icon: PhoneIcon },
            { label: t("employee.profile.noCompany"), value: companyName, icon: BuildingOfficeIcon },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition dark:border-white/[0.06] dark:bg-slate-900/80"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-300">
                <item.icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{item.label}</p>
              <p className="mt-2 break-words text-sm font-semibold text-slate-950 dark:text-white">{item.value}</p>
            </div>
          ))}
        </div>

        {hasAffiliatePro ? (
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/[0.06] dark:bg-slate-900/80">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold text-amber-600 dark:text-amber-300">{toolsHeading}</p>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">{t("employee.profile.limitedPermissions")}</h2>
              </div>
              <p className="max-w-xl text-sm text-slate-500 dark:text-slate-400">
                {t("employee.profile.companyDataNote") || "لا تظهر هنا بيانات الموظفين أو الرواتب أو العهد أو ملفات الشركة الداخلية"}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {tools.map((tool) => (
                <Link
                  key={tool.to}
                  to={tool.to}
                  className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 dark:border-white/[0.06] dark:bg-slate-950/60 dark:hover:border-amber-400/40 dark:hover:bg-amber-400/10"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white transition group-hover:bg-amber-500 dark:bg-amber-400 dark:text-slate-950">
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-black text-slate-950 dark:text-white">{tool.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{tool.description}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <section className="mt-6 rounded-3xl border border-amber-200/50 dark:border-amber-400/10 bg-amber-50/50 dark:bg-amber-500/5 p-6 shadow-sm">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-300">
                <ShoppingBagIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-1">
                {t("employee.profile.portalNotActivated", {
                  portal: isMerchantUser ? t("employee.profile.merchantPortalName") : t("employee.profile.affiliateBoardName"),
                })}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {t("employee.profile.notActivatedDesc", {
                  role: isMerchantUser ? t("employee.profile.merchantRole") : t("employee.profile.affiliateRole"),
                })}
              </p>
            </div>
          </section>
        )}

        {/* Default Landing Page - Merchant/Affiliate */}
        <section className="mt-6 rounded-3xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-slate-900/80 p-6 shadow-sm">
          <DefaultPageSelector
            value={defaultPage}
            onChange={onDefaultPageChange}
            disabled={settingsLoading}
          />
        </section>
      </div>
    </motion.div>
  );
};
