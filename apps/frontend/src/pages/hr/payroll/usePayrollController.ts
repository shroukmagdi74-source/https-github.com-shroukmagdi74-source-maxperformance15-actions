import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { tToast } from '../../../utils/i18n-toast';
import { useCompany } from '../../../contexts/CompanyContext';
import api from '../../../services/api';
import {
  Payroll,
  PayrollSummary,
  PayrollAutoStatus,
  EditFormData,
  KeyedAmountItem,
  PaymentMethod,
  formatCurrency,
} from './types';
import { printPayslip, exportBankCsv } from './payrollPrintHelpers';

export const usePayrollController = () => {
  const location = useLocation();
  const isMyPayroll = location.pathname.includes('/my-payroll');
  const { company } = useCompany();

  const [loading, setLoading] = useState(true);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [statusFilter, setStatusFilter] = useState('all');

  // Bulk actions selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog visibility and state
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [forceRegenerate, setForceRegenerate] = useState(false);
  const [view, setView] = useState<'list' | 'simulator'>('list');
  const [autoStatus, setAutoStatus] = useState<PayrollAutoStatus | null>(null);
  const [autoCalculating, setAutoCalculating] = useState(false);

  // Edit form data
  const [editFormData, setEditFormData] = useState<EditFormData>({
    baseSalary: 0,
    totalAllowances: 0,
    totalDeductions: 0,
    overtimeAmount: 0,
    bonuses: 0,
    socialInsurance: 0,
    taxAmount: 0,
  });

  const [editingAllowances, setEditingAllowances] = useState<KeyedAmountItem[]>([]);
  const [editingDeductions, setEditingDeductions] = useState<KeyedAmountItem[]>([]);

  const fetchPayrolls = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
      });

      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);

      const endpoint = isMyPayroll ? '/hr/payroll/my-history' : '/hr/payroll';
      const response = await api.get(`${endpoint}?${params}`);

      let fetchedPayrolls = response.data.payrolls || [];

      if (isMyPayroll) {
        const now = new Date();
        const isCurrentMonth = selectedMonth === (now.getMonth() + 1) && selectedYear === now.getFullYear();
        const hasCurrentPayroll = fetchedPayrolls.some((p: any) => p.month === selectedMonth && p.year === selectedYear);

        if (isCurrentMonth && !hasCurrentPayroll) {
          try {
            const projResponse = await api.get('/hr/payroll/my-projection');
            if (projResponse.data?.success && projResponse.data?.projection) {
              fetchedPayrolls = [projResponse.data.projection, ...fetchedPayrolls];
            }
          } catch (err) {
            console.error('Failed to fetch projection:', err);
          }
        }
      }

      setPayrolls(fetchedPayrolls);
      const total = (response.data.pagination?.total || 0) + (fetchedPayrolls.length > (response.data.payrolls?.length || 0) ? 1 : 0);
      setPagination(prev => ({
        ...prev,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      }));
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      tToast.error("payroll.error_error_79b4");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, selectedMonth, selectedYear, statusFilter, isMyPayroll]);

  const fetchSummary = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
      });
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      const response = await api.get(`/hr/payroll/summary?${params}`);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  }, [selectedMonth, selectedYear, statusFilter]);

  const fetchAutoStatus = useCallback(async () => {
    try {
      const response = await api.get(`/hr/payroll/auto-status?month=${selectedMonth}&year=${selectedYear}`);
      if (response.data?.success) {
        setAutoStatus(response.data);
      }
    } catch (err) {
      console.warn('Failed to fetch payroll auto status:', err);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchPayrolls();
    if (!isMyPayroll) {
      fetchSummary();
      fetchAutoStatus();
    }
  }, [fetchPayrolls, fetchSummary, fetchAutoStatus, isMyPayroll]);

  const handleAutoCalculatePayroll = async () => {
    try {
      setAutoCalculating(true);
      const response = await api.post('/hr/payroll/auto-calculate', {
        month: selectedMonth,
        year: selectedYear,
        forceRegenerate: true,
      });

      if (response.data?.success) {
        const res = response.data;
        toast.success(`تمت أتمتة وحساب كشوف الرواتب والخصومات لـ ${res.processed} موظف بنجاح`, {
          description: `خصومات الغياب: ${formatCurrency(res.totalAbsenceDeductions)} | خصومات التأخير: ${formatCurrency(res.totalLateDeductions)} | عجز الساعات: ${formatCurrency(res.totalDeficitDeductions)}`,
        });
        fetchPayrolls();
        fetchSummary();
        fetchAutoStatus();
      }
    } catch (error: any) {
      console.error('Error auto-calculating payroll:', error);
      toast.error(error.response?.data?.error || 'حدث خطأ أثناء أتمتة حساب الرواتب والخصومات');
    } finally {
      setAutoCalculating(false);
    }
  };

  const handleGeneratePayroll = async () => {
    try {
      setGenerating(true);
      const response = await api.post('/hr/payroll/generate', {
        month: selectedMonth,
        year: selectedYear,
        forceRegenerate,
      });

      const result = response.data?.result || {};
      if (result.success?.length > 0) toast.success(`تم توليد ${result.success.length} كشف راتب جديد`);
      if (result.regenerated?.length > 0) toast.success(`تم إعادة توليد ${result.regenerated.length} كشف راتب`);
      if (result.skipped?.length > 0) toast.info(`تم تخطي ${result.skipped.length} موظف (لديهم كشوف رواتب مسبقاً)`);
      if (result.failed?.length > 0) toast.warning(`فشل توليد ${result.failed.length} كشف`);

      setShowGenerateDialog(false);
      setForceRegenerate(false);
      fetchPayrolls();
      fetchSummary();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'حدث خطأ');
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (payrollId: string) => {
    try {
      await api.post(`/hr/payroll/${payrollId}/approve`);
      tToast.success("payroll.msg_52b3");
      fetchPayrolls();
      if (!isMyPayroll) fetchSummary();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'حدث خطأ');
    }
  };

  const handlePay = (payrollId: string) => {
    const p = payrolls.find(item => item.id === payrollId);
    setSelectedPayroll(p || null);
    setPaymentMethod('bank_transfer');
    setShowPaymentDialog(true);
  };

  const handleBulkPay = () => {
    if (selectedIds.length === 0) {
      tToast.error("payroll.msg_4ddf");
      return;
    }
    setSelectedPayroll(null);
    setPaymentMethod('bank_transfer');
    setShowPaymentDialog(true);
  };

  const confirmPayment = async () => {
    try {
      setPaying(true);
      if (selectedPayroll) {
        await api.post(`/hr/payroll/${selectedPayroll.id}/pay`, {
          method: paymentMethod,
        });
        tToast.success("payroll.msg_d787");
      } else {
        await api.post('/hr/payroll/bulk-pay', {
          payrollIds: selectedIds,
          paymentData: { method: paymentMethod },
        });
        toast.success(`تم صرف ${selectedIds.length} راتب بنجاح`);
        setSelectedIds([]);
      }
      setShowPaymentDialog(false);
      fetchPayrolls();
      if (!isMyPayroll) fetchSummary();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'حدث خطأ أثناء الصرف');
    } finally {
      setPaying(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      tToast.error("payroll.msg_4ddf");
      return;
    }
    try {
      const response = await api.post('/hr/payroll/bulk-approve', {
        payrollIds: selectedIds,
      });
      toast.success(`تم اعتماد ${response.data.result.updated} كشف راتب`);
      setSelectedIds([]);
      fetchPayrolls();
      if (!isMyPayroll) fetchSummary();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'حدث خطأ');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === payrolls.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(payrolls.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleEdit = (payroll: Payroll) => {
    setSelectedPayroll(payroll);
    setEditFormData({
      baseSalary: payroll.fullMonthBaseSalary || payroll.baseSalary,
      totalAllowances: payroll.totalAllowances,
      totalDeductions: payroll.totalDeductions,
      overtimeAmount: payroll.overtimeAmount,
      bonuses: payroll.bonuses,
      socialInsurance: payroll.socialInsurance,
      taxAmount: payroll.taxAmount,
    });

    try {
      const parsedAllowances = payroll.allowances ? JSON.parse(payroll.allowances) : {};
      setEditingAllowances(
        Object.entries(parsedAllowances)
          .filter(([_, amount]) => typeof amount === 'number')
          .map(([name, amount]) => ({
            id: Math.random().toString(36).substr(2, 9),
            name,
            amount: Number(amount),
          }))
      );
    } catch {
      setEditingAllowances([]);
    }

    const metaKeys = ['details', 'manualDetails', 'capNotes', 'advanceDetails', 'absenceDetails', 'lateDetails', 'deficitDetails'];
    try {
      const parsedDeductions = payroll.deductions ? JSON.parse(payroll.deductions) : {};
      setEditingDeductions(
        Object.entries(parsedDeductions)
          .filter(([name, amount]) => !metaKeys.includes(name) && typeof amount === 'number')
          .map(([name, amount]) => ({
            id: Math.random().toString(36).substr(2, 9),
            name,
            amount: Number(amount),
          }))
      );
    } catch {
      setEditingDeductions([]);
    }

    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedPayroll) return;
    try {
      setSaving(true);
      const totalAllowances = editingAllowances.reduce((sum, item) => sum + (item.amount || 0), 0);
      const totalDeductions = editingDeductions.reduce((sum, item) => sum + (item.amount || 0), 0);

      const allowancesObj = editingAllowances.reduce((acc, item) => {
        if (item.name.trim()) acc[item.name.trim()] = item.amount;
        return acc;
      }, {} as Record<string, number>);

      const deductionsObj = editingDeductions.reduce((acc, item) => {
        if (item.name.trim()) acc[item.name.trim()] = item.amount;
        return acc;
      }, {} as Record<string, number>);

      const payload = {
        ...editFormData,
        totalAllowances,
        totalDeductions,
        allowances: allowancesObj,
        deductions: deductionsObj,
      };

      await api.put(`/hr/payroll/${selectedPayroll.id}`, payload);
      tToast.success("payroll.success_update_ffdd");
      setShowEditDialog(false);
      fetchPayrolls();
      fetchSummary();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'حدث خطأ أثناء التحديث');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = (payroll: Payroll) => {
    printPayslip(payroll, company, selectedMonth, selectedYear);
  };

  const handleExportBankFile = () => {
    exportBankCsv(payrolls, selectedMonth, selectedYear);
  };

  return {
    isMyPayroll,
    loading,
    payrolls,
    summary,
    pagination,
    setPagination,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    statusFilter,
    setStatusFilter,
    selectedIds,
    toggleSelectAll,
    toggleSelect,
    showGenerateDialog,
    setShowGenerateDialog,
    showDetailsDialog,
    setShowDetailsDialog,
    showEditDialog,
    setShowEditDialog,
    showPaymentDialog,
    setShowPaymentDialog,
    paymentMethod,
    setPaymentMethod,
    selectedPayroll,
    setSelectedPayroll,
    generating,
    saving,
    paying,
    forceRegenerate,
    setForceRegenerate,
    view,
    setView,
    autoStatus,
    autoCalculating,
    editFormData,
    setEditFormData,
    editingAllowances,
    setEditingAllowances,
    editingDeductions,
    setEditingDeductions,
    handleAutoCalculatePayroll,
    handleGeneratePayroll,
    handleApprove,
    handlePay,
    handleBulkPay,
    confirmPayment,
    handleBulkApprove,
    handleEdit,
    handleSaveEdit,
    handlePrint,
    handleExportBankFile,
  };
};
