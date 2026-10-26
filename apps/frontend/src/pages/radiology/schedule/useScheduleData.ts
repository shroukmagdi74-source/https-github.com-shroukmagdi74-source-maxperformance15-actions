import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  api,
  bookingApi,
  fetchJson,
  RadiologyExamType,
  RadiologyExamAddition,
  RadiologyDevice,
  RadiologyIdSettings,
  DEFAULT_ID_SETTINGS,
  fetchIdSettings,
} from "../shared";
import { ViewMode, dayKey, addDays, egyptWeekStart } from "../ScheduleCalendar";
import {
  Appointment,
  MANAGER_ROLES,
  STATUS_CHAIN,
  SortConfig,
  todayKey,
} from "./types";

export const useScheduleData = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState<Appointment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<SortConfig | null>(null);

  const [isManagerUser] = useState(() => {
    try {
      const role =
        (JSON.parse(localStorage.getItem("user") || "{}") as {
          role?: string;
        }).role || "";
      return MANAGER_ROLES.includes(role);
    } catch {
      return false;
    }
  });

  const [examTypes, setExamTypes] = useState<RadiologyExamType[]>([]);
  const [additions, setAdditions] = useState<RadiologyExamAddition[]>([]);
  const [insuranceCompanies, setInsuranceCompanies] = useState<
    { id: string; name: string }[]
  >([]);
  const [referralSources, setReferralSources] = useState<
    { id: string; name: string }[]
  >([]);
  const [externalPartners, setExternalPartners] = useState<
    { id: string; name: string }[]
  >([]);
  const [marketingReps, setMarketingReps] = useState<
    { id: string; name: string }[]
  >([]);
  const [devices, setDevices] = useState<RadiologyDevice[]>([]);

  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [dateFrom, setDateFrom] = useState(
    searchParams.get("dateFrom") || todayKey(),
  );
  const [dateTo, setDateTo] = useState(
    searchParams.get("dateTo") || todayKey(),
  );
  const [view, setView] = useState<ViewMode>(
    (searchParams.get("view") as ViewMode) || "list",
  );
  const [anchorDate, setAnchorDate] = useState(todayKey());

  const [converting, setConverting] = useState<string | null>(null);
  const [idSettings, setIdSettings] =
    useState<RadiologyIdSettings>(DEFAULT_ID_SETTINGS);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState<"checkin" | "convert" | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const appendNextRef = useRef(false);

  const loadCatalog = useCallback(async () => {
    try {
      const [ets, adds, ins, devs, sources, partners, reps] = await Promise.all([
        fetchJson<RadiologyExamType[]>(`${api("exam-types")}&limit=500`),
        fetchJson<RadiologyExamType[]>(
          `${api("exam-types")}&isAddition=true&limit=100`,
        ).catch(() => []),
        fetchJson<{ id: string; name: string }[]>(
          bookingApi("insurance-companies"),
        ).catch(() => []),
        fetchJson<RadiologyDevice[]>(
          `${api("devices")}&includeInactive=true`,
        ).catch(() => []),
        fetchJson<{ id: string; name: string }[]>(
          api("referral-sources"),
        ).catch(() => []),
        fetchJson<{ id: string; name: string }[]>(
          api("external-partners"),
        ).catch(() => []),
        fetchJson<{ id: string; name: string }[]>(
          api("marketing-reps"),
        ).catch(() => []),
      ]);
      setExamTypes(Array.isArray(ets) ? ets : []);
      setAdditions(Array.isArray(adds) ? adds : []);
      setInsuranceCompanies(Array.isArray(ins) ? ins : []);
      setDevices(Array.isArray(devs) ? devs : []);
      setReferralSources(Array.isArray(sources) ? sources : []);
      setExternalPartners(Array.isArray(partners) ? partners : []);
      setMarketingReps(Array.isArray(reps) ? reps : []);
    } catch {
      /* catalog optional */
    }
  }, []);

  const mergeById = (prev: Appointment[], rows: Appointment[]) => {
    const seen = new Map<string, Appointment>();
    [...prev, ...rows].forEach((a) => {
      if (!seen.has(a.id)) seen.set(a.id, a);
    });
    return [...seen.values()];
  };

  const refresh = useCallback(
    async (opts?: { silent?: boolean }) => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      const append = appendNextRef.current;
      appendNextRef.current = false;
      try {
        const url = new URL(api("appointments"));
        url.searchParams.set("limit", "200");
        url.searchParams.set("page", String(page));
        if (status) url.searchParams.set("status", status);
        if (debouncedSearch.trim())
          url.searchParams.set("patientName", debouncedSearch.trim());
        if (view === "list") {
          if (dateFrom) url.searchParams.set("dateFrom", dateFrom);
          if (dateTo) url.searchParams.set("dateTo", dateTo);
        } else {
          const a = new Date(anchorDate + "T12:00:00");
          let from = dayKey(a),
            to = dayKey(a);
          if (view === "week") {
            const s = egyptWeekStart(a);
            from = dayKey(s);
            to = dayKey(addDays(s, 6));
          }
          if (view === "month") {
            from = dayKey(new Date(a.getFullYear(), a.getMonth(), 1));
            to = dayKey(new Date(a.getFullYear(), a.getMonth() + 1, 0));
          }
          url.searchParams.set("dateFrom", from);
          url.searchParams.set("dateTo", to);
        }
        const res = await fetchJson<{
          items?: Appointment[];
          total?: number;
          page?: number;
        }>(url.toString(), { signal: ctrl.signal });
        if (ctrl.signal.aborted) return;
        const rows = res.items || [];
        setTotal(res.total ?? 0);
        setItems((append) ? (prev) => mergeById(prev, rows) : rows);
        setLoadError(null);
        if (!append) {
          setSelected((prev) => {
            if (!prev.size) return prev;
            const valid = new Set(rows.map((a) => a.id));
            const next = new Set([...prev].filter((id) => valid.has(id)));
            return next.size === prev.size ? prev : next;
          });
        }
      } catch (e) {
        if (ctrl.signal.aborted) return;
        setLoadError(
          e instanceof Error ? e.message : t("radiology.schedule.loadFailed"),
        );
        if (!opts?.silent)
          toast.error(
            e instanceof Error ? e.message : t("radiology.schedule.loadFailed"),
          );
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    },
    [status, debouncedSearch, dateFrom, dateTo, view, anchorDate, page],
  );

  useEffect(() => {
    loadCatalog();
    refresh();
    fetchIdSettings().then(setIdSettings);
  }, [loadCatalog, refresh]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (status) params["status"] = status;
    if (search) params["search"] = search;
    if (dateFrom) params["dateFrom"] = dateFrom;
    if (dateTo) params["dateTo"] = dateTo;
    if (view !== "list") params["view"] = view;
    setSearchParams(params, { replace: true });
  }, [status, search, dateFrom, dateTo, view]);

  useEffect(() => () => {
    abortRef.current?.abort();
  }, []);

  const advance = async (a: Appointment) => {
    const next = STATUS_CHAIN[a.status];
    if (!next) return;
    try {
      await fetchJson(api(`appointments/${a.id}`), {
        method: "PUT",
        body: JSON.stringify({ status: next }),
      });
      await refresh({ silent: true });
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : t("radiology.schedule.updateFailed"),
      );
    }
  };

  const remove = async (a: Appointment) => {
    if (
      !window.confirm(
        t("radiology.schedule.deleteConfirm", { name: a.patientName }) as string,
      )
    )
      return;
    try {
      await fetchJson(api(`appointments/${a.id}`), { method: "DELETE" });
      toast.success(t("radiology.schedule.bookingDeleted"));
      await refresh({ silent: true });
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : t("radiology.schedule.deleteFailed"),
      );
    }
  };

  const convert = async (a: Appointment) => {
    if (converting === a.id) return;
    if (
      !window.confirm(
        t("radiology.schedule.convertConfirm", { name: a.patientName }) as string,
      )
    )
      return;
    setConverting(a.id);
    try {
      const r = await fetchJson<{
        studies?: { id: string }[];
        study?: { id: string };
      }>(api(`appointments/${a.id}/convert`), { method: "POST" });
      toast.success(t("radiology.schedule.studyCreated"));
      await refresh({ silent: true });
      if (r?.study?.id || r?.studies?.length) navigate("/radiology/studies");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : t("radiology.schedule.convertFailed"),
      );
    } finally {
      setConverting(null);
    }
  };

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (items.length && items.every((a) => selected.has(a.id)))
      setSelected(new Set());
    else setSelected(new Set(items.map((a) => a.id)));
  };

  const runBulk = async (action: "checkin" | "convert") => {
    if (!selected.size || bulkBusy) return;
    setBulkBusy(action);
    try {
      const res = await fetchJson<{
        successCount: number;
        failed: { id: string; error: string }[];
      }>(api(`bulk/appointments/${action}`), {
        method: "POST",
        body: JSON.stringify({ ids: [...selected] }),
      });
      const ok = res?.successCount ?? 0;
      const fail = res?.failed?.length ?? 0;
      if (fail > 0)
        toast.warning(t("radiology.schedule.bulkPartial", { ok, fail }));
      else toast.success(t("radiology.schedule.bulkDone", { count: ok }));
      setSelected(new Set());
      await refresh({ silent: true });
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : t("radiology.schedule.bulkFailed"),
      );
    } finally {
      setBulkBusy(null);
    }
  };

  const toggleSort = (key: string) => {
    setSort((s) =>
      s?.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  };

  const loadMore = () => {
    appendNextRef.current = true;
    setPage((p) => p + 1);
  };

  const sortedItems = useMemo(() => {
    if (!sort) return items;
    const dir = sort.dir === "asc" ? 1 : -1;
    const val = (a: Appointment): string | number => {
      switch (sort.key) {
        case "patient":
          return a.patientName || "";
        case "exam":
          return a.examTypeName || "";
        case "date":
          return a.appointmentDate || "";
        case "time":
          return a.appointmentTime || "";
        case "status":
          return a.status || "";
        case "amount":
          return Number(a.additionAmount) || 0;
        default:
          return "";
      }
    };
    return [...items].sort((x, y) => {
      const vx = val(x),
        vy = val(y);
      if (typeof vx === "number" && typeof vy === "number")
        return (vx - vy) * dir;
      return String(vx).localeCompare(String(vy), "ar") * dir;
    });
  }, [items, sort]);

  const shiftAnchor = (dir: number) => {
    const a = new Date(anchorDate + "T12:00:00");
    if (view === "day") setAnchorDate(dayKey(addDays(a, dir)));
    else if (view === "week") setAnchorDate(dayKey(addDays(a, dir * 7)));
    else {
      const x = new Date(a.getFullYear(), a.getMonth() + dir, 1);
      setAnchorDate(dayKey(x));
    }
  };
  const gotoToday = () => setAnchorDate(todayKey());
  const selectDay = (key: string) => {
    setAnchorDate(key);
    setView("day");
  };

  return {
    items,
    sortedItems,
    total,
    page,
    setPage,
    loading,
    loadError,
    sort,
    toggleSort,
    isManagerUser,
    examTypes,
    additions,
    insuranceCompanies,
    referralSources,
    externalPartners,
    marketingReps,
    devices,
    status,
    setStatus,
    search,
    setSearch,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    view,
    setView,
    anchorDate,
    shiftAnchor,
    gotoToday,
    selectDay,
    idSettings,
    selected,
    setSelected,
    toggleSelected,
    toggleSelectAll,
    bulkBusy,
    runBulk,
    advance,
    remove,
    convert,
    refresh,
    loadMore,
  };
};
