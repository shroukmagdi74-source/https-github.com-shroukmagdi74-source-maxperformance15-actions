import {
  AgencyClient,
  ClientInvoiceStatement,
  PRICING_MODEL_LABELS,
} from "./types";

export function calculateClientStatement(
  client: AgencyClient,
  selectedMonth: string,
  currency: string,
): ClientInvoiceStatement {
  const logs = Array.isArray(client.monthlyLogs) ? client.monthlyLogs : [];
  const currentLog = logs.find((l) => l.month === selectedMonth) || {
    month: selectedMonth,
    adSpend: client.currentSpend || 0,
    salesRevenue: client.monthlySales || 0,
    ordersCount: client.monthlyOrders || 0,
    unitsSold: client.monthlyUnits || 0,
    isPaid: false,
  };
  const spend = Number(currentLog.adSpend) || 0;
  const sales = Number(currentLog.salesRevenue) || 0;
  const orders = Number(currentLog.ordersCount) || 0;
  const units = Number(currentLog.unitsSold) || 0;
  const roas = spend > 0 ? Number((sales / spend).toFixed(2)) : 0;
  const cpa = orders > 0 ? Math.round(spend / orders) : 0;
  const aov = orders > 0 ? Math.round(sales / orders) : 0;

  let baseAgencyFee = 0;
  let explanation = "";
  const rate = Number(client.pricingRate) || 0;
  const retainer = Number(client.baseRetainer) || 0;
  const perOrder = Number(client.feePerOrder) || 0;
  const perItem = Number(client.feePerItem) || 0;

  switch (client.pricingModel) {
    case "PERCENT_SPEND":
      baseAgencyFee = Math.round(spend * (rate / 100));
      explanation = `${rate}% من إجمالي الإنفاق الإعلاني (${spend.toLocaleString()} ${currency})`;
      break;
    case "PERCENT_SALES":
      baseAgencyFee = Math.round(sales * (rate / 100));
      explanation = `${rate}% من إجمالي المبيعات المحققة (${sales.toLocaleString()} ${currency})`;
      break;
    case "FIXED_ORDER":
      baseAgencyFee = Math.round(orders * perOrder);
      explanation = `${orders} طلب × ${perOrder} ${currency} لكل طلب`;
      break;
    case "FIXED_ITEM":
      baseAgencyFee = Math.round(units * perItem);
      explanation = `${units} قطعة × ${perItem} ${currency} لكل قطعة`;
      break;
    case "HYBRID": {
      let comm = 0;
      if (client.hybridType === "PERCENT_SPEND") {
        comm = Math.round(spend * (rate / 100));
        explanation = `اشتراك ثابت (${retainer.toLocaleString()}) + ${rate}% من الإنفاق (${comm.toLocaleString()})`;
      } else if (client.hybridType === "PERCENT_SALES") {
        comm = Math.round(sales * (rate / 100));
        explanation = `اشتراك ثابت (${retainer.toLocaleString()}) + ${rate}% من المبيعات (${comm.toLocaleString()})`;
      } else {
        comm = Math.round(orders * perOrder);
        explanation = `اشتراك ثابت (${retainer.toLocaleString()}) + ${orders} طلب × ${perOrder} (${comm.toLocaleString()})`;
      }
      baseAgencyFee = retainer + comm;
      break;
    }
    case "RETAINER":
    default:
      baseAgencyFee = retainer;
      explanation = "اشتراك شهري ثابت";
      break;
  }

  const extraServices = (client.extraServices || []).filter(
    (s) => !s.month || s.month === selectedMonth,
  );
  const extraServicesSum = extraServices.reduce(
    (sum, s) => sum + (Number(s.amount) || 0),
    0,
  );

  return {
    clientId: client.id,
    clientName: client.name,
    contactPerson: client.contactPerson,
    phone: client.phone,
    email: client.email,
    pricingModel: client.pricingModel || "RETAINER",
    isOffPlatform: Boolean(client.isOffPlatform),
    month: selectedMonth,
    performance: {
      spend,
      sales,
      orders,
      units,
      roas,
      cpa,
      aov,
    },
    baseAgencyFee,
    calculationExplanation: explanation,
    extraServices,
    extraServicesSum,
    totalAmount: baseAgencyFee + extraServicesSum,
    isPaid: Boolean(currentLog.isPaid),
    paidAt: currentLog.paidAt || null,
  };
}

export function generateWhatsAppInvoiceMessage(
  stmt: ClientInvoiceStatement,
  currency: string,
): string {
  return [
    `*كشف حساب وأتعاب التسويق - شهر ${stmt.month}*`,
    `العميل: ${stmt.clientName}`,
    `نموذج التسعير: ${PRICING_MODEL_LABELS[stmt.pricingModel]?.label || stmt.pricingModel}`,
    "---------------------------------",
    "📊 *الأداء المحقق:*",
    `- إجمالي الإنفاق الإعلاني: ${stmt.performance.spend.toLocaleString()} ${currency}`,
    stmt.performance.sales > 0
      ? `- إجمالي المبيعات: ${stmt.performance.sales.toLocaleString()} ${currency}`
      : null,
    stmt.performance.orders > 0
      ? `- عدد الأوردرات: ${stmt.performance.orders.toLocaleString()} طلب`
      : null,
    "---------------------------------",
    "💰 *أتعاب الوكالة الأساسية:*",
    `${stmt.baseAgencyFee.toLocaleString()} ${currency} (${stmt.calculationExplanation})`,
    stmt.extraServices.length > 0 ? "---------------------------------" : null,
    stmt.extraServices.length > 0 ? "🛠️ *خدمات وبنود إضافية:*" : null,
    ...stmt.extraServices.map(
      (s) => `- ${s.title}: ${s.amount.toLocaleString()} ${currency}`,
    ),
    "---------------------------------",
    `💵 *إجمالي المستحق للفاتورة:* ${stmt.totalAmount.toLocaleString()} ${currency}`,
    `📌 *حالة السداد:* ${stmt.isPaid ? "تم السداد بنجاح" : "بانتظار التحصيل"}`,
    "---------------------------------",
    "مع تحيات فريق إدارة الوكالة.",
  ]
    .filter(Boolean)
    .join("\n");
}
