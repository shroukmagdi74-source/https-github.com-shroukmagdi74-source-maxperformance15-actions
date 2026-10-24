import React from "react";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import {
  SUPPORTED_CURRENCIES,
  formatCurrency,
  getCurrencyByCode,
} from "../../../utils/currency";

interface CompanyCurrencySectionProps {
  selectedCurrency: string;
  savingCurrency: boolean;
  handleCurrencyChange: (code: string) => void;
}

export const CompanyCurrencySection: React.FC<CompanyCurrencySectionProps> = ({
  selectedCurrency,
  savingCurrency,
  handleCurrencyChange,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <CurrencyDollarIcon className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
        إعدادات العملة
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="company-currency"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            العملة الافتراضية للموقع
          </label>
          <select
            id="company-currency"
            name="currency"
            autoComplete="off"
            value={selectedCurrency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            disabled={savingCurrency}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {SUPPORTED_CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.nameAr} ({currency.symbol}) - {currency.code}
              </option>
            ))}
          </select>
          {savingCurrency && (
            <div className="mt-2 text-sm text-blue-600 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              جاري حفظ التغييرات...
            </div>
          )}
        </div>
        <div>
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            معاينة العملة
          </span>
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-3">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              مثال على عرض السعر:
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white font-mono tabular-nums">
              {formatCurrency(1250, selectedCurrency)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              العملة المختارة: {getCurrencyByCode(selectedCurrency)?.nameAr}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
