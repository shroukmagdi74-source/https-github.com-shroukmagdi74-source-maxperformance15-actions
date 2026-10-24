import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../services/apiClient";
import { toast } from "sonner";
import {
  Users,
  TrendingUp,
  Award,
  Coins,
} from "lucide-react";
import {
  MapNode,
  DrawnEdge,
  RoutingInfo,
  ReEngagementLine,
  CustomerRow,
  CustomerListState,
  DateRangeKey,
  TimelineStage,
  NodeDetail,
  EDGES,
} from "./types";
import { fmt, resolveRouting } from "./formatters";
import { exportLoyaltyCsv, exportLoyaltySvg } from "./mapExportHelpers";
import {
  buildMapNodes,
  buildNodeDetails,
  buildTimelineStages,
  buildReEngagementLines,
} from "./mapNodeBuilders";

export function useLoyaltySystemMapController() {
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [edges, setEdges] = useState<DrawnEdge[]>([]);

  const [pendingToggle, setPendingToggle] = useState<ReEngagementLine | null>(null);
  const [savingToggle, setSavingToggle] = useState(false);
  const [thresholdDraft, setThresholdDraft] = useState<number>(30);
  const [customerList, setCustomerList] = useState<CustomerListState | null>(null);
  const [backfillConfirm, setBackfillConfirm] = useState(false);
  const [backfillBusy, setBackfillBusy] = useState(false);
  const [channelDialog, setChannelDialog] = useState(false);
  const [channelDraft, setChannelDraft] = useState<string>("");
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeKey>("all");
  const [timelineLog, setTimelineLog] = useState<TimelineStage | null>(null);
  const [svgBusy, setSvgBusy] = useState(false);

  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const [
        programsRes,
        walletRes,
        sysRes,
        cfgRes,
        sessionsRes,
        flowsRes,
        journeysRes,
        birthdayRes,
        occasionsRes,
        campaignsRes,
        catsRes,
        listsRes,
        recordsRes,
      ] = await Promise.allSettled([
        apiClient.get("/hr/customer-loyalty/programs"),
        apiClient.get("/wallet/stats"),
        apiClient.get("/hr/customer-loyalty/system-analytics"),
        apiClient.get("/hr/customer-loyalty/loyalty-config"),
        apiClient.get("/whatsapp/sessions"),
        apiClient.get("/whatsapp/automation/flows"),
        apiClient.get("/whatsapp-automation/journeys"),
        apiClient.get("/customers/whatsapp-notify/birthday-automation/settings"),
        apiClient.get("/customers/whatsapp-notify/occasions"),
        apiClient.get("/customers/whatsapp-notify/campaigns/history?limit=10"),
        apiClient.get("/whatsapp/lead-categories"),
        apiClient.get("/broadcast/customer-lists"),
        apiClient.get("/hr/customer-loyalty/customers?pageSize=1"),
      ]);

      const get = (r: PromiseSettledResult<any>) =>
        r.status === "fulfilled" ? (r.value as any) : null;

      const programs = get(programsRes)?.data?.data || [];
      const wallet = get(walletRes)?.data?.data || null;
      const systemAnalytics = get(sysRes)?.data?.data || null;
      const loyaltyConfig = get(cfgRes)?.data?.data || null;
      const sessions = get(sessionsRes)?.data?.sessions || [];
      const flows = get(flowsRes)?.data?.data || [];
      const journeys = get(journeysRes)?.data?.data || [];
      const birthdaySettings = get(birthdayRes)?.data?.data || null;
      const occasions = get(occasionsRes)?.data?.data || [];
      const campaigns = get(campaignsRes)?.data?.campaigns || [];
      const leadCategories = get(catsRes)?.data?.data || [];
      const allLists = get(listsRes)?.data?.data || [];
      const recordsData = get(recordsRes)?.data?.data || {};
      const loyaltyRecordsTotal =
        recordsData.total || (Array.isArray(recordsData) ? recordsData.length : 0);

      const customerCounts: Record<string, number> = {};
      const [leadRes, activeRes, inactiveRes, blockedRes] = await Promise.allSettled([
        apiClient.get("/customers?limit=1&status=LEAD"),
        apiClient.get("/customers?limit=1&status=ACTIVE"),
        apiClient.get("/customers?limit=1&status=INACTIVE"),
        apiClient.get("/customers?limit=1&status=BLOCKED"),
      ]);
      const setCount = (r: PromiseSettledResult<any>, key: string) => {
        if (r.status === "fulfilled") {
          customerCounts[key] = Number((r.value as any)?.data?.pagination?.total || 0);
        } else {
          customerCounts[key] = 0;
        }
      };
      setCount(leadRes, "LEAD");
      setCount(activeRes, "ACTIVE");
      setCount(inactiveRes, "INACTIVE");
      setCount(blockedRes, "BLOCKED");

      const enabledFlows = flows.filter((f: any) => f.isEnabled === true);
      let firstEnabledFlowSteps: any[] = [];
      if (enabledFlows[0]) {
        const stepsRes = await apiClient
          .get(`/whatsapp/automation/flows/${enabledFlows[0].id}/steps`)
          .catch(() => ({ data: { data: [] } }));
        firstEnabledFlowSteps = (stepsRes as any)?.data?.data || [];
      }

      const reSettingsRes = await apiClient
        .get("/hr/customer-loyalty/re-engagement/settings")
        .catch(() => ({ data: { data: null } }));
      const reSettings = (reSettingsRes as any)?.data?.data || {
        inactiveDays: 30,
        loops: { occasion: false, inactive: false, points: false },
      };
      const inactiveDays = Number(reSettings.inactiveDays || 30);

      const [countsRes, birthdayCountRes, oldestCustRes, newestCustRes] = await Promise.allSettled([
        apiClient.get(
          `/hr/customer-loyalty/re-engagement/counts?inactiveDays=${inactiveDays}`,
        ),
        apiClient.get("/customers/whatsapp-notify/birthday-automation/upcoming?days=30"),
        apiClient.get("/customers?limit=1&sortBy=createdAt&sortOrder=asc"),
        apiClient.get("/customers?limit=1&sortBy=createdAt&sortOrder=desc"),
      ]);
      const counts = {
        inactive:
          countsRes.status === "fulfilled"
            ? (countsRes.value as any)?.data?.data?.inactive ?? null
            : null,
        points:
          countsRes.status === "fulfilled"
            ? (countsRes.value as any)?.data?.data?.points ?? null
            : null,
        occasion:
          countsRes.status === "fulfilled"
            ? (countsRes.value as any)?.data?.data?.occasion ?? null
            : null,
        birthday:
          birthdayCountRes.status === "fulfilled"
            ? (birthdayCountRes.value as any)?.data?.total ?? null
            : null,
        inactiveTrend:
          countsRes.status === "fulfilled"
            ? (countsRes.value as any)?.data?.data?.inactiveTrend ?? null
            : null,
        pointsTrend:
          countsRes.status === "fulfilled"
            ? (countsRes.value as any)?.data?.data?.pointsTrend ?? null
            : null,
      };
      const upcomingBirthdays =
        birthdayCountRes.status === "fulfilled"
          ? (birthdayCountRes.value as any)?.data?.data || []
          : [];
      const oldestCustomerDate =
        oldestCustRes.status === "fulfilled"
          ? (oldestCustRes.value as any)?.data?.data?.[0]?.createdAt ?? null
          : null;
      const newestCustomerDate =
        newestCustRes.status === "fulfilled"
          ? (newestCustRes.value as any)?.data?.data?.[0]?.createdAt ?? null
          : null;

      setData({
        programs,
        wallet,
        systemAnalytics,
        loyaltyConfig,
        sessions,
        flows,
        enabledFlows,
        firstEnabledFlowSteps,
        journeys,
        birthdaySettings,
        occasions,
        campaigns,
        leadCategories,
        customerLists: allLists,
        loyaltyRecordsTotal,
        customerCounts,
        reSettings,
        counts,
        upcomingBirthdays,
        oldestCustomerDate,
        newestCustomerDate,
      });
      setThresholdDraft(Number(reSettings.inactiveDays || 30));
      setLastUpdated(new Date().toLocaleString("ar-EG"));
    } catch (error) {
      console.error("Error loading loyalty system map:", error);
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const inRange = useCallback(
    (v?: string | null): boolean => {
      if (!v) return false;
      if (dateRange === "all") return true;
      const d = new Date(v).getTime();
      if (Number.isNaN(d)) return false;
      const now = Date.now();
      const days = dateRange === "today" ? 1 : dateRange === "7d" ? 7 : 30;
      return d >= now - days * 86400000;
    },
    [dateRange],
  );

  const filteredActivity = useMemo(() => {
    if (!data) return null;
    const d = data as any;
    const campaigns = (d.campaigns || []).filter((c: any) => inRange(c.createdAt));
    const occasions = (d.occasions || []).filter((o: any) => inRange(o.scheduledAt));
    const journeys = (d.journeys || []).filter((j: any) => inRange(j.createdAt));
    return { campaigns, occasions, journeys };
  }, [data, inRange]);

  const hasTemporalData = useMemo(() => {
    if (!data) return false;
    const d = data as any;
    return Boolean(
      (d.campaigns || []).length ||
        (d.occasions || []).length ||
        (d.journeys || []).length ||
        (d.programs || []).length ||
        d.oldestCustomerDate ||
        (d.upcomingBirthdays || []).length,
    );
  }, [data]);

  const nodes = useMemo<MapNode[]>(
    () => buildMapNodes(data, filteredActivity),
    [data, filteredActivity],
  );

  const nodeById = useMemo(() => {
    const m: Record<string, MapNode> = {};
    nodes.forEach((n) => {
      m[n.id] = n;
    });
    return m;
  }, [nodes]);

  const nodeDetails = useMemo<Record<string, NodeDetail>>(
    () => buildNodeDetails(data),
    [data],
  );

  const timelineStages = useMemo<TimelineStage[]>(
    () => buildTimelineStages(data),
    [data],
  );

  const measureEdges = useCallback(() => {
    const container = mapRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const drawn: DrawnEdge[] = [];
    for (const def of EDGES) {
      const a = nodeRefs.current[def.from];
      const b = nodeRefs.current[def.to];
      if (!a || !b) continue;
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      const x1 = ar.left + ar.width / 2 - rect.left;
      const y1 = ar.top + ar.height / 2 - rect.top;
      const x2 = br.left + br.width / 2 - rect.left;
      const y2 = br.top + br.height / 2 - rect.top;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.max(1, Math.hypot(dx, dy));
      const ux = dx / len;
      const uy = dy / len;
      const trim = 30;
      const tx = x2 - ux * trim;
      const ty = y2 - uy * trim;
      const c1x = x1 + dx * 0.35;
      const c2x = x2 - dx * 0.35;
      const color = def.loop ? "#f59e0b" : "#94a3b8";
      const marker = def.loop
        ? "url(#loyalty-map-arrow-amber)"
        : "url(#loyalty-map-arrow-slate)";
      drawn.push({
        id: `${def.from}--${def.to}`,
        d: `M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${tx} ${ty}`,
        color,
        marker,
        label: def.label,
        lx: (x1 + tx) / 2,
        ly: (y1 + ty) / 2,
        loop: def.loop,
      });
    }
    setEdges(drawn);
  }, []);

  useLayoutEffect(() => {
    measureEdges();
    const container = mapRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => measureEdges());
    ro.observe(container);
    window.addEventListener("resize", measureEdges);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureEdges);
    };
  }, [measureEdges]);

  useEffect(() => {
    const t = window.setTimeout(() => measureEdges(), 0);
    return () => window.clearTimeout(t);
  }, [nodes, measureEdges]);

  const routing = useMemo<RoutingInfo>(
    () => resolveRouting((data as any)?.["sessions"] || []),
    [data],
  );

  const birthdaySource = useMemo<RoutingInfo>(() => {
    const channel = (data as any)?.birthdaySettings?.channel;
    if (channel === "meta_api") {
      return { key: "meta", label: "Meta Cloud API", desc: "قناة عيد الميلاد" };
    }
    if (channel === "whatsapp_session") {
      return {
        key: "wa",
        label: "واتساب عادي (Baileys)",
        desc: "قناة عيد الميلاد",
      };
    }
    return routing;
  }, [data, routing]);

  const reEngagementLines = useMemo<ReEngagementLine[]>(
    () => buildReEngagementLines({ data, routing, birthdaySource }),
    [data, routing, birthdaySource],
  );

  const saveLoopToggle = useCallback(
    async (id: string, enabled: boolean) => {
      setSavingToggle(true);
      try {
        if (id === "birthday") {
          const bd = (data as any)?.birthdaySettings || {};
          await apiClient.post("/customers/whatsapp-notify/birthday-automation/settings", {
            isEnabled: enabled,
            dailySendTime: bd.dailySendTime || "12:00",
            channel: bd.channel || "whatsapp_session",
            messageTemplate: bd.messageTemplate || "",
            couponCode: bd.couponCode || "",
            metaTemplateName: bd.metaTemplateName || "birthday_greeting_v1",
          });
        } else {
          const line = reEngagementLines.find((l) => l.id === id);
          if (!line?.settingsKey) return;
          await apiClient.put("/hr/customer-loyalty/re-engagement/settings", {
            loops: { [line.settingsKey]: enabled },
          });
        }
        toast.success(enabled ? "تم تفعيل الحلقة بنجاح" : "تم إيقاف الحلقة");
        setPendingToggle(null);
        await load();
      } catch (e) {
        console.error("Error toggling loop:", e);
        toast.error("فشل حفظ الإعدادات");
      } finally {
        setSavingToggle(false);
      }
    },
    [data, reEngagementLines, load],
  );

  const handleToggle = (line: ReEngagementLine) => {
    if (line.enabled) {
      void saveLoopToggle(line.id, false);
    } else {
      setPendingToggle(line);
    }
  };

  const saveThreshold = useCallback(async () => {
    const days = Math.max(1, Math.min(365, thresholdDraft || 30));
    try {
      await apiClient.put("/hr/customer-loyalty/re-engagement/settings", {
        inactiveDays: days,
      });
      toast.success(`تم حفظ حد السكوت: ${days} يوم`);
      await load();
    } catch (e) {
      console.error("Error saving threshold:", e);
      toast.error("فشل حفظ حد السكوت");
    }
  }, [thresholdDraft, load]);

  const viewCustomers = useCallback(async (id: string) => {
    if (id === "occasion") {
      navigate("/customers/occasions-notify");
      return;
    }
    const titles: Record<string, string> = {
      birthday: "عملاء عيد الميلاد القادم (30 يوم)",
      postPurchase: `عملاء ساكتين (${(data as any)?.reSettings?.inactiveDays || 30} يوم بلا شراء)`,
      points: "أعضاء ولاء برصيد نقاط",
    };
    setCustomerList({ id, title: titles[id] || "العملاء", loading: true, rows: [] });
    try {
      let rows: CustomerRow[] = [];
      if (id === "birthday") {
        const res = await apiClient.get("/customers/whatsapp-notify/birthday-automation/upcoming?days=30");
        rows = ((res.data as any)?.data || []).map((c: any) => ({
          name: c.name || "—",
          phone: c.phone || "",
          extra: c.formattedNextDate || "",
        }));
      } else if (id === "postPurchase") {
        const days = (data as any)?.reSettings?.inactiveDays || 30;
        const res = await apiClient.get(
          `/hr/customer-loyalty/re-engagement/customers?type=inactive&inactiveDays=${days}&limit=50`,
        );
        rows = ((res.data as any)?.data || []).map((c: any) => ({
          name: c.name || "—",
          phone: c.phone || "",
          extra: c.extra || "",
        }));
      } else if (id === "points") {
        const res = await apiClient.get(
          "/hr/customer-loyalty/re-engagement/customers?type=points&limit=50",
        );
        rows = ((res.data as any)?.data || []).map((c: any) => ({
          name: c.name || "—",
          phone: c.phone || "",
          extra: c.extra || "",
        }));
      }
      setCustomerList({ id, title: titles[id] || "العملاء", loading: false, rows });
    } catch (e) {
      console.error("Error loading customers:", e);
      setCustomerList((prev) => (prev ? { ...prev, loading: false, rows: [] } : prev));
      toast.error("فشل جلب العملاء");
    }
  }, [navigate, data]);

  const runBackfill = useCallback(async () => {
    setBackfillBusy(true);
    try {
      const res = await apiClient.post("/hr/customer-loyalty/vouchers/backfill");
      toast.success((res.data as any)?.message || "تم إصدار الكوبونات الناقصة");
      setBackfillConfirm(false);
      await load();
    } catch (e) {
      console.error("Error backfilling vouchers:", e);
      toast.error("فشل إصدار الكوبونات");
    } finally {
      setBackfillBusy(false);
    }
  }, [load]);

  const openChannelDialog = () => {
    setChannelDraft((data as any)?.birthdaySettings?.channel || "whatsapp_session");
    setChannelDialog(true);
  };

  const saveChannel = useCallback(async () => {
    const bd = (data as any)?.birthdaySettings || {};
    try {
      await apiClient.post("/customers/whatsapp-notify/birthday-automation/settings", {
        isEnabled: bd.isEnabled !== false,
        dailySendTime: bd.dailySendTime || "12:00",
        channel: channelDraft,
        messageTemplate: bd.messageTemplate || "",
        couponCode: bd.couponCode || "",
        metaTemplateName: bd.metaTemplateName || "birthday_greeting_v1",
      });
      toast.success("تم تحديث قناة عيد الميلاد");
      setChannelDialog(false);
      await load();
    } catch (e) {
      console.error("Error saving channel:", e);
      toast.error("فشل تحديث القناة");
    }
  }, [data, channelDraft, load]);

  const exportCsv = useCallback(() => {
    exportLoyaltyCsv({ data, nodes, reEngagementLines });
  }, [nodes, reEngagementLines, data]);

  const exportSvg = useCallback(() => {
    exportLoyaltySvg({
      mapElement: mapRef.current,
      edges,
      nodeById,
      nodeRefs: nodeRefs.current,
    });
    setSvgBusy(false);
  }, [edges, nodeById]);

  const programs = (data as any)?.programs || [];
  const wallet = (data as any)?.wallet || null;
  const systemAnalytics = (data as any)?.systemAnalytics || null;

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
  const avgPoints =
    totalCustomers > 0 ? Math.round((totalIssued - totalRedeemed) / totalCustomers) : 0;
  const redemptionRate =
    totalIssued > 0 ? Math.round((totalRedeemed / totalIssued) * 100) : 0;
  const isAutoDiscount = systemAnalytics?.system === "AUTO_DISCOUNT";
  const cashbackConflict =
    totalCashback > 0 && totalRedeemed === 0 && redemptionRate === 0;

  const routingTools = [
    {
      tool: "إشعارات واتساب",
      route: "/customers/whatsapp-notify",
      source: routing,
    },
    {
      tool: "مناسبات العملاء",
      route: "/customers/occasions-notify",
      source: routing,
    },
    {
      tool: "عيد ميلاد العملاء",
      route: "/customers/birthday-whatsapp-notify",
      source: birthdaySource,
      editable: true,
    },
    {
      tool: "سلاسل ما بعد الاستلام",
      route: "/whatsapp/customer-journey",
      source: routing,
    },
    {
      tool: "إشعارات العملاء",
      route: "/customers/customer-notifications",
      source: routing,
    },
  ];

  const kpiCards = [
    {
      label: "العملاء المشتركين",
      value: fmt(totalCustomers),
      icon: Users,
      tone: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",
    },
    {
      label: "متوسط النقاط للعميل",
      value: fmt(avgPoints),
      icon: Coins,
      tone: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400",
    },
    {
      label: "نسبة الاستبدال",
      value: `${redemptionRate}%`,
      icon: TrendingUp,
      tone: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    },
    {
      label: "إجمالي الكاش باك",
      value: `${fmt(totalCashback)} ج.م`,
      icon: Award,
      tone: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400",
    },
  ];

  return {
    data,
    loading,
    loadFailed,
    lastUpdated,
    edges,
    pendingToggle,
    setPendingToggle,
    savingToggle,
    thresholdDraft,
    setThresholdDraft,
    customerList,
    setCustomerList,
    backfillConfirm,
    setBackfillConfirm,
    backfillBusy,
    channelDialog,
    setChannelDialog,
    channelDraft,
    setChannelDraft,
    selectedNode,
    setSelectedNode,
    dateRange,
    setDateRange,
    timelineLog,
    setTimelineLog,
    svgBusy,
    setSvgBusy,
    mapRef,
    nodeRefs,
    load,
    hasTemporalData,
    nodes,
    nodeById,
    nodeDetails,
    timelineStages,
    routing,
    birthdaySource,
    reEngagementLines,
    saveLoopToggle,
    handleToggle,
    saveThreshold,
    viewCustomers,
    runBackfill,
    openChannelDialog,
    saveChannel,
    exportCsv,
    exportSvg,
    systemAnalytics,
    totalCashback,
    isAutoDiscount,
    cashbackConflict,
    routingTools,
    kpiCards,
    navigate,
  };
}
