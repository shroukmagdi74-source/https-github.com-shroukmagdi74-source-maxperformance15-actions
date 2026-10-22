import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Receipt, Landmark, Loader2, ArrowUpRight, ShieldCheck, Wallet, Sparkles } from "lucide-react";
import { apiClient } from "../../services/apiClient";
import {
  TreasuryAccount,
  ExpenseCategory,
  fetchAccounts,
  fetchCategories,
  formatMoney,
} from "./shared";
import ExpensesTab from "./ExpensesTab";
import TreasuryCapitalTab from "./TreasuryCapitalTab";
import TabErrorBoundary from "../admin/OrderWorkflow/TabErrorBoundary";

export default function TreasuryExpensesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") === "treasury" ? "treasury" : "expenses";

  const [accounts, setAccounts] = useState<TreasuryAccount[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [totalLiquidity, setTotalLiquidity] = useState(0);
  const [loading, setLoading] = useState(true);
  const [accessBlocked, setAccessBlocked] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);

  const loadInitialData = useCallback(async () => {
    try {
      const [accRes, catRes] = await Promise.all([
        fetchAccounts(),
        fetchCategories(),
      ]);
      const rawAccounts = Array.isArray(accRes) ? accRes : (accRes?.accounts || []);
      const seenAccountKeys = new Set<string>();
      const uniqueAccounts: TreasuryAccount[] = [];
      for (const a of rawAccounts) {
        if (!a || !a.name) continue;
        const key = `${a.name.trim().toLowerCase()}_${a.type}`;
        if (!seenAccountKeys.has(key)) {
          seenAccountKeys.add(key);
          uniqueAccounts.push(a);
        }
      }

      const rawCategories = Array.isArray(catRes) ? catRes : (catRes?.categories || []);
      const seenCatKeys = new Set<string>();
      const uniqueCategories: ExpenseCategory[] = [];
      for (const c of rawCategories) {
        if (!c || !c.name) continue;
        const key = c.name.trim().toLowerCase();
        if (!seenCatKeys.has(key)) {
          seenCatKeys.add(key);
          uniqueCategories.push(c);
        }
      }

      setAccounts(uniqueAccounts);
      setTotalLiquidity(uniqueAccounts.reduce((sum, a) => sum + Number(a.balance || 0), 0));
      setCategories(uniqueCategories);
      setAccessBlocked(null);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setAccessBlocked(err?.response?.data?.message || "هذه الميزة تتطلب تفعيل أداة الخزينة والنفقات");
      }
      console.error("Failed to load treasury initial data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleTabChange = (tab: "expenses" | "treasury") => {
    setSearchParams({ tab });
  };

  return (
    <div className="w-full space-y-4 p-4 md:p-6 max-w-7xl mx-auto" dir="rtl">
      {/* Top Header Control Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Wallet className="size-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              إدارة النفقات والخزينة ورأس المال
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-mono">
              FinOps & Treasury
            </span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            ربط محاسبي محكم بين المصروفات التشغيلية، الأصول، ورصيد الخزائن الفعلي
          </p>
        </div>

        {/* Global Quick Telemetry & Segmented Tab Switcher */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Liquidity Chip */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono tabular-nums ${
              totalLiquidity < 0
                ? "bg-destructive/10 text-destructive border-destructive/20"
                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                totalLiquidity < 0 ? "bg-destructive" : "bg-emerald-500"
              } animate-pulse`}
            />
            <span className="font-sans font-medium">
              {totalLiquidity < 0 ? "عجز السيولة الإجمالي:" : "إجمالي السيولة:"}
            </span>
            <span className="font-bold">
              {formatMoney(totalLiquidity)}
            </span>
          </div>

          {/* Segmented Control */}
          <div className="inline-flex p-0.5 bg-muted rounded-lg border border-border">
            <button
              onClick={() => handleTabChange("expenses")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                currentTab === "expenses"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Receipt className="size-3.5 text-rose-500" />
              <span>النفقات والمصروفات</span>
            </button>

            <button
              onClick={() => handleTabChange("treasury")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                currentTab === "treasury"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Landmark className="size-3.5 text-emerald-600" />
              <span>الخزنة ورأس المال</span>
            </button>
          </div>
        </div>
      </div>

      {/* Access Blocked / Re-activation Banner */}
      {accessBlocked && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{accessBlocked}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                أداة الخزينة والنفقات ورأس المال مجانية بالكامل. يمكنك تفعيلها لحسابك بضغطة زر واحدة.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={activating}
            onClick={async () => {
              try {
                setActivating(true);
                await apiClient.post("/marketplace/apps/treasury-expenses-pro/install");
                setAccessBlocked(null);
                await loadInitialData();
              } catch (e: any) {
                console.error("Failed to activate treasury:", e);
              } finally {
                setActivating(false);
              }
            }}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {activating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            <span>تفعيل الأداة مجاناً الآن</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="rounded-xl border border-border bg-card p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="size-7 text-muted-foreground animate-spin" />
          <p className="text-xs font-medium text-muted-foreground">جاري تهيئة الخزينة ودفاتر النفقات...</p>
        </div>
      ) : (
        <>
          {currentTab === "expenses" && (
            <TabErrorBoundary tabLabel="النفقات والمصروفات">
              <ExpensesTab
                accounts={accounts}
                categories={categories}
                onAccountsUpdated={loadInitialData}
                onCategoriesUpdated={loadInitialData}
              />
            </TabErrorBoundary>
          )}

          {currentTab === "treasury" && (
            <TabErrorBoundary tabLabel="الخزنة ورأس المال">
              <TreasuryCapitalTab
                accounts={accounts}
                categories={categories}
                onAccountsUpdated={loadInitialData}
                onCategoriesUpdated={loadInitialData}
              />
            </TabErrorBoundary>
          )}
        </>
      )}
    </div>
  );
}
