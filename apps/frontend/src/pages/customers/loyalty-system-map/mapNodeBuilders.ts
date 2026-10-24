import {
  Users,
  Megaphone,
  Calendar,
  Gift,
  GitBranch,
  FolderTree,
  BadgeCheck,
  BarChart3,
  Settings2,
  Filter,
  ListChecks,
  Trophy,
  Bell,
  TrendingUp,
  Award,
  Coins,
} from "lucide-react";
import {
  NodeStatus,
  MapNode,
  NodeDetail,
  TimelineStage,
  ReEngagementLine,
  RoutingInfo,
} from "./types";
import { fmt, fmtDate, firstLine } from "./formatters";

export function buildMapNodes(data: any, filteredActivity: any): MapNode[] {
  if (!data) return [];
  const {
    programs = [],
    wallet = null,
    loyaltyConfig = null,
    flows = [],
    enabledFlows = [],
    birthdaySettings = null,
    leadCategories = [],
    customerLists = [],
    loyaltyRecordsTotal = 0,
    customerCounts = {},
  } = data;

  const campaigns = filteredActivity?.campaigns || [];
  const occasions = filteredActivity?.occasions || [];
  const journeys = filteredActivity?.journeys || [];

  const activeJourneys = journeys.filter(
    (j: any) => String(j.status || "").toUpperCase() === "ACTIVE",
  );

  const totalCustomers = programs.reduce(
    (s: number, p: any) => s + Number(p.customersCount || 0),
    0,
  );
  const totalIssued = programs.reduce(
    (s: number, p: any) => s + Number(p.totalPointsIssued || 0),
    0,
  );
  const totalRedeemed = programs.reduce(
    (s: number, p: any) => s + Number(p.totalPointsRedeemed || 0),
    0,
  );
  const totalCashback = Number(wallet?.totalCashback || 0);
  const redemptionRate =
    totalIssued > 0 ? Math.round((totalRedeemed / totalIssued) * 100) : 0;
  const activePrograms = programs.filter((p: any) => p.status === "ACTIVE");
  const customLists = (customerLists || []).filter((l: any) => !l.isDefault);

  const cfg = loyaltyConfig || {};
  const tiersEnabled = cfg?.tiers?.enabled === true;
  const autoDiscountEnabled = cfg?.autoDiscount?.enabled === true;
  const cashbackEnabled = cfg?.cashback?.enabled === true;

  const onOff = (v: boolean) => (v ? "مفعّلة" : "مقفولة");

  return [
    {
      id: "customers",
      label: "العملاء",
      route: "/customers",
      icon: Users,
      status: "active" as NodeStatus,
      summary: "سجل العملاء بكل حالاته",
      chips: [
        `محتمل ${fmt(customerCounts.LEAD)}`,
        `نشط ${fmt(customerCounts.ACTIVE)}`,
        `غير نشط ${fmt(customerCounts.INACTIVE)}`,
        `محظور ${fmt(customerCounts.BLOCKED)}`,
      ],
    },
    {
      id: "postPurchase",
      label: "سلاسل ما بعد الاستلام",
      route: "/whatsapp/customer-journey",
      icon: GitBranch,
      status:
        enabledFlows.length || activeJourneys.length
          ? ("active" as NodeStatus)
          : ("inactive" as NodeStatus),
      summary:
        enabledFlows.length || activeJourneys.length
          ? `${flows.length} سلسلة (${enabledFlows.length} مفعّلة) · ${activeJourneys.length} رحلة نشطة`
          : "لا توجد سلاسل مفعّلة",
    },
    {
      id: "loyaltyPrograms",
      label: "برامج الولاء",
      route: "/customers/loyalty-programs",
      icon: FolderTree,
      status: activePrograms.length ? ("active" as NodeStatus) : ("inactive" as NodeStatus),
      summary: activePrograms.length
        ? `${activePrograms.length} برنامج نشط · ${fmt(totalCustomers)} مشترك`
        : "لا توجد برامج نشطة",
    },
    {
      id: "loyaltyMembers",
      label: "أعضاء الولاء",
      route: "/customers/loyalty-members",
      icon: BadgeCheck,
      status:
        loyaltyRecordsTotal > 0 || totalCustomers > 0
          ? ("active" as NodeStatus)
          : ("inactive" as NodeStatus),
      summary: `${fmt(loyaltyRecordsTotal || totalCustomers)} عضو مسجّل في برامج الولاء`,
    },
    {
      id: "pointsCenter",
      label: "مركز نقاط العملاء",
      route: "/customers/points-center",
      icon: Trophy,
      status:
        activePrograms.length || totalIssued > 0
          ? ("active" as NodeStatus)
          : ("inactive" as NodeStatus),
      summary: `${fmt(totalIssued)} نقطة مصدرة · ${fmt(totalRedeemed)} مستبدلة`,
    },
    {
      id: "analytics",
      label: "تحليلات الولاء",
      route: "/customers/loyalty-analytics",
      icon: BarChart3,
      status: "warning" as NodeStatus,
      summary: `${fmt(totalCustomers)} مشترك · ${fmt(Math.round((totalIssued - totalRedeemed) / Math.max(1, totalCustomers)))} متوسط نقاط · استبدال ${fmt(redemptionRate)}% · كاش باك ${fmt(totalCashback)}`,
    },
    {
      id: "settings",
      label: "إعدادات",
      route: "/customers/settings",
      icon: Settings2,
      status: "active" as NodeStatus,
      summary: `مستويات: ${onOff(tiersEnabled)} · خصم تلقائي: ${onOff(autoDiscountEnabled)} · كاش باك: ${onOff(cashbackEnabled)}`,
    },
    {
      id: "segmentation",
      label: "مركز التقسيم",
      route: "/customers/segments",
      icon: Filter,
      status: leadCategories.length ? ("active" as NodeStatus) : ("inactive" as NodeStatus),
      summary: leadCategories.length
        ? `${leadCategories.length} تصنيف شرائح`
        : "لا توجد تصنيفات شرائح",
    },
    {
      id: "customerLists",
      label: "قوائم العملاء",
      route: "/customers/lists",
      icon: ListChecks,
      status: customLists.length ? ("active" as NodeStatus) : ("inactive" as NodeStatus),
      summary: customLists.length
        ? `${customLists.length} قائمة مخصصة`
        : "لا توجد قوائم مخصصة",
    },
    {
      id: "whatsappNotify",
      label: "إشعارات واتساب",
      route: "/customers/whatsapp-notify",
      icon: Megaphone,
      status: "active" as NodeStatus,
      summary: campaigns.length
        ? `${campaigns.length} حملة سابقة`
        : "أداة إرسال جماعي للعملاء",
    },
    {
      id: "occasions",
      label: "مناسبات العملاء",
      route: "/customers/occasions-notify",
      icon: Calendar,
      status: occasions.length ? ("active" as NodeStatus) : ("inactive" as NodeStatus),
      summary: occasions.length
        ? `${occasions.length} مناسبة (${occasions.filter((o: any) => String(o.status || "").toUpperCase() === "SCHEDULED").length} مجدولة · ${occasions.filter((o: any) => String(o.status || "").toUpperCase() === "SENT").length} مرسلة)`
        : "لا توجد مناسبات بعد",
    },
    {
      id: "birthdays",
      label: "عيد ميلاد العملاء",
      route: "/customers/birthday-whatsapp-notify",
      icon: Gift,
      status: birthdaySettings?.isEnabled === true
        ? ("active" as NodeStatus)
        : ("inactive" as NodeStatus),
      summary:
        birthdaySettings?.isEnabled === true
          ? `أتمتة يومياً ${birthdaySettings.dailySendTime || "12:00"}`
          : "أتمتة عيد الميلاد مقفولة",
    },
    {
      id: "customerNotifications",
      label: "إشعارات العملاء",
      route: "/customers/customer-notifications",
      icon: Bell,
      status: "active" as NodeStatus,
      summary: "قوالب إشعارات مخصصة للعملاء",
    },
  ];
}

