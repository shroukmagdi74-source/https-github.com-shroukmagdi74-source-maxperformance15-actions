import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  CheckCircle2,
  RotateCcw,
  Shield,
  ShieldAlert,
  FileCheck2,
  Paperclip,
  Cpu,
  AlertTriangle,
  ExternalLink,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  FileText,
  Loader2,
  Eye,
  Send,
} from 'lucide-react';
import { parseCriteriaItems } from './AcceptanceCriteriaChecklist';

export interface EvidenceSlot {
  id?: string;
  url?: string;
  name?: string;
  fileSize?: number;
  uploading: boolean;
  progress: number;
  error?: string | null;
}

interface ApprovalGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
  isAdminOrManager?: boolean;
  serverUrl?: string;
  onApprove: (options: {
    ownerOverride?: boolean;
    ownerOverrideReason?: string;
    criteriaChecked?: boolean;
    evidence?: any;
    targetStatus?: string;
    [key: string]: any;
  }) => Promise<void>;
  onReturn: (reason: string, returnReasonType?: string, returnSeverity?: number) => Promise<void>;
  isSubmitting?: boolean;
}

const CHANGE_TYPES = [
  { value: 'BUG_FIX', label: 'إصلاح خطأ (Bug Fix)' },
  { value: 'FEATURE', label: 'ميزة جديدة (Feature)' },
  { value: 'REFACTOR', label: 'إعادة هيكلة (Refactor)' },
  { value: 'PERFORMANCE', label: 'تحسين أداء (Performance)' },
  { value: 'UI_UX', label: 'واجهة وتجربة (UI/UX)' },
  { value: 'CONFIG', label: 'إعدادات وضبط (Config)' },
];

