import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import api from "../../../services/api";
import { Deduction } from "./types";

export const useMyDeductionsController = () => {
  const { t } = useTranslation();
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [filteredDeductions, setFilteredDeductions] = useState<Deduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [selectedDeduction, setSelectedDeduction] = useState<Deduction | null>(
    null,
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [deductionsRes, statsRes] = await Promise.all([
        api.get("/employee/my-deductions"),
        api.get("/employee/my-deductions/stats"),
      ]);

      if (deductionsRes.data.success) {
        setDeductions(deductionsRes.data.deductions);
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
    } catch (error) {
      console.error("Error loading deductions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let filtered = [...deductions];

    if (filterStatus) {
      filtered = filtered.filter((d) => d.status === filterStatus);
    }

    if (filterMonth && filterYear) {
      filtered = filtered.filter(
        (d) =>
          d.effectiveMonth === parseInt(filterMonth) &&
          d.effectiveYear === parseInt(filterYear),
      );
    }

    setFilteredDeductions(filtered);
  }, [deductions, filterStatus, filterMonth, filterYear]);

  return {
    t,
    loading,
    stats,
    filteredDeductions,
    selectedDeduction,
    setSelectedDeduction,
    showDetailsModal,
    setShowDetailsModal,
    filterStatus,
    setFilterStatus,
    filterMonth,
    setFilterMonth,
    filterYear,
    setFilterYear,
  };
};
