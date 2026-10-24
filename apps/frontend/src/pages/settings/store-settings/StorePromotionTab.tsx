import React from "react";
import PromotionSettings from "../PromotionSettings";

export const StorePromotionTab: React.FC = () => {
  return (
    <div className="bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
      <PromotionSettings />
    </div>
  );
};