export function buildNodeDetails(data: any): Record<string, NodeDetail> {
  if (!data) return {};
  const programs = data.programs || [];
  const journeys = data.journeys || [];
  const campaigns = data.campaigns || [];
  const occasions = data.occasions || [];
  const customerLists = data.customerLists || [];
  const leadCategories = data.leadCategories || [];
  const cc = data.customerCounts || {};
  const totalCustomers = programs.reduce((s: number, p: any) => s + Number(p.customersCount || 0), 0);
  const activePrograms = programs.filter((p: any) => p.status === "ACTIVE");
  const customLists = (customerLists || []).filter((l: any) => !l.isDefault);

  const latestOf = (arr: any[], key: string): string | null => {
    const withDate = arr
      .map((x) => x?.[key])
      .filter((x) => x)
      .sort((a: any, b: any) => new Date(b).getTime() - new Date(a).getTime());
    return withDate[0] || null;
  };

  return {
    customers: {
      route: "/customers",
      count: `${fmt(cc.ACTIVE || 0)} نشط`,
      lastActivity: cc.LEAD ? `${fmt(cc.LEAD)} محتمل · ${fmt(cc.INACTIVE || 0)} غير نشط` : "غير محدد",
    },
    postPurchase: {
      route: "/whatsapp/customer-journey",
      count: `${journeys.length} رحلة`,
      lastActivity: fmtDate(latestOf(journeys, "nextSendAt")) || "غير محدد",
    },
    loyaltyPrograms: {
      route: "/customers/loyalty-programs",
      count: `${activePrograms.length} برنامج نشط`,
      lastActivity:
        programs.length && programs[programs.length - 1]?.createdAt
          ? fmtDate(programs[programs.length - 1].createdAt)
          : "غير محدد",
    },
    loyaltyMembers: {
      route: "/customers/loyalty-members",
      count: `${fmt(totalCustomers)} عضو`,
      lastActivity: "غير محدد",
    },
    pointsCenter: {
      route: "/customers/points-center",
      count: `${fmt(programs.reduce((s: number, p: any) => s + Number(p.totalPointsIssued || 0), 0))} نقطة مصدرة`,
      lastActivity: "غير محدد",
    },
    analytics: {
      route: "/customers/loyalty-analytics",
      count: `${fmt(totalCustomers)} مشترك`,
      lastActivity: "إجماليات تراكمية",
    },
    settings: {
      route: "/customers/settings",
      count: "تكوين النظام",
      lastActivity: "غير محدد",
    },
    segmentation: {
      route: "/customers/segments",
      count: `${leadCategories.length} تصنيف`,
      lastActivity: "غير محدد",
    },
    customerLists: {
      route: "/customers/lists",
      count: `${customLists.length} قائمة`,
      lastActivity:
        customLists.length && customLists[0]?.updatedAt
          ? fmtDate(customLists[0].updatedAt)
          : "غير محدد",
    },
    whatsappNotify: {
      route: "/customers/whatsapp-notify",
      count: `${campaigns.length} حملة`,
      lastActivity: fmtDate(latestOf(campaigns, "sentAt") || latestOf(campaigns, "createdAt")) || "غير محدد",
    },
    occasions: {
      route: "/customers/occasions-notify",
      count: `${occasions.length} مناسبة`,
      lastActivity:
        fmtDate(latestOf(occasions, "lastSentAt")) ||
        fmtDate(occasions.length ? occasions[0].scheduledAt : null) ||
        "غير محدد",
    },
    birthdays: {
      route: "/customers/birthday-whatsapp-notify",
      count: "أتمتة يومية",
      lastActivity:
        data.birthdaySettings?.updatedAt
          ? fmtDate(data.birthdaySettings.updatedAt)
          : "غير محدد",
    },
    customerNotifications: {
      route: "/customers/customer-notifications",
      count: "قوالب إشعارات",
      lastActivity: "غير محدد",
    },
  };
}

