import React from "react";
import LineChart from "../../../components/charts/LineChart";
import BarChart from "../../../components/charts/BarChart";

interface CampaignChartsSectionProps {
  funnelData: Array<{ name: string; value: number; color: string }>;
  dailyProjectionData: Array<{
    day: string;
    daily: number;
    cumulative: number;
    breakEven: number;
  }>;
}

export const CampaignChartsSection: React.FC<CampaignChartsSectionProps> = ({
  funnelData,
  dailyProjectionData,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          قمع التحويل المتوقع
        </h3>
        <div className="h-80">
          <BarChart
            data={funnelData}
            xKey="name"
            bars={[{ key: "value", name: "العدد", color: "#3b82f6" }]}
            height={300}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          توقع الإيرادات اليومية
        </h3>
        <div className="h-80">
          <LineChart
            data={dailyProjectionData}
            xKey="day"
            lines={[
              {
                key: "cumulative",
                name: "الإيرادات التراكمية",
                color: "#10b981",
              },
              {
                key: "breakEven",
                name: "نقطة التعادل",
                color: "#ef4444",
              },
            ]}
            height={300}
          />
        </div>
      </div>
    </div>
  );
};
