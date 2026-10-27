import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import {
  factoryPortalApi,
  FactoryPortalContext,
  FactoryPortalAssignment,
} from '../../manufacturingApi';
import {
  FactoryPortalActiveModal,
  FactoryPortalStats,
  FactoryPortalStatusTab,
} from './types';

export const useFactoryPortalData = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const routeParams = useParams<{ token?: string }>();

  // Determine active token
  const tokenFromUrl = routeParams.token || searchParams.get('token');
  const [token, setToken] = useState<string>(() => {
    return tokenFromUrl || localStorage.getItem('maxp_factory_portal_token') || '';
  });

  const [inputToken, setInputToken] = useState<string>('');
  const [context, setContext] = useState<FactoryPortalContext | null>(null);
  const [assignments, setAssignments] = useState<FactoryPortalAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Active Tab Filter
  const [statusTab, setStatusTab] = useState<FactoryPortalStatusTab>('ALL');

  // Expanded materials drawer state per assignment ID
  const [expandedMaterials, setExpandedMaterials] = useState<Record<string, boolean>>({});

  // Active Modals
  const [activeModal, setActiveModal] = useState<FactoryPortalActiveModal | null>(null);

  // Form states for modals
  const [updateExecutedQty, setUpdateExecutedQty] = useState<number>(0);
  const [updateScrapQty, setUpdateScrapQty] = useState<number>(0);
  const [updateReworkQty, setUpdateReworkQty] = useState<number>(0);
  const [updateNotes, setUpdateNotes] = useState<string>('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaCaption, setMediaCaption] = useState<string>('');
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);

  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [issueText, setIssueText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Sync token from URL
  useEffect(() => {
    if (tokenFromUrl && tokenFromUrl !== token) {
      setToken(tokenFromUrl);
      localStorage.setItem('maxp_factory_portal_token', tokenFromUrl);
    }
  }, [tokenFromUrl, token]);

  // Load Portal Data
  const loadPortalData = useCallback(async (activeToken: string) => {
    if (!activeToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setAuthError(null);
      const [ctx, asgs] = await Promise.all([
        factoryPortalApi.getContext(activeToken),
        factoryPortalApi.getAssignments(activeToken),
      ]);
      setContext(ctx);
      setAssignments(asgs);
      localStorage.setItem('maxp_factory_portal_token', activeToken);
    } catch (err: any) {
      setAuthError(
        err?.response?.data?.error ||
        err?.message ||
        'رابط البوابة غير صالح أو تم إيقافه من قِبل إدارة المصنع'
      );
      setContext(null);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadPortalData(token);
    } else {
      setLoading(false);
    }
  }, [token, loadPortalData]);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputToken.trim();
    if (!clean) return;
    setToken(clean);
    setSearchParams({ token: clean });
  };

  const toggleExpandMaterials = (asgId: string) => {
    setExpandedMaterials((prev) => ({ ...prev, [asgId]: !prev[asgId] }));
  };

  // Quick Action Handlers
  const handleConfirmReceipt = async (asg: FactoryPortalAssignment) => {
    try {
      setSubmitting(true);
      setActionError(null);
      await factoryPortalApi.confirmReceipt(token, asg.id);
      setActionSuccess(`تم تأكيد استلام أمر التشغيل "${asg.order?.orderNumber}" بنجاح`);
      setTimeout(() => setActionSuccess(null), 4000);
      await loadPortalData(token);
    } catch (err: any) {
      setActionError(err?.response?.data?.error || err?.message || 'تعذر تأكيد الاستلام');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStart = async (asg: FactoryPortalAssignment) => {
    try {
      setSubmitting(true);
      setActionError(null);
      await factoryPortalApi.startStage(token, asg.id);
      setActionSuccess(`تم تسجيل بدء مرحلة التشغيل "${asg.name}"`);
      setTimeout(() => setActionSuccess(null), 4000);
      await loadPortalData(token);
    } catch (err: any) {
      setActionError(err?.response?.data?.error || err?.message || 'تعذر تسجيل بدء المرحلة');
    } finally {
      setSubmitting(false);
    }
  };

  const openUpdateModal = (asg: FactoryPortalAssignment) => {
    setActiveModal({ type: 'UPDATE', assignment: asg });
    setUpdateExecutedQty(asg.completedQuantity || 0);
    setUpdateScrapQty(0);
    setUpdateReworkQty(0);
    setUpdateNotes('');
  };

  const handleSaveUpdate = async () => {
    if (!activeModal) return;
    try {
      setSubmitting(true);
      setActionError(null);
      await factoryPortalApi.updateStage(token, activeModal.assignment.id, {
        completedQuantity: Number(updateExecutedQty) || 0,
        scrapQuantity: Number(updateScrapQty) || 0,
        reworkQuantity: Number(updateReworkQty) || 0,
        notes: updateNotes.trim(),
      });
      setActionSuccess('تم تحديث كميات التشغيل بنجاح');
      setTimeout(() => setActionSuccess(null), 4000);
      setActiveModal(null);
      await loadPortalData(token);
    } catch (err: any) {
      setActionError(err?.response?.data?.error || err?.message || 'تعذر تحديث الكميات');
    } finally {
      setSubmitting(false);
    }
  };

  const openMediaModal = (asg: FactoryPortalAssignment) => {
    setActiveModal({ type: 'MEDIA', assignment: asg });
    setSelectedFile(null);
    setMediaCaption('');
    setMediaPreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setMediaPreviewUrl(url);
    }
  };

  const handleUploadMedia = async () => {
    if (!activeModal) return;
    if (!selectedFile) {
      alert('يرجى اختيار صورة أو فيديو أولاً');
      return;
    }
    try {
      setSubmitting(true);
      setActionError(null);
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (mediaCaption.trim()) {
        formData.append('caption', mediaCaption.trim());
      }
      await factoryPortalApi.uploadMedia(token, activeModal.assignment.id, formData);
      setActionSuccess('تم رفع الملف بنجاح وهو الآن قيد مراجعة الإدارة');
      setTimeout(() => setActionSuccess(null), 5000);
      setActiveModal(null);
      await loadPortalData(token);
    } catch (err: any) {
      setActionError(err?.response?.data?.error || err?.message || 'تعذر رفع الملف');
    } finally {
      setSubmitting(false);
    }
  };

  const openApprovalModal = (asg: FactoryPortalAssignment) => {
    setActiveModal({ type: 'APPROVAL', assignment: asg });
    setApprovalNotes('المصنع يطلب اعتماد المرحلة وإغلاق التشغيل بعد مطابقة العينات');
  };

  const handleSendApprovalRequest = async () => {
    if (!activeModal) return;
    try {
      setSubmitting(true);
      setActionError(null);
      await factoryPortalApi.requestApproval(token, activeModal.assignment.id, {
        notes: approvalNotes.trim(),
      });
      setActionSuccess('تم إرسال طلب الاعتماد إلى إدارة المصنع بنجاح');
      setTimeout(() => setActionSuccess(null), 4000);
      setActiveModal(null);
      await loadPortalData(token);
    } catch (err: any) {
      setActionError(err?.response?.data?.error || err?.message || 'تعذر إرسال طلب الاعتماد');
    } finally {
      setSubmitting(false);
    }
  };

  const openIssueModal = (asg: FactoryPortalAssignment) => {
    setActiveModal({ type: 'ISSUE', assignment: asg });
    setIssueText('');
  };

  const handleSendIssue = async () => {
    if (!activeModal) return;
    const cleanIssue = issueText.trim();
    if (!cleanIssue) {
      alert('يرجى كتابة تفاصيل الملاحظة أو المشكلة');
      return;
    }
    try {
      setSubmitting(true);
      setActionError(null);
      await factoryPortalApi.reportIssue(token, activeModal.assignment.id, {
        issue: cleanIssue,
      });
      setActionSuccess('تم تسجيل الملاحظة وإشعار الإدارة');
      setTimeout(() => setActionSuccess(null), 4000);
      setActiveModal(null);
      await loadPortalData(token);
    } catch (err: any) {
      setActionError(err?.response?.data?.error || err?.message || 'تعذر تسجيل الملاحظة');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((asg) => {
      if (statusTab === 'ACTIVE') {
        return asg.status === 'IN_PROGRESS' || asg.status === 'PENDING';
      }
      if (statusTab === 'PENDING_REVIEW') {
        const hasUnderReview = asg.attachments?.some((a) => a.reviewStatus === 'UNDER_REVIEW');
        return hasUnderReview || asg.factoryNotes?.includes('APPROVAL_REQUEST');
      }
      if (statusTab === 'COMPLETED') {
        return asg.status === 'COMPLETED' || asg.factoryCompletedAt != null;
      }
      return true;
    });
  }, [assignments, statusTab]);

  const stats: FactoryPortalStats = useMemo(() => {
    return {
      all: assignments.length,
      active: assignments.filter((a) => a.status === 'IN_PROGRESS' || a.status === 'PENDING').length,
      pendingReview: assignments.filter((a) => a.attachments?.some((m) => m.reviewStatus === 'UNDER_REVIEW')).length,
      completed: assignments.filter((a) => a.status === 'COMPLETED' || a.factoryCompletedAt != null).length,
    };
  }, [assignments]);

  return {
    token,
    inputToken,
    setInputToken,
    context,
    assignments,
    filteredAssignments,
    stats,
    loading,
    authError,
    actionSuccess,
    actionError,
    statusTab,
    setStatusTab,
    expandedMaterials,
    activeModal,
    setActiveModal,
    updateExecutedQty,
    setUpdateExecutedQty,
    updateScrapQty,
    setUpdateScrapQty,
    updateReworkQty,
    setUpdateReworkQty,
    updateNotes,
    setUpdateNotes,
    selectedFile,
    mediaCaption,
    setMediaCaption,
    mediaPreviewUrl,
    approvalNotes,
    setApprovalNotes,
    issueText,
    setIssueText,
    submitting,
    loadPortalData,
    handleManualLogin,
    toggleExpandMaterials,
    handleConfirmReceipt,
    handleStart,
    openUpdateModal,
    handleSaveUpdate,
    openMediaModal,
    handleFileChange,
    handleUploadMedia,
    openApprovalModal,
    handleSendApprovalRequest,
    openIssueModal,
    handleSendIssue,
  };
};