export function buildTimelineStages(data: any): TimelineStage[] {
  if (!data) return [];
  const programs = data.programs || [];
  const campaigns = data.campaigns || [];
  const occasions = data.occasions || [];
  const journeys = data.journeys || [];
  const upcoming = data.upcomingBirthdays || [];
  const totalIssued = programs.reduce((s: number, p: any) => s + Number(p.totalPointsIssued || 0), 0);
  const totalRedeemed = programs.reduce((s: number, p: any) => s + Number(p.totalPointsRedeemed || 0), 0);
  const totalCashback = Number(data.wallet?.totalCashback || 0);
  const oldestProgram = programs[programs.length - 1];
  const latestActivity = [
    ...campaigns.map((c: any) => c.sentAt || c.createdAt),
    ...occasions.map((o: any) => o.lastSentAt || o.scheduledAt),
    ...journeys.map((j: any) => j.lastSentAt || j.nextSendAt),
  ]
    .filter(Boolean)
    .sort((a: any, b: any) => new Date(b).getTime() - new Date(a).getTime())[0];

  return [
    {
      id: "entry",
      label: "الاشتراك والطلب",
      icon: Users,
      dateLabel: "أقدم عميل",
      date: fmtDate(data.oldestCustomerDate) || null,
      note: data.oldestCustomerDate
        ? `أحدث عميل: ${fmtDate(data.newestCustomerDate) || "غير محدد"}`
        : "لا توجد بيانات تاريخية للعملاء",
      events: [
        { label: "أقدم عميل", date: fmtDate(data.oldestCustomerDate) },
        { label: "أحدث عميل", date: fmtDate(data.newestCustomerDate) },
      ],
    },
    {
      id: "collect",
      label: "جمع النقاط والولاء",
      icon: Coins,
      dateLabel: "أول برنامج ولاء",
      date: oldestProgram?.createdAt ? fmtDate(oldestProgram.createdAt) : null,
      note: oldestProgram?.createdAt ? undefined : "لا توجد برامج ولاء بعد",
      events: [
        { label: "أول برنامج ولاء", date: oldestProgram?.createdAt ? fmtDate(oldestProgram.createdAt) : undefined },
        { label: `${fmt(totalIssued)} نقطة مصدرة` },
        { label: `${fmt(totalRedeemed)} نقطة مستبدلة` },
      ],
    },
    {
      id: "redeem",
      label: "الاستبدال والكاش باك",
      icon: Award,
      dateLabel: "آخر استبدال",
      date: null,
      note: "لا يوجد سجل استبدال بتواريخ في الداتا المتاحة",
      events: [
        { label: `إجمالي الكاش باك ${fmt(totalCashback)} ج.م` },
        { label: "لا يوجد سجل استبدال بتاريخ" },
      ],
    },
    {
      id: "reengage",
      label: "إعادة الاستهداف",
      icon: TrendingUp,
      dateLabel: "آخر نشاط إعادة استهداف",
      date: fmtDate(latestActivity) || null,
      note: latestActivity ? undefined : "لا توجد أنشطة إعادة استهداف مسجلة",
      events: [
        ...campaigns.slice(0, 5).map((c: any) => ({
          label: c.name || "حملة",
          date: fmtDate(c.sentAt || c.createdAt),
        })),
        ...occasions.slice(0, 3).map((o: any) => ({
          label: `مناسبة: ${o.name || ""}`,
          date: fmtDate(o.scheduledAt),
        })),
        ...upcoming.slice(0, 3).map((b: any) => ({
          label: `عيد ميلاد: ${b.name || ""}`,
          date: b.formattedNextDate,
        })),
      ],
    },
  ];
}

