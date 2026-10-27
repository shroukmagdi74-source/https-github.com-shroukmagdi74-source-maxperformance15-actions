import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { AffiliateRecord } from "./types";
import { formatDate, statusLabels, statusTone } from "./helpers";

interface AffiliateHeaderCardProps {
  affiliate: AffiliateRecord;
  displayName: string;
  saving: boolean;
  onUpdateStatus?: (status: "ACTIVE" | "PENDING" | "SUSPENDED") => void;
  updateStatus?: (status: "ACTIVE" | "PENDING" | "SUSPENDED") => void;
}

export const AffiliateHeaderCard: React.FC<AffiliateHeaderCardProps> = ({
  affiliate,
  displayName,
  saving,
  onUpdateStatus,
  updateStatus,
}) => {
  const navigate = useNavigate();
  const handleUpdate = onUpdateStatus || updateStatus;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => navigate("/affiliates/management")}
          className="inline-flex min-h-10 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          إدارة المسوقين
        </button>
        <Link
          to={`/orders?page=1&limit=20&affiliateId=${affiliate.id}`}
          className="inline-flex min-h-10 w-fit items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
        >
          <ShoppingBagIcon className="h-4 w-4" />
          طلبات هذا المسوق
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-200">
              <UserCircleIcon className="h-9 w-9" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-bold sm:text-3xl">
                  {displayName}
                </h1>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${statusTone(
                    affiliate.status,
                  )}`}
                >
                  {statusLabels[affiliate.status] || affiliate.status}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                <span>{affiliate.user.email || "بدون بريد"}</span>
                <span>{affiliate.user.phone || "بدون هاتف"}</span>
                <span>كود: {affiliate.affiliateCode}</span>
                <span>منذ {formatDate(affiliate.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[420px]">
            <button
              onClick={() => handleUpdate?.("ACTIVE")}
              disabled={saving || affiliate.status === "ACTIVE"}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200 cursor-pointer"
            >
              <CheckCircleIcon className="h-4 w-4" />
              تفعيل
            </button>
            <button
              onClick={() => handleUpdate?.("SUSPENDED")}
              disabled={saving || affiliate.status === "SUSPENDED"}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200 cursor-pointer"
            >
              <XCircleIcon className="h-4 w-4" />
              إيقاف
            </button>
            <button
              onClick={() => handleUpdate?.("PENDING")}
              disabled={saving || affiliate.status === "PENDING"}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200 cursor-pointer"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              مراجعة
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