export const ApprovalGateModal: React.FC<ApprovalGateModalProps> = ({
  isOpen,
  onClose,
  task,
  isAdminOrManager = false,
  serverUrl = 'https://maxp.online',
  onApprove,
  onReturn,
  isSubmitting = false,
}) => {
  if (!isOpen || !task) return null;

  const initialChecklist = useMemo(() => {
    const rawChecklist = task.criteriaChecklist || task.acceptanceCriteria;
    const parsed = parseCriteriaItems(rawChecklist);
    if (parsed.length === 0) {
      return [
        {
          id: 0,
          text: 'التحقق من إنجاز متطلبات المهمة بالكامل وعملها بدون أخطاء',
          checked: false,
        },
      ];
    }
    let storedChecked: Record<number, boolean> = {};
    try {
      const stored = localStorage.getItem(`maxp_task_criteria_${task.id}`);
      if (stored) storedChecked = JSON.parse(stored);
    } catch {}

    return parsed.map((item, idx) => ({
      id: idx,
      text: item.text,
      checked:
        item.completed !== undefined
          ? item.completed
          : storedChecked[idx] !== undefined
          ? storedChecked[idx]
          : false,
    }));
  }, [task.criteriaChecklist, task.acceptanceCriteria, task.id]);

  const evidenceObj = useMemo(() => {
    if (!task.evidence) return null;
    if (typeof task.evidence === 'object') return task.evidence;
    try {
      return JSON.parse(task.evidence);
    } catch {
      return null;
    }
  }, [task.evidence]);

  const taskAttachments = useMemo(() => {
    return Array.isArray(task.taskAttachments)
      ? task.taskAttachments
      : Array.isArray(task.attachments)
      ? task.attachments
      : [];
  }, [task.taskAttachments, task.attachments]);

  const resolveAttachmentUrl = (rawPath: string) => {
    if (!rawPath) return '';
    if (rawPath.startsWith('data:') || rawPath.startsWith('blob:')) return rawPath;
    const cleanRaw = rawPath.trim();
    if (cleanRaw.startsWith('http://') || cleanRaw.startsWith('https://')) return cleanRaw;
    let base = (serverUrl || 'https://maxp.online').trim().replace(/\/$/, '');
    if (!base.startsWith('http://') && !base.startsWith('https://')) base = `https://${base}`;
    let normalized = cleanRaw.replace(/\\/g, '/');
    if (!normalized.startsWith('/')) normalized = `/${normalized}`;
    if (!normalized.startsWith('/uploads/')) {
      if (normalized.startsWith('/tasks/')) normalized = `/uploads${normalized}`;
      else normalized = `/uploads/tasks${normalized}`;
    }
    try {
      normalized = encodeURI(decodeURI(normalized));
    } catch {
      normalized = encodeURI(normalized);
    }
    return `${base}${normalized}`;
  };

  const isImgAttachment = (att: any) => {
    if (att.fileType?.startsWith('image/')) return true;
    const name = att.originalName || att.fileName || att.filePath || '';
    return /\.(png|jpe?g|webp|gif|svg)$/i.test(name);
  };

  const normalizedPriority = useMemo(() => {
    const p = String(task.priority || 'MEDIUM').trim().toUpperCase();
    if (['URGENT', 'HIGH'].includes(p)) return 'HIGH';
    if (['LOW'].includes(p)) return 'LOW';
    return 'MEDIUM';
  }, [task.priority]);

  // Evidence Inputs State
  const [changeType, setChangeType] = useState<string>(() => evidenceObj?.changeType || 'BUG_FIX');
  const [commitOrPath, setCommitOrPath] = useState<string>(() => evidenceObj?.commitOrPath || '');
  const [numbersBeforeAfter, setNumbersBeforeAfter] = useState<string>(() => evidenceObj?.numbersBeforeAfter || '');
  const [notTestedScope, setNotTestedScope] = useState<string>(() => evidenceObj?.notTestedScope || '');

  // 3 Slots State: Before, After, Proof
  const [beforeSlot, setBeforeSlot] = useState<EvidenceSlot>(() => {
    const existingId = evidenceObj?.beforeAttachmentId;
    const existingAtt = existingId ? taskAttachments.find((a: any) => a.id === existingId) : null;
    return {
      id: existingId || '',
      url: existingAtt ? resolveAttachmentUrl(existingAtt.filePath) : evidenceObj?.beforeAttachmentUrl || '',
      name: existingAtt?.originalName || existingAtt?.fileName || (existingId ? 'صورة قبل المرفوعة' : ''),
      uploading: false,
      progress: existingId ? 100 : 0,
      error: null,
    };
  });

  const [afterSlot, setAfterSlot] = useState<EvidenceSlot>(() => {
    const existingId = evidenceObj?.afterAttachmentId;
    const existingAtt = existingId ? taskAttachments.find((a: any) => a.id === existingId) : null;
    return {
      id: existingId || '',
      url: existingAtt ? resolveAttachmentUrl(existingAtt.filePath) : evidenceObj?.afterAttachmentUrl || '',
      name: existingAtt?.originalName || existingAtt?.fileName || (existingId ? 'صورة بعد المرفوعة' : ''),
      uploading: false,
      progress: existingId ? 100 : 0,
      error: null,
    };
  });

  const [proofSlot, setProofSlot] = useState<EvidenceSlot>(() => {
    const existingId = evidenceObj?.proofAttachmentId;
    const existingAtt = existingId ? taskAttachments.find((a: any) => a.id === existingId) : null;
    return {
      id: existingId || '',
      url: existingAtt ? resolveAttachmentUrl(existingAtt.filePath) : evidenceObj?.proofAttachmentUrl || '',
      name: existingAtt?.originalName || existingAtt?.fileName || (existingId ? 'مرفق إثبات التشغيل' : ''),
      uploading: false,
      progress: existingId ? 100 : 0,
      error: null,
    };
  });

  const [previewImgUrl, setPreviewImgUrl] = useState<string | null>(null);
  const [draggingSlot, setDraggingSlot] = useState<'before' | 'after' | 'proof' | 'multi' | null>(null);

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);
  const multiInputRef = useRef<HTMLInputElement>(null);

  // Missing fields strictly aligned with taskEvidenceService.js
  const missingFields = useMemo(() => {
    const missing: string[] = [];
    if (normalizedPriority === 'HIGH') {
      if (!changeType.trim()) missing.push('نوع التغيير');
      if (!commitOrPath.trim() && !task.pageUrl) missing.push('لينك الصفحة أو الكوميت/مسار الملفات');
      if (!numbersBeforeAfter.trim()) missing.push('الأرقام قبل / بعد');
      if (!notTestedScope.trim()) missing.push('نطاق ما لم يتم اختباره');
      if (!beforeSlot.id && !beforeSlot.url) missing.push('صورة قبل');
      if (!afterSlot.id && !afterSlot.url) missing.push('صورة بعد');
      if (!proofSlot.id && !proofSlot.url && !beforeSlot.id && !afterSlot.id) missing.push('مرفق إثبات التشغيل');
    } else if (normalizedPriority === 'MEDIUM') {
      if (!changeType.trim()) missing.push('نوع التغيير');
      if (!commitOrPath.trim() && !task.pageUrl) missing.push('لينك الصفحة أو الكوميت/مسار الملفات');
    }
    return missing;
  }, [
    normalizedPriority,
    changeType,
    commitOrPath,
    numbersBeforeAfter,
    notTestedScope,
    beforeSlot.id,
    beforeSlot.url,
    afterSlot.id,
    afterSlot.url,
    proofSlot.id,
    proofSlot.url,
    task.pageUrl,
  ]);

  const hasValidEvidence = missingFields.length === 0;
  const isAnySlotUploading = beforeSlot.uploading || afterSlot.uploading || proofSlot.uploading;

  const [checklist, setChecklist] = useState(initialChecklist);
  const [returnMode, setReturnMode] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnReasonType, setReturnReasonType] = useState('WRONG_EXECUTION');
  const [returnSeverity, setReturnSeverity] = useState<number>(1);
  const [useOwnerOverride, setUseOwnerOverride] = useState(!hasValidEvidence && isAdminOrManager);
  const [ownerOverrideReason, setOwnerOverrideReason] = useState(
    !hasValidEvidence ? 'اعتماد إداري مباشر للمهام السابقة' : ''
  );

  const allCriteriaChecked =
    checklist.length > 0 && checklist.every((item) => item.checked);

  const canApprove =
    (!isAnySlotUploading && allCriteriaChecked && hasValidEvidence) ||
    (isAdminOrManager &&
      useOwnerOverride &&
      ownerOverrideReason.trim().length >= 3);

  const toggleCheck = (idx: number) => {
    setChecklist((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, checked: !c.checked } : c))
    );
  };

  const handleToggleAll = () => {
    const nextVal = !allCriteriaChecked;
    setChecklist((prev) => prev.map((c) => ({ ...c, checked: nextVal })));
  };

  // Upload handler for single slot
  const uploadToSlot = async (
    file: File,
    slotName: 'before' | 'after' | 'proof'
  ) => {
    if (!file || !task?.id) return;

    const setSlot =
      slotName === 'before'
        ? setBeforeSlot
        : slotName === 'after'
        ? setAfterSlot
        : setProofSlot;

    // Check size limit: 8MB
    const MAX_SIZE_BYTES = 8 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setSlot((prev) => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: `حجم الملف "${file.name}" (${sizeMB} ميجابايت) يتجاوز الحد الأقصى المسموح (8 ميجابايت)`,
      }));
      return;
    }

    if (!window.electronAPI?.uploadTaskAttachment) {
      setSlot((prev) => ({
        ...prev,
        uploading: false,
        error: 'خدمة رفع المرفقات غير متاحة في بيئة التشغيل الحالية',
      }));
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setSlot({
      url: localPreviewUrl,
      name: file.name,
      fileSize: file.size,
      uploading: true,
      progress: 15,
      error: null,
    });

    const progressTimer = setInterval(() => {
      setSlot((prev) => {
        if (!prev.uploading) return prev;
        const next = Math.min(prev.progress + 15, 85);
        return { ...prev, progress: next };
      });
    }, 150);

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/png');
      const res = await window.electronAPI.uploadTaskAttachment({
        taskId: task.id,
        base64Data,
        originalName: file.name,
        mimeType,
      });

      clearInterval(progressTimer);

      const uploadedAtt = res?.attachment || res?.data;
      if (res?.success && uploadedAtt?.id) {
        setSlot({
          id: uploadedAtt.id,
          url: uploadedAtt.filePath ? resolveAttachmentUrl(uploadedAtt.filePath) : localPreviewUrl,
          name: uploadedAtt.originalName || file.name,
          fileSize: file.size,
          uploading: false,
          progress: 100,
          error: null,
        });

        // Keep local task attachments updated
        if (task) {
          const currentAtts = Array.isArray(task.taskAttachments) ? task.taskAttachments : [];
          task.taskAttachments = [uploadedAtt, ...currentAtts.filter((a: any) => a.id !== uploadedAtt.id)];
        }
      } else {
        throw new Error(res?.error || 'فشل في رفع المرفق');
      }
    } catch (err: any) {
      clearInterval(progressTimer);
      setSlot((prev) => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: err?.message || 'فشل في رفع الملف',
      }));
    }
  };

  // Delete slot handler
  const handleDeleteSlot = async (slotName: 'before' | 'after' | 'proof') => {
    const slot = slotName === 'before' ? beforeSlot : slotName === 'after' ? afterSlot : proofSlot;
    const setSlot = slotName === 'before' ? setBeforeSlot : slotName === 'after' ? setAfterSlot : setProofSlot;

    if (slot.id && window.electronAPI?.deleteTaskAttachment) {
      try {
        await window.electronAPI.deleteTaskAttachment(slot.id);
        if (task && Array.isArray(task.taskAttachments)) {
          task.taskAttachments = task.taskAttachments.filter((a: any) => a.id !== slot.id);
        }
      } catch (err) {
        console.warn('[ApprovalGateModal] Failed to delete attachment from server:', err);
      }
    }

    if (slot.url && slot.url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(slot.url);
      } catch {}
    }

    setSlot({
      id: '',
      url: '',
      name: '',
      fileSize: undefined,
      uploading: false,
      progress: 0,
      error: null,
    });
  };

  // Multi-files drop distribution
  const handleMultiFilesDrop = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    if (fileArray.length === 1) {
      if (!beforeSlot.id && !beforeSlot.url) {
        uploadToSlot(fileArray[0], 'before');
      } else if (!afterSlot.id && !afterSlot.url) {
        uploadToSlot(fileArray[0], 'after');
      } else {
        uploadToSlot(fileArray[0], 'proof');
      }
      return;
    }

    const slotsToFill: Array<'before' | 'after' | 'proof'> = ['before', 'after', 'proof'];
    fileArray.slice(0, 3).forEach((file, idx) => {
      uploadToSlot(file, slotsToFill[idx]);
    });
  };

  const handleApproveSubmit = async () => {
    if (!canApprove || isSubmitting) return;

    const evidencePayload = {
      changeType: changeType.trim() || (normalizedPriority === 'LOW' ? 'عام' : 'BUG_FIX'),
      commitOrPath: commitOrPath.trim() || undefined,
      numbersBeforeAfter: numbersBeforeAfter.trim() || undefined,
      notTestedScope: notTestedScope.trim() || undefined,
      beforeAttachmentId: beforeSlot.id || undefined,
      beforeAttachmentUrl: beforeSlot.url || undefined,
      afterAttachmentId: afterSlot.id || undefined,
      afterAttachmentUrl: afterSlot.url || undefined,
      proofAttachmentId: proofSlot.id || afterSlot.id || beforeSlot.id || undefined,
      proofAttachmentUrl: proofSlot.url || afterSlot.url || beforeSlot.url || undefined,
    };

    const targetStatus = task.status === 'IN_REVIEW' ? 'COMPLETED' : 'IN_REVIEW';

    await onApprove({
      criteriaChecked: allCriteriaChecked,
      ownerOverride: useOwnerOverride,
      ownerOverrideReason: useOwnerOverride
        ? ownerOverrideReason.trim() || 'اعتماد إداري مباشر'
        : undefined,
      evidence: evidencePayload,
      targetStatus,
      ...evidencePayload,
    });
  };

  const handleReturnSubmit = async () => {
    if (!returnReason.trim() || isSubmitting) return;
    await onReturn(returnReason.trim(), returnReasonType, returnSeverity);
  };

  const renderSlotBox = (
    title: string,
    slotName: 'before' | 'after' | 'proof',
    slot: EvidenceSlot,
    inputRef: React.RefObject<HTMLInputElement>,
    isRequired: boolean,
    accept = 'image/*'
  ) => {
    const isSlotDragging = draggingSlot === slotName;
    const hasUploaded = Boolean(slot.id || slot.url);

    return (
      <div
        style={{
          ...styles.slotCard,
          borderColor: isSlotDragging
            ? 'var(--accent-blue, #3b82f6)'
            : slot.error
            ? '#f43f5e'
            : hasUploaded
            ? 'rgba(16, 185, 129, 0.4)'
            : 'rgba(255, 255, 255, 0.1)',
          backgroundColor: isSlotDragging
            ? 'rgba(59, 130, 246, 0.08)'
            : hasUploaded
            ? 'rgba(16, 185, 129, 0.04)'
            : 'rgba(255, 255, 255, 0.02)',
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDraggingSlot(slotName);
        }}
        onDragLeave={() => setDraggingSlot(null)}
        onDrop={(e) => {
          e.preventDefault();
          setDraggingSlot(null);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            uploadToSlot(e.dataTransfer.files[0], slotName);
          }
        }}
      >
        <div style={styles.slotHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {slotName === 'proof' ? (
              <FileText size={13} color="var(--accent-blue, #3b82f6)" />
            ) : (
              <ImageIcon size={13} color="var(--accent-blue, #3b82f6)" />
            )}
            <span style={styles.slotTitle}>{title}</span>
          </div>
          <div>
            {isRequired ? (
              hasUploaded ? (
                <span style={styles.slotBadgeSuccess}>تم الرفع ✓</span>
              ) : (
                <span style={styles.slotBadgeRequired}>مطلوب إلزامي *</span>
              )
            ) : hasUploaded ? (
              <span style={styles.slotBadgeSuccess}>تم الرفع ✓</span>
            ) : (
              <span style={styles.slotBadgeOptional}>اختياري</span>
            )}
          </div>
        </div>

        {slot.error && (
          <div style={styles.slotErrorBanner}>
            <AlertTriangle size={12} color="#f43f5e" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 10.5, color: '#fca5a5', lineHeight: 1.3 }}>{slot.error}</span>
          </div>
        )}

        {slot.uploading ? (
          <div style={styles.slotProgressWrap}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10.5, color: 'var(--text-secondary, #cbd5e1)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Loader2 size={11} className="animate-spin" />
                جاري الرفع...
              </span>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--accent-blue, #3b82f6)' }}>
                {slot.progress}%
              </span>
            </div>
            <div style={styles.progressBarTrack}>
              <div style={{ ...styles.progressBarFill, width: `${slot.progress}%` }} />
            </div>
          </div>
        ) : hasUploaded ? (
          <div style={styles.slotPreviewWrap}>
            <div
              style={styles.slotThumbBox}
              onClick={() => slot.url && setPreviewImgUrl(slot.url)}
              title="اضغط للتكبير والمشاهدة"
            >
              {slot.url && (slot.url.startsWith('data:image') || slot.url.endsWith('.png') || slot.url.endsWith('.jpg') || slot.url.endsWith('.jpeg') || slot.url.startsWith('blob:') || !slot.url.endsWith('.pdf')) ? (
                <img
                  src={slot.url}
                  alt={slot.name || title}
                  style={styles.slotThumbImg}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = '0.3';
                  }}
                />
              ) : (
                <div style={styles.slotDocThumb}>
                  <FileText size={20} color="var(--accent-blue, #3b82f6)" />
                </div>
              )}
            </div>

            <div style={styles.slotMetaWrap}>
              <span style={styles.slotFileName} title={slot.name}>
                {slot.name || 'ملف المرفق'}
              </span>
              {slot.fileSize && (
                <span style={styles.slotFileSize}>
                  {(slot.fileSize / 1024).toFixed(0)} KB
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                {slot.url && (
                  <button
                    type="button"
                    onClick={() => setPreviewImgUrl(slot.url!)}
                    style={styles.slotViewBtn}
                    title="معاينة"
                  >
                    <Eye size={11} />
                    <span>معاينة</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteSlot(slotName)}
                  style={styles.slotDeleteBtn}
                  title="حذف هذا المرفق"
                >
                  <Trash2 size={11} />
                  <span>حذف</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={styles.slotEmptyDropzone}
            onClick={() => inputRef.current?.click()}
          >
            <UploadCloud size={20} color="var(--text-muted, #94a3b8)" />
            <span style={{ fontSize: 11, color: 'var(--text-secondary, #cbd5e1)', fontWeight: 600 }}>
              اسحب الملف هنا أو اضغط للاختيار
            </span>
            <span style={{ fontSize: 9.5, color: 'var(--text-muted, #94a3b8)' }}>
              الحد الأقصى: 8 ميجابايت
            </span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              uploadToSlot(e.target.files[0], slotName);
            }
          }}
        />
      </div>
    );
  };

  const isSubmitForReview = task.status !== 'IN_REVIEW';

  return (
    <div style={styles.overlay} onClick={onClose} dir="rtl">
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTitleWrap}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Shield size={18} color="#10b981" />
              <h2 style={styles.title}>
                {isSubmitForReview ? 'بوابة تسليم المهمة والمرفقات (Delivery Gate)' : 'بوابة الاعتماد والتحقق (Approval Gate)'}
              </h2>
            </div>
            <p style={styles.subtitle}>{task.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={styles.closeBtn}
            title="إغلاق"
            aria-label="إغلاق"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body: Two Columns */}
        <div style={styles.body}>
          {/* Column 1: Acceptance Criteria & Admin Override */}
          <div style={styles.col}>
            <div style={styles.sectionHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileCheck2 size={15} color="var(--accent-blue, #3b82f6)" />
                <span style={styles.sectionTitle}>معايير القبول (مطلوب التأشير عليها)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {checklist.length > 1 && (
                  <button
                    type="button"
                    onClick={handleToggleAll}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      borderRadius: 4,
                      padding: '2px 8px',
                      color: 'var(--text-secondary, #cbd5e1)',
                      fontSize: 11,
                      cursor: 'pointer',
                      transition: 'all 120ms ease',
                    }}
                  >
                    {allCriteriaChecked ? 'إلغاء تحديد الكل' : 'تحديد الكل كمعتمد'}
                  </button>
                )}
                <span
                  style={{
                    ...styles.counterBadge,
                    backgroundColor: allCriteriaChecked
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(245, 158, 11, 0.15)',
                    color: allCriteriaChecked ? '#10b981' : '#f59e0b',
                  }}
                >
                  {checklist.filter((c) => c.checked).length} / {checklist.length}
                </span>
              </div>
            </div>

            <div style={styles.checklistWrap}>
              {checklist.map((item, idx) => (
                <label
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  style={{
                    ...styles.checkItem,
                    borderColor: item.checked
                      ? 'rgba(16, 185, 129, 0.4)'
                      : 'rgba(255, 255, 255, 0.08)',
                    backgroundColor: item.checked
                      ? 'rgba(16, 185, 129, 0.08)'
                      : 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => {}}
                    style={styles.checkbox}
                  />
                  <span
                    style={{
                      ...styles.checkText,
                      color: item.checked
                        ? '#ffffff'
                        : 'var(--text-secondary, #cbd5e1)',
                    }}
                  >
                    {item.text}
                  </span>
                </label>
              ))}
            </div>

            {/* Return History Alert */}
            {Number(task.returnCount || 0) > 0 && (
              <div style={styles.returnNotice}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#f59e0b', fontWeight: 600 }}>
                  <RotateCcw size={12} />
                  <span>أعيدت للتعديل سابقاً {task.returnCount} مرات</span>
                </div>
                {task.lastReturnReason && (
                  <p style={{ margin: '4px 0 0', color: 'var(--text-muted, #94a3b8)', fontStyle: 'italic' }}>
                    «{task.lastReturnReason}»
                  </p>
                )}
              </div>
            )}

            {/* Admin / Owner Override */}
            {isAdminOrManager && (
              <div style={styles.overrideSection}>
                <label style={styles.overrideLabel}>
                  <input
                    type="checkbox"
                    checked={useOwnerOverride}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setUseOwnerOverride(val);
                      if (val && !ownerOverrideReason) {
                        setOwnerOverrideReason('اعتماد إداري مباشر للمهام السابقة');
                      }
                    }}
                    style={styles.checkbox}
                  />
                  <ShieldAlert size={15} color="#f43f5e" />
                  <span style={{ fontWeight: 600, color: '#f43f5e' }}>
                    اعتماد استثنائي للإدارة (Owner / Admin Override)
                  </span>
                </label>
                {useOwnerOverride && (
                  <div style={styles.overrideInputWrap}>
                    <input
                      type="text"
                      value={ownerOverrideReason}
                      onChange={(e) => setOwnerOverrideReason(e.target.value)}
                      placeholder="سبب التجاوز الاستثنائي (يسجل في سجل الاعتماد)..."
                      style={styles.overrideInput}
                    />
                    <span style={styles.overrideHint}>
                      يسمح باعتماد المهمة مباشرة حتى لو لم يكن لها دليل تسليم رقمي سابق.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Column 2: Evidence Dossier & 3 Slots Upload */}
          <div style={styles.colSecondary}>
            <div style={styles.sectionHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Paperclip size={14} color="var(--text-muted, #94a3b8)" />
                <span style={styles.sectionTitle}>ملف دليل التسليم (Delivery Evidence)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    fontSize: 10,
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontWeight: 700,
                    backgroundColor:
                      normalizedPriority === 'HIGH'
                        ? 'rgba(244, 63, 94, 0.15)'
                        : normalizedPriority === 'MEDIUM'
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(148, 163, 184, 0.15)',
                    color:
                      normalizedPriority === 'HIGH'
                        ? '#fb7185'
                        : normalizedPriority === 'MEDIUM'
                        ? '#60a5fa'
                        : '#94a3b8',
                  }}
                >
                  {normalizedPriority === 'HIGH'
                    ? 'عالية (إلزام كامل: ٣ صور)'
                    : normalizedPriority === 'MEDIUM'
                    ? 'متوسطة (إلزام أساسي)'
                    : 'منخفضة (مرنة)'}
                </span>

                {hasValidEvidence ? (
                  <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <CheckCircle2 size={12} />
                    مكتمل
                  </span>
                ) : (
                  <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <AlertTriangle size={12} />
                    نواقص ({missingFields.length})
                  </span>
                )}
              </div>
            </div>

            {/* Quick Multi-Drop Area */}
            <div
              style={{
                ...styles.multiDropArea,
                borderColor: draggingSlot === 'multi' ? 'var(--accent-blue, #3b82f6)' : 'rgba(255, 255, 255, 0.12)',
                backgroundColor: draggingSlot === 'multi' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDraggingSlot('multi');
              }}
              onDragLeave={() => setDraggingSlot(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDraggingSlot(null);
                if (e.dataTransfer.files) handleMultiFilesDrop(e.dataTransfer.files);
              }}
              onClick={() => multiInputRef.current?.click()}
            >
              <UploadCloud size={14} color="var(--accent-blue, #3b82f6)" />
              <span style={{ fontSize: 10.5, color: 'var(--text-secondary, #cbd5e1)' }}>
                اسحب حتى ٣ صور معاً لتوزيعها تلقائياً على الخانات (قبل / بعد / إثبات)
              </span>
              <input
                ref={multiInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files) handleMultiFilesDrop(e.target.files);
                }}
              />
            </div>

            {/* 3 Upload Slots Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {renderSlotBox(
                '١. صورة قبل التعديل (Before Image)',
                'before',
                beforeSlot,
                beforeInputRef,
                normalizedPriority === 'HIGH',
                'image/*'
              )}

              {renderSlotBox(
                '٢. صورة بعد التعديل (After Image)',
                'after',
                afterSlot,
                afterInputRef,
                normalizedPriority === 'HIGH',
                'image/*'
              )}

              {renderSlotBox(
                '٣. مرفق إثبات التشغيل (Proof of Work)',
                'proof',
                proofSlot,
                proofInputRef,
                normalizedPriority === 'HIGH',
                'image/*,.pdf,.zip,.log,.txt'
              )}
            </div>

            {/* Evidence Text Fields */}
            <div style={styles.formSection}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={styles.inputLabel}>
                    نوع التغيير {normalizedPriority !== 'LOW' && <span style={{ color: '#f43f5e' }}>*</span>}
                  </label>
                  <select
                    value={changeType}
                    onChange={(e) => setChangeType(e.target.value)}
                    style={styles.selectInput}
                  >
                    {CHANGE_TYPES.map((ct) => (
                      <option key={ct.value} value={ct.value}>
                        {ct.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={styles.inputLabel}>
                    الكوميت أو مسار الملفات {normalizedPriority !== 'LOW' && <span style={{ color: '#f43f5e' }}>*</span>}
                  </label>
                  <input
                    type="text"
                    value={commitOrPath}
                    onChange={(e) => setCommitOrPath(e.target.value)}
                    placeholder="e.g. feat(tasks): add gate / path/to/file"
                    style={styles.textInput}
                  />
                </div>
              </div>

              {normalizedPriority === 'HIGH' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
                  <div>
                    <label style={styles.inputLabel}>
                      الأرقام قبل / بعد <span style={{ color: '#f43f5e' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={numbersBeforeAfter}
                      onChange={(e) => setNumbersBeforeAfter(e.target.value)}
                      placeholder="e.g. 0/3 → 3/3 مرفقات معتمدة"
                      style={styles.textInput}
                    />
                  </div>

                  <div>
                    <label style={styles.inputLabel}>
                      نطاق ما لم يتم اختباره <span style={{ color: '#f43f5e' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={notTestedScope}
                      onChange={(e) => setNotTestedScope(e.target.value)}
                      placeholder="e.g. لا يوجد - تم اختبار كل السيناريوهات"
                      style={styles.textInput}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Missing Fields Alert Checklist */}
            {!hasValidEvidence && (
              <div style={styles.missingAlertBox}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#f59e0b', fontWeight: 600, fontSize: 11, marginBottom: 4 }}>
                  <AlertTriangle size={12} />
                  <span>متبقي لإتمام التسليم الرقمي ({missingFields.length} حقول):</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {missingFields.map((f, i) => (
                    <span key={i} style={styles.missingChip}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Return Drawer */}
        {returnMode && (
          <div style={styles.returnDrawer}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
              <div>
                <label style={styles.returnLabel}>
                  نوع سبب الإرجاع <span style={{ color: '#f43f5e' }}>*</span>
                </label>
                <select
                  value={returnReasonType}
                  onChange={(e) => setReturnReasonType(e.target.value)}
                  style={styles.returnSelect}
                >
                  <option value="WRONG_EXECUTION">خطأ في التنفيذ</option>
                  <option value="MISSING_EVIDENCE">نقص في أدلة الإنجاز</option>
                  <option value="CRITERIA_VIOLATION">مخالفة معايير القبول</option>
                  <option value="QUALITY">جودة دون المستوى</option>
                  <option value="LATE">تأخير في التسليم</option>
                </select>
              </div>
              <div>
                <label style={styles.returnLabel}>
                  درجة الشدة <span style={{ color: '#f43f5e' }}>*</span>
                </label>
                <select
                  value={returnSeverity}
                  onChange={(e) => setReturnSeverity(Number(e.target.value))}
                  style={styles.returnSelect}
                >
                  <option value={1}>بسيط (تعديلات طفيفة)</option>
                  <option value={2}>متوسط (نواقص مؤثرة)</option>
                  <option value={3}>جسيم (إعادة عمل كاملة)</option>
                </select>
              </div>
            </div>

            <label style={styles.returnLabel}>
              سبب الإرجاع للتعديل والملاحظات المطلوبة <span style={{ color: '#f43f5e' }}>* (إلزامي)</span>
            </label>
            <textarea
              rows={2}
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="اكتب بوضوح ما هو الناقص وما المطلوب من المنفذ تعديله أو إرفاقه قبل إعادة التسليم..."
              style={styles.returnTextarea}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setReturnMode(false)}
                style={styles.cancelBtn}
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleReturnSubmit}
                disabled={!returnReason.trim() || isSubmitting}
                style={{
                  ...styles.confirmReturnBtn,
                  opacity: !returnReason.trim() || isSubmitting ? 0.5 : 1,
                }}
              >
                تأكيد الإرجاع للمنفذ
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={styles.footer}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={styles.closeFooterBtn}
          >
            إغلاق
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!returnMode && !isSubmitForReview && (
              <button
                type="button"
                onClick={() => setReturnMode(true)}
                disabled={isSubmitting}
                style={styles.returnBtn}
              >
                <RotateCcw size={13} />
                <span>طلب تعديلات وإرجاع</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleApproveSubmit}
              disabled={!canApprove || isSubmitting || isAnySlotUploading}
              title={
                isAnySlotUploading
                  ? 'جاري رفع الملفات...'
                  : !hasValidEvidence && !useOwnerOverride
                  ? `ممنوع التسليم بدون استيفاء الأدلة: ${missingFields.join('، ')}`
                  : !allCriteriaChecked && !useOwnerOverride
                  ? 'يجب التأشير على جميع معايير القبول أولاً'
                  : isSubmitForReview
                  ? 'تسليم المهمة للمراجعة والاعتماد'
                  : 'اعتماد وإنجاز المهمة'
              }
              style={{
                ...styles.approveBtn,
                opacity: !canApprove || isSubmitting || isAnySlotUploading ? 0.5 : 1,
                cursor: canApprove && !isSubmitting && !isAnySlotUploading ? 'pointer' : 'not-allowed',
              }}
            >
              {isSubmitting || isAnySlotUploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : isSubmitForReview ? (
                <Send size={14} />
              ) : (
                <CheckCircle2 size={14} />
              )}
              <span>
                {isAnySlotUploading
                  ? 'جاري رفع المرفقات...'
                  : isSubmitting
                  ? 'جاري المعالجة...'
                  : useOwnerOverride
                  ? 'اعتماد بتجاوز الإدارة (Override)'
                  : isSubmitForReview
                  ? 'تسليم للمراجعة والاعتماد'
                  : 'اعتماد وإنجاز المهمة'}
              </span>
            </button>
          </div>
        </div>

        {/* Lightbox Modal */}
        {previewImgUrl && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              backgroundColor: 'rgba(0, 0, 0, 0.88)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setPreviewImgUrl(null)}
          >
            <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setPreviewImgUrl(null)}
                style={{
                  position: 'absolute',
                  top: -34,
                  right: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '50%',
                  width: 26,
                  height: 26,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={15} />
              </button>
              <img
                src={previewImgUrl}
                alt="معاينة إثبات التسليم"
                style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 6, objectFit: 'contain' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: 16,
  },
  modal: {
    width: '100%',
    maxWidth: 820,
    maxHeight: '92vh',
    backgroundColor: 'var(--bg-secondary, #121214)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 18px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  headerTitleWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: '#ffffff',
    margin: 0,
  },
  subtitle: {
    fontSize: 12,
    color: 'var(--text-muted, #94a3b8)',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 680,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted, #94a3b8)',
    cursor: 'pointer',
    padding: 6,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    display: 'grid',
    gridTemplateColumns: '1.1fr 1.3fr',
    gap: 16,
    padding: 16,
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  colSecondary: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 12,
    borderRadius: 8,
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#ffffff',
  },
  counterBadge: {
    fontSize: 10.5,
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: 10,
  },
  checklistWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  checkItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 120ms ease',
  },
  checkbox: {
    marginTop: 2,
    accentColor: '#10b981',
    cursor: 'pointer',
    width: 14,
    height: 14,
  },
  checkText: {
    fontSize: 11.5,
    lineHeight: 1.45,
    wordBreak: 'break-word',
  },
  returnNotice: {
    padding: '8px 10px',
    borderRadius: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    fontSize: 11,
  },
  overrideSection: {
    marginTop: 6,
    paddingTop: 10,
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  overrideLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11.5,
    cursor: 'pointer',
  },
  overrideInputWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    paddingRight: 20,
  },
  overrideInput: {
    width: '100%',
    height: 28,
    padding: '0 8px',
    borderRadius: 5,
    fontSize: 11,
    border: '1px solid rgba(244, 63, 94, 0.4)',
    backgroundColor: 'rgba(244, 63, 94, 0.06)',
    color: '#ffffff',
    outline: 'none',
  },
  overrideHint: {
    fontSize: 10,
    color: 'var(--text-muted, #94a3b8)',
  },
  multiDropArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px dashed',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  },
  slotCard: {
    borderRadius: 6,
    border: '1px solid',
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    transition: 'all 150ms ease',
  },
  slotHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#ffffff',
  },
  slotBadgeRequired: {
    fontSize: 9.5,
    fontWeight: 700,
    color: '#f43f5e',
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    padding: '1px 5px',
    borderRadius: 3,
  },
  slotBadgeOptional: {
    fontSize: 9.5,
    color: 'var(--text-muted, #94a3b8)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '1px 5px',
    borderRadius: 3,
  },
  slotBadgeSuccess: {
    fontSize: 9.5,
    fontWeight: 700,
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: '1px 5px',
    borderRadius: 3,
  },
  slotEmptyDropzone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    padding: '10px 8px',
    borderRadius: 4,
    border: '1px dashed rgba(255, 255, 255, 0.12)',
    cursor: 'pointer',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  slotProgressWrap: {
    padding: '6px 4px',
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'var(--accent-blue, #3b82f6)',
    borderRadius: 2,
    transition: 'width 150ms ease',
  },
  slotPreviewWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 6,
    borderRadius: 5,
  },
  slotThumbBox: {
    width: 44,
    height: 44,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  slotThumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  slotDocThumb: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotMetaWrap: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  slotFileName: {
    fontSize: 10.5,
    fontWeight: 600,
    color: '#ffffff',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  slotFileSize: {
    fontSize: 9.5,
    color: 'var(--text-muted, #94a3b8)',
  },
  slotViewBtn: {
    background: 'none',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: 3,
    padding: '2px 6px',
    color: 'var(--text-secondary, #cbd5e1)',
    fontSize: 10,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  },
  slotDeleteBtn: {
    background: 'rgba(244, 63, 94, 0.1)',
    border: '1px solid rgba(244, 63, 94, 0.25)',
    borderRadius: 3,
    padding: '2px 6px',
    color: '#f43f5e',
    fontSize: 10,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  },
  slotErrorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '4px 6px',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    border: '1px solid rgba(244, 63, 94, 0.25)',
    borderRadius: 4,
  },
  formSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 8,
    borderRadius: 6,
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  inputLabel: {
    display: 'block',
    fontSize: 10.5,
    fontWeight: 600,
    color: 'var(--text-secondary, #cbd5e1)',
    marginBottom: 3,
  },
  selectInput: {
    width: '100%',
    height: 28,
    padding: '0 6px',
    borderRadius: 4,
    fontSize: 10.5,
    backgroundColor: '#18181b',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#ffffff',
    outline: 'none',
  },
  textInput: {
    width: '100%',
    height: 28,
    padding: '0 6px',
    borderRadius: 4,
    fontSize: 10.5,
    backgroundColor: '#18181b',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#ffffff',
    outline: 'none',
  },
  missingAlertBox: {
    padding: '6px 8px',
    borderRadius: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
  },
  missingChip: {
    fontSize: 10,
    color: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    padding: '1px 6px',
    borderRadius: 3,
  },
  returnDrawer: {
    padding: '10px 18px',
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    borderTop: '1px solid rgba(245, 158, 11, 0.2)',
  },
  returnLabel: {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: '#f59e0b',
    marginBottom: 6,
  },
  returnSelect: {
    width: '100%',
    padding: '6px 8px',
    borderRadius: 6,
    fontSize: 11,
    backgroundColor: '#1e293b',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    color: '#ffffff',
    outline: 'none',
  },
  returnTextarea: {
    width: '100%',
    padding: 8,
    borderRadius: 6,
    fontSize: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    color: '#ffffff',
    outline: 'none',
    resize: 'none',
  },
  cancelBtn: {
    padding: '4px 10px',
    borderRadius: 5,
    fontSize: 11,
    border: '1px solid rgba(255, 255, 255, 0.15)',
    backgroundColor: 'transparent',
    color: 'var(--text-muted, #94a3b8)',
    cursor: 'pointer',
  },
  confirmReturnBtn: {
    padding: '4px 12px',
    borderRadius: 5,
    fontSize: 11,
    fontWeight: 600,
    backgroundColor: '#d97706',
    border: 'none',
    color: '#ffffff',
    cursor: 'pointer',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 18px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  closeFooterBtn: {
    padding: '6px 14px',
    borderRadius: 6,
    fontSize: 11.5,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'transparent',
    color: 'var(--text-muted, #94a3b8)',
    cursor: 'pointer',
  },
  returnBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 11.5,
    fontWeight: 600,
    border: '1px solid rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
    cursor: 'pointer',
  },
  approveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 16px',
    borderRadius: 6,
    fontSize: 11.5,
    fontWeight: 700,
    border: 'none',
    backgroundColor: '#10b981',
    color: '#ffffff',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
    transition: 'transform 120ms ease, opacity 120ms ease',
  },
};