export function buildReEngagementLines({
  data,
  routing,
  birthdaySource,
}: {
  data: any;
  routing: RoutingInfo;
  birthdaySource: RoutingInfo;
}): ReEngagementLine[] {
  if (!data) return [];
  const {
    occasions = [],
    birthdaySettings = null,
    enabledFlows = [],
    firstEnabledFlowSteps = [],
    programs = [],
    journeys = [],
    reSettings = null,
    counts = {},
  } = data;

  const loops = reSettings?.loops || {};
  const nextOccasion = occasions[0] || null;
  const defaultRoute = routing;
  const activeJourneys = journeys.filter(
    (j: any) => String(j.status || "").toUpperCase() === "ACTIVE",
  );
  const hasSentOccasion = occasions.some(
    (o: any) => String(o.status || "").toUpperCase() === "SENT",
  );
  const hasScheduledOccasion = occasions.some(
    (o: any) => String(o.status || "").toUpperCase() === "SCHEDULED",
  );

  const firstStep = firstEnabledFlowSteps.find(
    (s: any) => s && typeof s.content === "string" && s.content.trim(),
  );

  const it = counts.inactiveTrend;
  const pt = counts.pointsTrend;
  const inactiveTrend = it
    ? {
        up: it.last7d > it.prev7d,
        text: `اتسكتوا آخر 7 أيام: ${fmt(it.last7d)} (قبلها: ${fmt(it.prev7d)})`,
        goodWhenUp: false,
      }
    : undefined;
  const pointsTrend = pt
    ? {
        up: pt.last30d > pt.prev30d,
        text: `كسبوا نقاط آخر 30 يوم: ${fmt(pt.last30d)} (قبلها: ${fmt(pt.prev30d)})`,
        goodWhenUp: true,
      }
    : undefined;

  return [
    {
      id: "occasion",
      trigger: "العميل ليه مناسبة قريبة (حسب تقويم المناسبات)",
      tool: "مناسبات العملاء",
      route: "/customers/occasions-notify",
      message: nextOccasion?.message
        ? firstLine(nextOccasion.message)
        : "لا يوجد قالب محفوظ للمناسبات",
      source: defaultRoute,
      status: hasSentOccasion
        ? ("sent" as const)
        : hasScheduledOccasion || occasions.length
          ? ("scheduled" as const)
          : ("inactive" as const),
      count: counts.occasion ?? null,
      enabled: loops.occasion === true,
      settingsKey: "occasion" as const,
    },
    {
      id: "birthday",
      trigger: "قرب عيد ميلاد العميل (أتمتة يومية)",
      tool: "عيد ميلاد العملاء",
      route: "/customers/birthday-whatsapp-notify",
      message: birthdaySettings?.messageTemplate
        ? firstLine(birthdaySettings.messageTemplate)
        : "لا يوجد قالب محفوظ لعيد الميلاد",
      source: birthdaySource,
      status: birthdaySettings?.isEnabled === true
        ? ("scheduled" as const)
        : ("inactive" as const),
      count: counts.birthday ?? null,
      enabled: birthdaySettings?.isEnabled === true,
    },
    {
      id: "postPurchase",
      trigger: "عدّى فترة من غير شراء (العميل سكت)",
      tool: "سلاسل ما بعد الاستلام",
      route: "/whatsapp/customer-journey",
      message: firstStep
        ? firstLine(firstStep.content)
        : enabledFlows.length
          ? "لا يوجد محتوى مسجّل في خطوات السلسلة"
          : "لا توجد سلاسل مفعّلة",
      source: defaultRoute,
      status: enabledFlows.length || activeJourneys.length
        ? ("scheduled" as const)
        : ("inactive" as const),
      count: counts.inactive ?? null,
      enabled: loops.inactive === true,
      settingsKey: "inactive" as const,
      trend: inactiveTrend,
    },
    {
      id: "points",
      trigger: "العميل عنده نقاط تكفّي مكافأة",
      tool: "برامج الولاء / مركز نقاط العملاء",
      route: "/customers/points-center",
      message:
        "رسالة المكافأة تُدار من قوالب برامج الولاء وإشعارات العملاء",
      source: defaultRoute,
      status: programs.some((p: any) => p.status === "ACTIVE")
        ? ("scheduled" as const)
        : ("inactive" as const),
      count: counts.points ?? null,
      enabled: loops.points === true,
      settingsKey: "points" as const,
      trend: pointsTrend,
    },
  ];
}
