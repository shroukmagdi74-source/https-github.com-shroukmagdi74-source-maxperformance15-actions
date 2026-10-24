import React, { useState } from "react";
import { CreditCardIcon, WalletIcon } from "@heroicons/react/24/outline";
import { StorefrontSettings } from "../../../services/storefrontSettingsService";
import { StorePaymentGatewaySection } from "./StorePaymentGatewaySection";
import { StoreWalletPaymentSection } from "./StoreWalletPaymentSection";

const PAYMENT_SUB_TABS = [
  { id: "gateway", label: "بطاقات الدفع", icon: CreditCardIcon },
  { id: "wallet", label: "الدفع بالمحفظة", icon: WalletIcon },
] as const;

type PaymentSubTabId = (typeof PAYMENT_SUB_TABS)[number]["id"];

interface StorePaymentTabProps {
  settings: StorefrontSettings;
  onChange: (settings: Partial<StorefrontSettings>) => void;
  loading: boolean;
}

export const StorePaymentTab: React.FC<StorePaymentTabProps> = ({
  settings,
  onChange,
  loading,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<PaymentSubTabId>("gateway");

  return (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-1 rounded-2xl border border-gray-100 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
        {PAYMENT_SUB_TABS.map((tab) => {
          const isActive = activeSubTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/40"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className={activeSubTab === "gateway" ? "block" : "hidden"}>
        <StorePaymentGatewaySection
          settings={settings}
          onChange={onChange}
          loading={loading}
        />
      </div>
      <div className={activeSubTab === "wallet" ? "block" : "hidden"}>
        <StoreWalletPaymentSection
          settings={settings}
          onChange={onChange}
          loading={loading}
        />
      </div>
    </div>
  );
};
