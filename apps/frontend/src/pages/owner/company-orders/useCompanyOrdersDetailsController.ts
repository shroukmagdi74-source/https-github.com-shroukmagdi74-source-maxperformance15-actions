import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { tToast } from "../../../utils/i18n-toast";
import { apiClient } from "../../../services/apiClient";
import {
  CompanyDetails,
  Order,
  OrdersResponse,
  OrdersStats,
  getStatusInfo,
} from "./types";

export const useCompanyOrdersDetailsController = () => {
  const { t } = useTranslation();
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrdersStats | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<OrdersResponse>(
        `owner/companies/${companyId}/orders`,
        {
          params: {
            startDate,
            endDate,
            status: statusFilter !== "all" ? statusFilter : undefined,
            page,
            limit: 20,
          },
        },
      );

      if (response.data.success) {
        setCompany(response.data.data.company);
        setOrders(response.data.data.orders);
        setStats(response.data.data.stats);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotal(response.data.data.pagination.total);
      } else {
        tToast.error("CompanyOrdersDetails.failed_load_e304");
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      tToast.error("CompanyOrdersDetails.failed_load_e2ac");
    } finally {
      setIsLoading(false);
    }
  }, [companyId, statusFilter, startDate, endDate, page]);

  useEffect(() => {
    if (companyId) {
      fetchOrders();
    }
  }, [companyId, fetchOrders]);

  const handleExport = () => {
    if (orders.length === 0) {
      tToast.error("CompanyOrdersDetails.msg_075a");
      return;
    }

    const headers = [
      "رقم الطلب",
      "التاريخ",
      "العميل",
      "الهاتف",
      "المدينة",
      "الإجمالي",
      "الحالة",
      "المنتجات",
    ];
    const rows = orders.map((order) => [
      order.orderNumber,
      new Date(order.createdAt).toLocaleDateString("ar-EG"),
      order.customer.name,
      order.customer.phone,
      order.customer.city,
      order.total,
      (() => {
        const info = getStatusInfo(order.status);
        return t(info?.labelKey || "") || info?.label || order.status;
      })(),
      order.items.map((i) => `${i.productName} (${i.quantity})`).join(" | "),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-${company?.name}-${startDate}-to-${endDate}.csv`;
    link.click();

    tToast.success("CompanyOrdersDetails.msg_9ac6");
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return {
    t,
    navigate,
    isLoading,
    company,
    orders,
    stats,
    expandedOrder,
    statusFilter,
    setStatusFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    page,
    setPage,
    totalPages,
    total,
    handleExport,
    toggleOrderExpand,
  };
};
