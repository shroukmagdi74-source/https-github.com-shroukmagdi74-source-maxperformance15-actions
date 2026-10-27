import {
  Activity as ChartBarIcon,
  Circle as UserGroupIcon,
  DollarSign as CurrencyDollarIcon,
  Eye as EyeIcon,
  PieChart as ChartPieIcon,
  ShoppingBag as ShoppingCartIcon,
} from "lucide-react";
import { ReportData, SummaryCardItem, TopProductItem } from "./types";

export const safeNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "string") {
    const parsed = parseFloat(value.replace("%", ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

export const sumBy = (items: any[], key: string): number =>
  items.reduce((sum, item) => sum + safeNumber(item?.[key]), 0);

export const averageBy = (items: any[], key: string): number => {
  if (!items.length) return 0;
  const total = sumBy(items, key);
  return total / items.length;
};

export const extractMetric = (data: any, keys: string[]): number | null => {
  if (!data) return null;
  const normalizedKeys = keys.map((key) => key.toLowerCase());
  if (Array.isArray(data)) {
    for (const item of data) {
      const name = String(
        item?.metric ?? item?.name ?? item?.key ?? item?.title ?? "",
      ).toLowerCase();
      if (normalizedKeys.some((key) => name.includes(key))) {
        const value =
          item?.value ??
          item?.count ??
          item?.total ??
          item?.rate ??
          item?.percentage;
        return safeNumber(value);
      }
    }
    return null;
  }

  if (typeof data === "object") {
    for (const key of keys) {
      if (data[key] !== undefined && data[key] !== null) {
        return safeNumber(data[key]);
      }
    }
  }
  return null;
};

export function calculateDerivedMetrics(
  reports: ReportData[],
  formatPrice: (price: number) => string,
  isTodayRange: boolean,
  funnelData: any,
): { summaryCards: SummaryCardItem[]; topProducts: TopProductItem[] } {
  if (!reports.length) return { summaryCards: [], topProducts: [] };

  const salesReport = reports.find((report) => report.type === "sales");
  const customersReport = reports.find((report) => report.type === "customers");
  const productsReport = reports.find((report) => report.type === "products");
  const performanceReport = reports.find(
    (report) => report.type === "performance",
  );

  const salesRows = Array.isArray(salesReport?.data) ? salesReport.data : [];
  const customersRows = Array.isArray(customersReport?.data)
    ? customersReport.data
    : [];
  const productsRows = Array.isArray(productsReport?.data)
    ? productsReport.data
    : [];
  const performanceData = performanceReport?.data;

  const totalSales = sumBy(salesRows, "sales");
  const totalOrders = sumBy(salesRows, "orders");

  const totalNewCustomers = sumBy(customersRows, "newCustomers");
  const totalConversions = sumBy(customersRows, "conversions");
  const avgRate = averageBy(customersRows, "rate");

  const conversionRateFromPerf = extractMetric(performanceData, [
    "conversion",
    "conversion_rate",
    "conversionRate",
    "cr",
  ]);

  const funnelSteps = Array.isArray(funnelData?.funnelSteps)
    ? funnelData.funnelSteps
    : [];
  const visitsFromFunnel = funnelSteps.find((step: any) => {
    const name = String(step?.step || "").toLowerCase();
    return (
      name.includes("زيارة") ||
      name.includes("زيارات") ||
      name.includes("visit")
    );
  });
  const visitsMetric = visitsFromFunnel
    ? safeNumber(visitsFromFunnel.count)
    : null;

  const conversionRateFromFunnel =
    funnelData?.overallConversionRate !== undefined &&
    funnelData?.overallConversionRate !== null
      ? safeNumber(funnelData.overallConversionRate)
      : null;

  const conversionRate =
    conversionRateFromFunnel ??
    conversionRateFromPerf ??
    (totalNewCustomers > 0
      ? (totalConversions / totalNewCustomers) * 100
      : avgRate);

  const visitMetric =
    visitsMetric ??
    extractMetric(performanceData, [
      "visit",
      "session",
      "traffic",
      "pageview",
      "views",
    ]);

  const itemKeys = [
    "itemsSold",
    "items",
    "itemsCount",
    "items_count",
    "quantity",
    "qty",
    "pieces",
    "units",
  ];
  const hasItemsData = salesRows.some((row) =>
    itemKeys.some((key) => row?.[key] !== undefined && row?.[key] !== null),
  );
  const totalItemsFromSales = hasItemsData
    ? salesRows.reduce((sum, row) => {
        const valueKey = itemKeys.find(
          (key) => row?.[key] !== undefined && row?.[key] !== null,
        );
        return sum + safeNumber(valueKey ? row[valueKey] : 0);
      }, 0)
    : null;

  const totalItemsFromProducts = productsRows.length
    ? productsRows.reduce((sum, row) => {
        const valueKey = itemKeys.find(
          (key) => row?.[key] !== undefined && row?.[key] !== null,
        );
        if (valueKey) return sum + safeNumber(row[valueKey]);
        if (row?.sales !== undefined && row?.sales !== null) {
          return sum + safeNumber(row.sales);
        }
        return sum;
      }, 0)
    : null;

  const totalItemsSold =
    totalItemsFromSales !== null
      ? totalItemsFromSales
      : totalItemsFromProducts;

  const topProducts: TopProductItem[] = Array.isArray(productsRows)
    ? productsRows
        .map((row) => {
          const name =
            row?.name ?? row?.product ?? row?.title ?? row?.sku ?? null;
          if (!name) return null;
          const quantityKeys = [
            "quantity",
            "qty",
            "itemsSold",
            "items",
            "count",
            "orders",
            "units",
          ];
          const revenueKeys = ["revenue", "salesValue", "amount", "total"];

          const quantityKey = quantityKeys.find(
            (key) => row?.[key] !== undefined && row?.[key] !== null,
          );
          const revenueKey = revenueKeys.find(
            (key) => row?.[key] !== undefined && row?.[key] !== null,
          );

          let value = 0;
          let label = "—";
          let sortValue = 0;

          if (quantityKey) {
            value = safeNumber(row[quantityKey]);
            sortValue = value;
            label = `${value.toLocaleString()} قطعة`;
          } else if (
            row?.sales !== undefined &&
            row?.sales !== null &&
            !revenueKey
          ) {
            value = safeNumber(row.sales);
            sortValue = value;
            label = `${value.toLocaleString()} قطعة`;
          } else if (revenueKey) {
            value = safeNumber(row[revenueKey]);
            sortValue = value;
            label = formatPrice(value);
          } else if (row?.sales !== undefined && row?.sales !== null) {
            value = safeNumber(row.sales);
            sortValue = value;
            label = formatPrice(value);
          }

          return { name, label, sortValue };
        })
        .filter((item): item is TopProductItem => Boolean(item))
        .sort((a, b) => b.sortValue - a.sortValue)
        .slice(0, 3)
    : [];

  const summaryCards: SummaryCardItem[] = [
    {
      id: "total-sales",
      title: "إجمالي المبيعات",
      value: formatPrice(totalSales),
      icon: CurrencyDollarIcon,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      id: "total-orders",
      title: "إجمالي الطلبات",
      value: totalOrders.toLocaleString(),
      icon: ShoppingCartIcon,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    },
    {
      id: "items-sold",
      title: "القطع المباعة",
      value:
        totalItemsSold !== null
          ? totalItemsSold.toLocaleString()
          : isTodayRange
            ? "0"
            : "غير متاح",
      icon: ChartPieIcon,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
    },
    {
      id: "store-visits",
      title: "زيارات المتجر",
      value:
        visitMetric !== null
          ? Number(visitMetric).toLocaleString()
          : "غير متاح",
      icon: EyeIcon,
      color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20",
    },
    {
      id: "conversion-rate",
      title: "نسبة التحويل",
      value:
        conversionRate !== null && Number.isFinite(conversionRate)
          ? `${Math.round(conversionRate)}%`
          : "غير متاح",
      icon: ChartBarIcon,
      color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
    },
    {
      id: "new-customers",
      title: "عملاء جدد",
      value: totalNewCustomers.toLocaleString(),
      icon: UserGroupIcon,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  return { summaryCards, topProducts };
}
