import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  CheckCheck,
  ExternalLink,
  Edit3,
  Clock,
  Play,
  Pause,
  Send,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Paperclip,
  ImageIcon,
  User,
  Calendar,
  Layers,
  Shield,
  Loader2,
  Check,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Maximize2,
  UploadCloud,
  Camera,
  Plus,
  Trash2,
} from 'lucide-react';
import { TaskDescriptionRenderer } from './TaskDescriptionRenderer';
import { AcceptanceCriteriaChecklist } from './AcceptanceCriteriaChecklist';
import { TaskSubtasks } from './TaskSubtasks';
import { TaskComments } from './TaskComments';
import { TaskActivityLog } from './TaskActivityLog';
import { TaskDependencyBadge } from './TaskDependencyBadge';
import { ReturnForRevisionModal } from './ReturnForRevisionModal';
import { audioAlerts } from '../../utils/audioAlerts';

interface TaskDetailDrawerProps {
  task: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (taskId: string, newStatus: string, revisionReason?: string, returnReasonType?: string, returnSeverity?: number) => void;
  onToggleStatus?: (taskId: string, currentStatus: string) => void;
  onEdit?: (task: any) => void;
  onOpenImage?: (imgUrl: string) => void;
  serverUrl?: string;
  authToken?: string;
  currentUserId?: string;
  isAdmin?: boolean;
  activeTaskId?: string | null;
  activeTaskIds?: Record<string, number>;
  activeRunnerSeconds?: number;
  onStartTask?: (task: any) => void;
  onStopTask?: (taskId?: string) => void;
  onOpenApprovalGate?: (task: any) => void;
  onOpenFullPage?: (task: any) => void;
  onUpdateCriteria?: (taskId: string, items: any[], allCompleted: boolean) => Promise<void>;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  isOpen,
  onClose,
  onUpdateStatus,
  onToggleStatus,
  onEdit,
  onOpenImage,
  serverUrl = 'https://maxp.online',
  authToken = '',
  currentUserId = '',
  isAdmin = false,
  activeTaskId = null,
  activeTaskIds,
  activeRunnerSeconds = 0,
  onStartTask,
  onStopTask,
  onOpenApprovalGate,
  onOpenFullPage,
  onUpdateCriteria,
}) => {
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [commentRefreshKey, setCommentRefreshKey] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [localWatching, setLocalWatching] = useState<boolean | null>(null);

  const [localAttachments, setLocalAttachments] = useState<any[]>(() => {
    return task?.taskAttachments || task?.attachments || [];
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [previewImgUrl, setPreviewImgUrl] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const bottomFileInputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (task) {
      setLocalAttachments(task.taskAttachments || task.attachments || []);
      setUploadError(null);
      setUploadSuccessMsg(null);
    }
  }, [task?.id, task?.taskAttachments, task?.attachments]);

  const safeCopy = async (text: string) => {
    try {
      if (window.electronAPI?.copyToClipboard) {
        await window.electronAPI.copyToClipboard(text);
        return true;
      }
    } catch {}
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      } catch {
        return false;
      }
    }
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewImgUrl) {
          setPreviewImgUrl(null);
          return;
        }
        if (isOpen && !isRevisionModalOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isRevisionModalOpen, previewImgUrl, onClose]);

  if (!isOpen || !task) return null;

  const rawStatus = String(task.status || '').toUpperCase();
  const isCompleted = rawStatus === 'COMPLETED';
  const isInReview = rawStatus === 'IN_REVIEW' || rawStatus === 'PENDING_REVIEW';
  const isInProgress = rawStatus === 'IN_PROGRESS';
  const isOnHold = rawStatus === 'ON_HOLD';

  const parsedTags: string[] = Array.isArray(task.tags)
    ? task.tags
    : typeof task.tags === 'string'
    ? (() => {
        try {
          const p = JSON.parse(task.tags);
          return Array.isArray(p) ? p : [task.tags];
        } catch {
          return task.tags.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      })()
    : [];
  const isReturnedForRevision = parsedTags.includes('needs_revision') || rawStatus === 'REVISION';

  const isMultiRunning = activeTaskIds ? activeTaskIds[task.id] !== undefined : false;
  const isRunning = !isCompleted && !isInReview && (activeTaskId === task.id || isMultiRunning);
  const currentElapsed = isMultiRunning && activeTaskIds ? activeTaskIds[task.id] : activeRunnerSeconds;

  const attachments = localAttachments;
  const watchers = task.taskWatchers || task.watchers || [];
  const isWatching = currentUserId
    ? watchers.some((w: any) => (w.userId || w.id || w.user?.id) === currentUserId)
    : false;
  const watching = localWatching !== null ? localWatching : Boolean(isWatching);

  const isUrgent = String(task.priority || '').toUpperCase() === 'URGENT';
  const isHigh = String(task.priority || '').toUpperCase() === 'HIGH';
  const isAssignedToMe = !task.assignedTo || task.assignedTo === currentUserId;
  const isCreatedByMe = task.createdBy === currentUserId;
  const canRunTask = isAssignedToMe;
  const canEditTask = isCreatedByMe || isAssignedToMe || isAdmin;
  const canApprove = isCreatedByMe || isAdmin;

  const creatorName =
    task.createdByName ||
    `${task.creator?.firstName || ''} ${task.creator?.lastName || ''}`.trim() ||
    task.creator?.email ||
    'غير محدد';

  const assigneeName =
    task.assignedToName ||
    task.assignee?.name ||
    `${task.assignee?.firstName || ''} ${task.assignee?.lastName || ''}`.trim() ||
    task.assignee?.email ||
    'غير محدد';

  const now = Date.now();
  const dueTime = task.dueDate ? new Date(task.dueDate).getTime() : null;
  const diffMs = dueTime ? dueTime - now : null;
  const isOverdue = !!dueTime && !isCompleted && diffMs! < 0;
  const isDueSoon = !!dueTime && !isCompleted && !isOverdue && diffMs! <= 24 * 60 * 60 * 1000;

  const getDueLabel = () => {
    if (!dueTime) return 'بدون موعد استحقاق';
    const d = new Date(task.dueDate);
    const dateStr = d.toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'short', year: 'numeric' });
    if (isOverdue) {
      const hours = Math.floor(Math.abs(diffMs!) / 3600000);
      const days = Math.floor(hours / 24);
      return `${dateStr} (متأخرة بـ ${days > 0 ? `${days} يوم` : `${hours} ساعة`})`;
    }
    if (isDueSoon) return `${dateStr} (يستحق قريباً خلال 24 ساعة)`;
    return dateStr;
  };

  const formatRunnerTimer = (sec: number): string => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const handleCopyDeepLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const deepLink = `${window.location.origin}${window.location.pathname}#/tasks/${task.id}`;
    await safeCopy(deepLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenInWeb = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetUrl = `${serverUrl.replace(/\/$/, '')}/tasks?taskId=${task.id}`;
    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(targetUrl);
    } else {
      window.open(targetUrl, '_blank');
    }
  };

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

  const handleImageClick = (url: string) => {
    if (onOpenImage) {
      onOpenImage(url);
    } else {
      setPreviewImgUrl(url);
    }
  };

  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0 || !task?.id) return;
    if (!window.electronAPI?.uploadTaskAttachment) {
      alert('خاصية رفع الملفات غير متاحة في البيئة الحالية');
      return;
    }

    setUploadingImage(true);
    setUploadError(null);
    setUploadSuccessMsg(null);

    let successCount = 0;
    try {
      const fileArray = Array.from(files);
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];

        if (file.size && file.size > 8 * 1024 * 1024) {
          const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
          throw new Error(`حجم الملف "${file.name}" (${sizeMB} ميجابايت) يتجاوز الحد الأقصى المسموح (8 ميجابايت)`);
        }

        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const originalName = file.name || `proof-${Date.now()}-${i + 1}.png`;
        const mimeType = file.type || 'image/png';

        const res = await window.electronAPI.uploadTaskAttachment({
          taskId: task.id,
          base64Data,
          originalName,
          mimeType,
        });

        if (res?.success && (res.attachment || res.data)) {
          successCount++;
          const newAtt = res.attachment || res.data;
          setLocalAttachments((prev) => [newAtt, ...prev.filter((a) => a.id !== newAtt.id)]);

          const currentAtts = Array.isArray(task.taskAttachments) ? task.taskAttachments : [];
          task.taskAttachments = [newAtt, ...currentAtts.filter((a: any) => a.id !== newAtt.id)];
          task.hasEvidence = true;
          task.missingEvidence = false;
        } else {
          throw new Error(res?.error || 'فشل في حفظ المرفق على الخادم');
        }
      }

      if (successCount > 0) {
        audioAlerts.playTaskComplete();
        setUploadSuccessMsg(`تم رفع ${successCount} صورة بنجاح كدليل إنجاز للمهمة ✅`);
        setTimeout(() => setUploadSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      console.error('[TaskDetailDrawer] Upload error:', err);
      setUploadError(err?.message || 'حدث خطأ أثناء رفع الصور');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (bottomFileInputRef.current) bottomFileInputRef.current.value = '';
    }
  };

  const handleDeleteAttachment = async (e: React.MouseEvent, attId: string) => {
    e.stopPropagation();
    if (!attId) return;
    if (!confirm('هل أنت متأكد من حذف هذا المرفق؟')) return;
    try {
      if (window.electronAPI?.deleteTaskAttachment) {
        await window.electronAPI.deleteTaskAttachment(attId);
      }
      setLocalAttachments((prev) => prev.filter((a) => a.id !== attId));
      if (task && Array.isArray(task.taskAttachments)) {
        task.taskAttachments = task.taskAttachments.filter((a: any) => a.id !== attId);
      }
    } catch (err: any) {
      console.warn('[TaskDetailDrawer] Failed to delete attachment:', err);
      alert(err?.message || 'فشل في حذف المرفق');
    }
  };

  const handleCaptureSnippet = async () => {
    if (!window.electronAPI?.captureDesktopSnippet) {
      alert('يمكنك أخذ لقطة شاشة باستخدام (Win + Shift + S) ثم الضغط على Ctrl + V للصقها مباشرة هنا!');
      return;
    }
    setUploadingImage(true);
    setUploadError(null);
    try {
      const res = await window.electronAPI.captureDesktopSnippet();
      if (res?.dataUrl) {
        const uploadRes = await window.electronAPI.uploadTaskAttachment({
          taskId: task.id,
          base64Data: res.dataUrl,
          originalName: `screenshot-${Date.now()}.png`,
          mimeType: 'image/png',
        });
        if (uploadRes?.success && uploadRes.attachment) {
          setLocalAttachments((prev) => [uploadRes.attachment, ...prev]);
          if (!task.taskAttachments) task.taskAttachments = [];
          task.taskAttachments.unshift(uploadRes.attachment);
          task.hasEvidence = true;
          task.missingEvidence = false;
          audioAlerts.playTaskComplete();
          setUploadSuccessMsg('تم التقاط وحفظ لقطة الشاشة كدليل إنجاز ✅');
          setTimeout(() => setUploadSuccessMsg(null), 4000);
        } else {
          setUploadError(uploadRes?.error || 'فشل في حفظ لقطة الشاشة على الخادم');
        }
      } else if (res?.error) {
        setUploadError(res.error);
      }
    } catch (err: any) {
      console.warn('[CaptureSnippet] Error:', err);
      setUploadError(err?.message || 'تعذر التقاط لقطة الشاشة');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleContainerPaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length > 0) {
      e.preventDefault();
      await handleUploadFiles(files);
    }
  };

  // Fixed Bottom Write Bar comment submit
  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || sendingComment || !window.electronAPI?.addTaskComment) return;

    setSendingComment(true);
    try {
      const res = await window.electronAPI.addTaskComment(task.id, text);
      if (res?.success) {
        setCommentText('');
        audioAlerts.playTaskComplete();
        setCommentRefreshKey((prev) => prev + 1);
      } else {
        alert(res?.error || 'فشل في إرسال التعليق');
      }
    } catch (err: any) {
      alert(err?.message || 'حدث خطأ أثناء إرسال التعليق');
    } finally {
      setSendingComment(false);
    }
  };

  const visibilityReason = isAssignedToMe
    ? { label: 'مكلف بالتنفيذ', bg: 'rgba(56, 189, 248, 0.12)', color: 'var(--accent-blue)' }
    : isCreatedByMe
    ? { label: 'أنشأتها', bg: 'rgba(168, 85, 247, 0.12)', color: 'var(--accent-purple-soft)' }
    : isWatching
    ? { label: 'متابع', bg: 'var(--accent-green-bg)', color: 'var(--accent-green)' }
    : isAdmin
    ? { label: 'إشراف إداري', bg: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24' }
    : { label: 'فريق', bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' };

  return (
    <>
      {/* Backdrop Overlay */}
      <div style={drawerStyles.overlay} onClick={onClose}>
        {/* Slide-over Drawer Panel */}
        <div
          style={drawerStyles.drawer}
          onClick={(e) => e.stopPropagation()}
          onPaste={handleContainerPaste}
          dir="rtl"
        >
          {/* SECTION 1: FIXED STICKY HEADER */}
          <div style={drawerStyles.stickyHeader}>
            {/* Top Action Nav Bar */}
            <div style={drawerStyles.headerTopNav}>
              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                style={drawerStyles.closeBtn}
                title="إغلاق اللوحة (Esc)"
              >
                <X size={15} />
                <span style={{ fontSize: 11, fontWeight: 500 }}>إغلاق</span>
              </button>

              {/* Utility Tools: Copy-Description, Watch, Deep-Link, Edit, Web — relocated from the task row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  onClick={async () => {
                    await safeCopy(task.description || '');
                    setCopiedDesc(true);
                    setTimeout(() => setCopiedDesc(false), 2000);
                  }}
                  style={{
                    ...drawerStyles.iconToolBtn,
                    color: copiedDesc ? 'var(--accent-green, var(--accent-green))' : 'var(--text-dim)',
                  }}
                  title={copiedDesc ? 'تم نسخ وصف المهمة!' : 'نسخ وصف المهمة'}
                >
                  {copiedDesc ? <CheckCheck size={12} /> : <Copy size={12} />}
                  <span style={{ fontSize: 10.5 }}>{copiedDesc ? 'تم النسخ' : 'نسخ الوصف'}</span>
                </button>

                {currentUserId && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        if (watching) await window.electronAPI.removeWatcher(task.id, currentUserId);
                        else await window.electronAPI.addWatcher(task.id, currentUserId);
                        setLocalWatching(!watching);
                      } catch {}
                    }}
                    style={{
                      ...drawerStyles.iconToolBtn,
                      color: watching ? 'var(--accent-blue)' : 'var(--text-dim)',
                    }}
                    title={watching ? 'إلغاء متابعة المهمة' : 'متابعة المهمة لتصلك التحديثات'}
                  >
                    {watching ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span style={{ fontSize: 10.5 }}>{watching ? 'إلغاء المتابعة' : 'متابعة'}</span>
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  onClick={handleCopyDeepLink}
                  style={{
                    ...drawerStyles.iconToolBtn,
                    color: copiedLink ? 'var(--accent-green, var(--accent-green))' : 'var(--text-dim)',
                  }}
                  title={copiedLink ? 'تم نسخ رابط المهمة!' : 'نسخ رابط مباشر للمهمة'}
                >
                  {copiedLink ? <CheckCheck size={12} /> : <LinkIcon size={12} />}
                  <span style={{ fontSize: 10.5 }}>{copiedLink ? 'تم النسخ' : 'رابط المهمة'}</span>
                </button>

                {canEditTask && onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(task)}
                    style={drawerStyles.iconToolBtn}
                    title="تعديل المهمة بالكامل"
                  >
                    <Edit3 size={12} />
                    <span style={{ fontSize: 10.5 }}>تعديل</span>
                  </button>
                )}

                {onOpenFullPage && (
                  <button
                    type="button"
                    onClick={() => onOpenFullPage(task)}
                    style={drawerStyles.iconToolBtn}
                    title="فتح كصفحة مستقلة كاملة (Full Cockpit Page)"
                  >
                    <Maximize2 size={12} color="var(--accent-blue)" />
                    <span style={{ fontSize: 10.5 }}>صفحة كاملة</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleOpenInWeb}
                  style={drawerStyles.iconToolBtn}
                  title="فتح المهمة في المتصفح"
                >
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>

            {/* Task Title & Status Badges */}
            <div style={drawerStyles.headerMain}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2
                  dir="auto"
                  style={drawerStyles.taskTitle}
                  title={task.title}
                >
                  {task.title}
                </h2>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await safeCopy(task.title || '');
                    setCopiedTitle(true);
                    setTimeout(() => setCopiedTitle(false), 2000);
                  }}
                  style={{
                    ...drawerStyles.iconToolBtn,
                    padding: '2px 7px',
                    borderRadius: 4,
                    color: copiedTitle ? 'var(--accent-green)' : 'var(--text-dim)',
                  }}
                  title={copiedTitle ? 'تم نسخ العنوان!' : 'نسخ عنوان المهمة'}
                >
                  {copiedTitle ? <CheckCheck size={12} /> : <Copy size={12} />}
                  <span style={{ fontSize: 10 }}>{copiedTitle ? 'تم النسخ' : 'نسخ العنوان'}</span>
                </button>
              </div>

              {/* Badges Strip */}
              <div style={drawerStyles.badgeStrip}>
                {/* Status Badge */}
                <span
                  style={{
                    ...drawerStyles.statusPill,
                    backgroundColor: isCompleted
                      ? 'var(--accent-green-bg)'
                      : isInReview
                      ? 'rgba(168, 85, 247, 0.12)'
                      : isReturnedForRevision
                      ? 'rgba(245, 158, 11, 0.12)'
                      : isRunning
                      ? 'rgba(56, 189, 248, 0.15)'
                      : 'rgba(255, 255, 255, 0.05)',
                    color: isCompleted
                      ? 'var(--accent-green)'
                      : isInReview
                      ? 'var(--accent-purple-soft)'
                      : isReturnedForRevision
                      ? 'var(--accent-yellow)'
                      : isRunning
                      ? 'var(--accent-blue)'
                      : 'var(--text-muted)',
                  }}
                >
                  {isCompleted
                    ? 'مكتملة'
                    : isInReview
                    ? 'بانتظار الاعتماد'
                    : isReturnedForRevision
                    ? 'مُعادة للتعديل'
                    : isRunning
                    ? 'قيد العمل الآن'
                    : 'قيد التنفيذ'}
                </span>

                {/* Priority Badge */}
                {isUrgent ? (
                  <span style={drawerStyles.urgentPill}>
                    <AlertCircle size={10} />
                    <span>عاجل</span>
                  </span>
                ) : isHigh ? (
                  <span style={drawerStyles.highPill}>
                    <span>مرتفع</span>
                  </span>
                ) : (
                  <span style={drawerStyles.normalPill}>عادي</span>
                )}

                {/* Visibility Reason */}
                <span
                  style={{
                    ...drawerStyles.visibilityPill,
                    backgroundColor: visibilityReason.bg,
                    color: visibilityReason.color,
                  }}
                >
                  {visibilityReason.label}
                </span>

                {/* Running Timer Live Counter */}
                {isRunning && (
                  <span style={drawerStyles.runningLiveTicker}>
                    <span style={drawerStyles.liveDot} />
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatRunnerTimer(currentElapsed)}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Revision Alert Banner */}
            {isReturnedForRevision && !isCompleted && (
              <div style={drawerStyles.revisionBanner}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RotateCcw size={13} color="var(--accent-yellow)" />
                  <span style={{ fontWeight: 600, color: 'var(--accent-yellow)', fontSize: 11.5 }}>
                    تمت إعادة المهمة من المشرف لإجراء تعديلات
                  </span>
                </div>
                {task.revisionReason && (
                  <div style={drawerStyles.revisionReasonText}>
                    <strong>ملاحظات الإرجاع:</strong> {task.revisionReason}
                  </div>
                )}
              </div>
            )}

            {/* Sticky Action Toolbar */}
            <div style={drawerStyles.toolbar}>
              {isCompleted ? (
                <button
                  type="button"
                  onClick={() => {
                    audioAlerts.playTaskReopen();
                    onUpdateStatus ? onUpdateStatus(task.id, 'IN_PROGRESS') : onToggleStatus?.(task.id, task.status);
                  }}
                  style={drawerStyles.secondaryActionBtn}
                >
                  <RotateCcw size={12} />
                  <span>إعادة فتح المهمة</span>
                </button>
              ) : isInReview ? (
                canApprove ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                    <button
                      type="button"
                      onClick={() => {
                        audioAlerts.playTaskComplete();
                        if (onOpenApprovalGate) {
                          onOpenApprovalGate(task);
                        } else {
                          onUpdateStatus ? onUpdateStatus(task.id, 'COMPLETED') : onToggleStatus?.(task.id, 'COMPLETED');
                        }
                      }}
                      style={drawerStyles.approveActionBtn}
                      title="اعتماد وإنجاز المهمة (بوابة الاعتماد)"
                    >
                      <CheckCircle2 size={13} />
                      <span>اعتماد المهمة وإنجازها</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRevisionModalOpen(true)}
                      style={drawerStyles.returnActionBtn}
                    >
                      <RotateCcw size={12} />
                      <span>طلب تعديلات وإرجاع</span>
                    </button>
                  </div>
                ) : (
                  <div style={drawerStyles.pendingReviewNotice}>
                    المهمة تم تسليمها وبانتظار اعتماد المشرف.
                  </div>
                )
              ) : isRunning ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                  <button
                    type="button"
                    onClick={() => onStopTask?.(task.id)}
                    style={drawerStyles.pauseActionBtn}
                  >
                    <Pause size={12} />
                    <span>إيقاف المؤقت</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      audioAlerts.playTaskComplete();
                      if (onOpenApprovalGate) {
                        onOpenApprovalGate(task);
                      } else {
                        onUpdateStatus ? onUpdateStatus(task.id, 'IN_REVIEW') : onToggleStatus?.(task.id, 'IN_REVIEW');
                      }
                    }}
                    style={drawerStyles.submitActionBtn}
                  >
                    <Send size={12} />
                    <span>تسليم للمراجعة والاعتماد</span>
                  </button>
                </div>
              ) : canRunTask ? (
                <button
                  type="button"
                  onClick={() => {
                    audioAlerts.playTaskStart();
                    onStartTask?.(task);
                  }}
                  style={drawerStyles.startActionBtn}
                >
                  <Play size={12} fill="#ffffff" />
                  <span>بدء العمل على المهمة واحتساب الوقت</span>
                </button>
              ) : (
                <div style={drawerStyles.disabledNotice}>
                  المهمة مسندة للزميل {assigneeName} (لا تملك صلاحية تشغيلها).
                </div>
              )}

              {/* Admin Direct Complete Shortcut */}
              {canApprove && !isCompleted && !isInReview && (
                <button
                  type="button"
                  onClick={() => {
                    audioAlerts.playTaskComplete();
                    onUpdateStatus ? onUpdateStatus(task.id, 'COMPLETED') : onToggleStatus?.(task.id, task.status);
                  }}
                  style={drawerStyles.directDoneBtn}
                  title="إنجاز مباشر كـ مكتملة دون إرسالها للمراجعة (صلاحية إدارية)"
                >
                  <Check size={11} />
                  <span>إنجاز مباشر</span>
                </button>
              )}
            </div>
          </div>

          {/* SCROLLABLE DRAWER BODY (Sections 2 to 7) */}
          <div style={drawerStyles.scrollBody}>
            {/* SECTION: DELIVERY EVIDENCE DOSSIER */}
            {(task.hasEvidence || task.evidence || task.missingEvidence) && (
              <div
                style={{
                  ...drawerStyles.cardSection,
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  backgroundColor: 'rgba(59, 130, 246, 0.03)',
                }}
              >
                <div style={drawerStyles.sectionHeaderRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Shield size={14} color="var(--accent-blue)" />
                    <span style={drawerStyles.sectionTitle}>
                      ملف دليل التسليم والإنجاز (Delivery Evidence)
                    </span>
                  </div>
                  {task.returnCount && task.returnCount > 0 ? (
                    <span style={{ fontSize: 11, color: '#f97316', fontWeight: 600 }}>
                      أعيدت للتعديل {task.returnCount} مرات
                    </span>
                  ) : null}
                </div>

                {task.missingEvidence || !task.evidence ? (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.5 }}>
                    لم يتم إرفاق ملف دليل تشغيل رقمي (اختياري).
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, marginTop: 8, fontSize: 11 }}>
                    {task.evidence?.changeType && (
                      <div style={{ padding: 6, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 10 }}>نوع التغيير</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{task.evidence.changeType}</span>
                      </div>
                    )}
                    {task.evidence?.commitOrPath && (
                      <div style={{ padding: 6, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 10 }}>الكوميت / المسار</span>
                        <code style={{ fontSize: 10, wordBreak: 'break-all' }}>{task.evidence.commitOrPath}</code>
                      </div>
                    )}
                    {task.evidence?.numbersBeforeAfter && (
                      <div style={{ padding: 6, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 10 }}>الأرقام قبل / بعد</span>
                        <span>{task.evidence.numbersBeforeAfter}</span>
                      </div>
                    )}
                    {task.evidence?.notTestedScope && (
                      <div style={{ padding: 6, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 10 }}>ما لم يتم اختباره</span>
                        <span style={{ color: '#f59e0b' }}>{task.evidence.notTestedScope}</span>
                      </div>
                    )}
                    {task.evidence?.agentInfo?.isAgent && (
                      <div style={{ gridColumn: '1 / -1', padding: 6, borderRadius: 6, backgroundColor: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        <span style={{ color: '#a78bfa', display: 'block', fontSize: 10, fontWeight: 600 }}>
                          وكيل ذكاء اصطناعي: {task.evidence.agentInfo.agentName || 'AI Agent'} (Run: {task.evidence.agentInfo.commitOrRunId})
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          ناتج الفحص: {task.evidence.agentInfo.testOutput}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 2: DESCRIPTION */}
            <div style={drawerStyles.cardSection}>
              <TaskDescriptionRenderer description={task.description || ''} />
            </div>

            {/* ACCEPTANCE CRITERIA CHECKLIST (معايير القبول والتسليم) */}
            {(task.acceptanceCriteria || task.criteriaChecklist || canEditTask) && (
              <div style={drawerStyles.cardSection}>
                <AcceptanceCriteriaChecklist
                  value={task.criteriaChecklist || task.acceptanceCriteria || ''}
                  readOnly={true}
                  interactive={true}
                  taskId={task.id}
                  canEdit={canEditTask}
                  onCriteriaChange={
                    onUpdateCriteria
                      ? (items, allCompleted) => onUpdateCriteria(task.id, items, allCompleted)
                      : undefined
                  }
                />
              </div>
            )}

            {/* SECTION: PROOF OF WORK & DELIVERY EVIDENCE (دليل إثبات الإنجاز والصور) */}
            <div
              style={{
                ...drawerStyles.cardSection,
                border: attachments.length > 0
                  ? '1px solid rgba(16, 185, 129, 0.35)'
                  : '1px solid rgba(59, 130, 246, 0.3)',
                backgroundColor: attachments.length > 0
                  ? 'rgba(16, 185, 129, 0.04)'
                  : 'rgba(59, 130, 246, 0.03)',
              }}
            >
              <div style={drawerStyles.sectionHeaderRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Camera size={14} color={attachments.length > 0 ? '#10b981' : 'var(--accent-blue)'} />
                  <span style={{ ...drawerStyles.sectionTitle, color: 'var(--text-primary)', fontWeight: 700 }}>
                    دليل إثبات الإنجاز والصور المرفقة (Proof of Work)
                  </span>
                  {attachments.length > 0 && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        padding: '1px 6px',
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <CheckCircle2 size={10} />
                      {attachments.length} صور
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      backgroundColor: 'var(--accent-blue)',
                      border: 'none',
                      borderRadius: 4,
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '4px 9px',
                      cursor: uploadingImage ? 'default' : 'pointer',
                      opacity: uploadingImage ? 0.6 : 1,
                      transition: 'opacity 120ms ease',
                    }}
                    title="رفع صور أو سكرين شوت يثبت إنجاز المهمة لتمريرها للاعتماد"
                  >
                    {uploadingImage ? <Loader2 size={12} className="spin" /> : <Plus size={12} />}
                    <span>{uploadingImage ? 'جاري الرفع...' : 'رفع صور الإنجاز'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCaptureSnippet}
                    disabled={uploadingImage}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 4,
                      color: 'var(--text-secondary)',
                      fontSize: 11,
                      padding: '4px 8px',
                      cursor: 'pointer',
                    }}
                    title="التقاط لقطة شاشة سريعة (أو اضغط Win+Shift+S ثم Ctrl+V)"
                  >
                    <Camera size={11} />
                    <span>لقطة شاشة</span>
                  </button>
                </div>
              </div>

              {/* Success & Error alerts */}
              {uploadSuccessMsg && (
                <div style={{ fontSize: 11, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '6px 10px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={13} />
                  <span>{uploadSuccessMsg}</span>
                </div>
              )}
              {uploadError && (
                <div style={{ fontSize: 11, color: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.1)', padding: '6px 10px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={13} />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Gallery or Drop Zone */}
              {attachments.length > 0 ? (
                <div>
                  <div style={drawerStyles.attachGallery}>
                    {attachments.map((att: any, idx: number) => {
                      const rawPath = att.filePath || '';
                      const fullUrl = resolveAttachmentUrl(rawPath);
                      const isImg = isImgAttachment(att);
                      const label = att.originalName || att.fileName || `إثبات ${idx + 1}`;

                      return (
                        <div
                          key={att.id || att.fileName || idx}
                          onClick={() => handleImageClick(fullUrl)}
                          style={drawerStyles.attCard}
                          title={`معاينة وتكبير: ${label}`}
                        >
                          {isImg ? (
                            <div style={drawerStyles.imgWrap}>
                              <img
                                src={fullUrl}
                                alt={label}
                                style={drawerStyles.thumbImg}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.opacity = '0.3';
                                }}
                              />
                              <div style={drawerStyles.imgOverlay}>
                                <ImageIcon size={10} color="#ffffff" />
                              </div>
                            </div>
                          ) : (
                            <div style={drawerStyles.docThumb}>
                              <Paperclip size={14} color="var(--text-muted)" />
                            </div>
                          )}
                          <div style={drawerStyles.attInfo}>
                            <span style={drawerStyles.thumbName}>{label}</span>
                            {att.fileSize && (
                              <span style={drawerStyles.thumbSize}>
                                {Math.round(att.fileSize / 1024)} KB
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p style={{ fontSize: 11, color: '#10b981', margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={12} />
                    <span>تم تسجيل صور الإنجاز — تظهر للمشرف في بوابة الاعتماد كدليل تسليم لتمرير المهمة.</span>
                  </p>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '1px dashed rgba(255, 255, 255, 0.16)',
                    borderRadius: 6,
                    padding: '16px 12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    transition: 'all 120ms ease',
                  }}
                  title="انقر لرفع صور أو سكرين شوت"
                >
                  <UploadCloud size={24} color="var(--accent-blue)" style={{ margin: '0 auto 6px' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                    اضغط هنا لرفع صور أو سكرين شوت يثبت إنجاز المهمة
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    يدعم أيضاً لصق الصور فوراً بـ (Ctrl + V) بعد أخذ لقطة شاشة
                  </span>
                </div>
              )}
            </div>

            {/* AI BRIEF (وصف الذكاء الاصطناعي) */}
            {task.aiDescription ? (
              <div
                style={{
                  ...drawerStyles.cardSection,
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  background: 'rgba(168, 85, 247, 0.04)',
                  borderRadius: 8,
                  padding: '12px 14px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontWeight: 700,
                      fontSize: 13,
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span>وصف الذكاء الاصطناعي (AI Brief)</span>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: 'rgba(168, 85, 247, 0.15)',
                      color: '#c084fc',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                    }}
                  >
                    AI
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    lineHeight: 1.6,
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                  }}
                >
                  {task.aiDescription}
                </div>
              </div>
            ) : null}

            {/* SECTION 3: SUBTASKS */}
            <div style={drawerStyles.cardSection}>
              <TaskSubtasks taskId={task.id} canEdit={canEditTask} />
            </div>

            {/* SECTION 4: COMMENTS */}
            <div style={drawerStyles.cardSection}>
              <TaskComments
                taskId={task.id}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                hideInputBar={true}
                refreshKey={commentRefreshKey}
              />
            </div>

            {/* SECTION 5: ATTACHMENTS GALLERY */}
            {attachments.length > 0 && (
              <div style={drawerStyles.cardSection}>
                <div style={drawerStyles.sectionHeaderRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Paperclip size={13} color="var(--accent-blue)" />
                    <span style={drawerStyles.sectionTitle}>المرفقات والملفات</span>
                    <span style={drawerStyles.sectionCountBadge}>{attachments.length}</span>
                  </div>
                </div>

                <div style={drawerStyles.attachGallery}>
                  {attachments.map((att: any, idx: number) => {
                    const rawPath = att.filePath || '';
                    const fullUrl = resolveAttachmentUrl(rawPath);
                    const isImg = isImgAttachment(att);
                    const label = att.originalName || att.fileName || `مرفق ${idx + 1}`;

                    return (
                      <div
                        key={att.id || att.fileName || idx}
                        onClick={() => onOpenImage?.(fullUrl)}
                        style={drawerStyles.attCard}
                        title={`معاينة: ${label}`}
                      >
                        {isImg ? (
                          <div style={drawerStyles.imgWrap}>
                            <img
                              src={fullUrl}
                              alt={label}
                              style={drawerStyles.thumbImg}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.opacity = '0.3';
                              }}
                            />
                            <div style={drawerStyles.imgOverlay}>
                              <ImageIcon size={10} color="#ffffff" />
                            </div>
                          </div>
                        ) : (
                          <div style={drawerStyles.docThumb}>
                            <Paperclip size={14} color="var(--text-muted)" />
                          </div>
                        )}
                        <div style={drawerStyles.attInfo}>
                          <span style={drawerStyles.thumbName}>{label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 2 }}>
                            {att.fileSize ? (
                              <span style={drawerStyles.thumbSize}>
                                {Math.round(att.fileSize / 1024)} KB
                              </span>
                            ) : <span />}
                            {att.id && (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteAttachment(e, att.id)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#f43f5e',
                                  cursor: 'pointer',
                                  padding: '1px 3px',
                                  borderRadius: 3,
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                title="حذف هذا المرفق"
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 6: META BLOCK */}
            <div style={drawerStyles.cardSection}>
              <div style={drawerStyles.sectionHeaderRow}>
                <span style={drawerStyles.sectionTitle}>بيانات المهمة والمكلفين</span>
              </div>

              <div style={drawerStyles.metaGrid}>
                {/* Assignee */}
                <div style={drawerStyles.metaItem}>
                  <span style={drawerStyles.metaLabel}>المكلف بالتنفيذ</span>
                  <div style={drawerStyles.metaValue}>
                    <div style={drawerStyles.miniAvatar}>
                      {assigneeName.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500 }}>{assigneeName}</span>
                  </div>
                </div>

                {/* Creator */}
                <div style={drawerStyles.metaItem}>
                  <span style={drawerStyles.metaLabel}>أنشأها</span>
                  <div style={drawerStyles.metaValue}>
                    <div style={drawerStyles.miniAvatar}>
                      {creatorName.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500 }}>{creatorName}</span>
                  </div>
                </div>

                {/* Due Date */}
                <div style={drawerStyles.metaItem}>
                  <span style={drawerStyles.metaLabel}>تاريخ الاستحقاق</span>
                  <div style={drawerStyles.metaValue}>
                    <Calendar size={13} color={isOverdue ? 'var(--accent-red)' : isDueSoon ? 'var(--accent-yellow)' : 'var(--text-muted)'} />
                    <span
                      style={{
                        color: isOverdue ? 'var(--accent-red)' : isDueSoon ? 'var(--accent-yellow)' : 'inherit',
                        fontWeight: isOverdue ? 600 : 400,
                      }}
                    >
                      {getDueLabel()}
                    </span>
                  </div>
                </div>

                {/* Estimated Time */}
                <div style={drawerStyles.metaItem}>
                  <span style={drawerStyles.metaLabel}>الوقت المقدر</span>
                  <div style={drawerStyles.metaValue}>
                    <Clock size={13} color="var(--text-muted)" />
                    <span>
                      {task.estimatedMinutes
                        ? `${task.estimatedMinutes} دقيقة`
                        : task.estimatedHours
                        ? `${task.estimatedHours} ساعة`
                        : 'غير محدد'}
                    </span>
                  </div>
                </div>

                {/* Actual Tracked Time */}
                <div style={drawerStyles.metaItem}>
                  <span style={drawerStyles.metaLabel}>الوقت الفعلي المسجل</span>
                  <div style={drawerStyles.metaValue}>
                    <Clock size={13} color="var(--accent-green)" />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {(() => {
                        const mins = Math.round(
                          Number(
                            task.totalDuration ??
                            task.total_duration ??
                            task.actualMinutes ??
                            task.totalTimeMinutes ??
                            (task.totalSeconds ? task.totalSeconds / 60 : null) ??
                            (task.actualHours ? task.actualHours * 60 : 0)
                          )
                        );
                        if (!mins || mins === 0) return '0 دقيقة';
                        const h = Math.floor(mins / 60);
                        const m = mins % 60;
                        if (h === 0) return `${m} دقيقة`;
                        return `${h} س ${m > 0 ? `${m} د` : ''}`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dependencies Section inside Meta */}
              <div style={{ marginTop: 10 }}>
                <TaskDependencyBadge taskId={task.id} />
              </div>
            </div>

            {/* SECTION 7: ACTIVITY LOG */}
            <div style={drawerStyles.cardSection}>
              <TaskActivityLog taskId={task.id} isTaskReturned={isReturnedForRevision} />
            </div>
          </div>

          {/* FIXED BOTTOM COMMENT WRITE-BAR */}
          <div style={drawerStyles.fixedBottomBar}>
            {uploadingImage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 11, color: 'var(--accent-blue)' }}>
                <Loader2 size={12} className="spin" />
                <span>جاري رفع الصورة وإرفاقها بالمهمة...</span>
              </div>
            )}
            <form onSubmit={handleSendComment} style={drawerStyles.bottomForm}>
              <button
                type="button"
                onClick={() => bottomFileInputRef.current?.click()}
                disabled={uploadingImage}
                style={{
                  height: 36,
                  width: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 6,
                  color: 'var(--accent-blue)',
                  cursor: uploadingImage ? 'default' : 'pointer',
                  flexShrink: 0,
                  transition: 'background-color 100ms ease',
                }}
                title="إرفاق صورة أو سكرين شوت للمهمة"
              >
                <Camera size={15} />
              </button>

              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onPaste={handleContainerPaste}
                placeholder="اكتب ملاحظة أو تعليقاً على المهمة… (يدعم لصق الصور بـ Ctrl+V)"
                style={drawerStyles.bottomInput}
                disabled={sendingComment}
              />
              <button
                type="submit"
                disabled={sendingComment || !commentText.trim()}
                style={{
                  ...drawerStyles.bottomSendBtn,
                  opacity: sendingComment || !commentText.trim() ? 0.5 : 1,
                  cursor: sendingComment || !commentText.trim() ? 'default' : 'pointer',
                }}
                title="إرسال التعليق فوراً"
              >
                {sendingComment ? <Loader2 size={13} className="spin" /> : <Send size={13} />}
                <span>إرسال</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Return for Revision Modal */}
      {isRevisionModalOpen && (
        <ReturnForRevisionModal
          isOpen={isRevisionModalOpen}
          onClose={() => setIsRevisionModalOpen(false)}
          onConfirm={async (reason: string, returnReasonType?: string, returnSeverity?: number) => {
            if (onUpdateStatus) {
              await onUpdateStatus(task.id, 'IN_PROGRESS', reason, returnReasonType, returnSeverity);
            }
          }}
          task={task}
        />
      )}

      {/* Hidden File Inputs for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.zip,.log,.txt"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files) handleUploadFiles(e.target.files);
        }}
      />
      <input
        ref={bottomFileInputRef}
        type="file"
        accept="image/*,.pdf,.zip,.log,.txt"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files) handleUploadFiles(e.target.files);
        }}
      />

      {/* Image Preview Lightbox Modal */}
      {previewImgUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(5px)',
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
                top: -36,
                right: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="إغلاق المعاينة"
            >
              <X size={16} />
            </button>
            <img
              src={previewImgUrl}
              alt="معاينة إثبات المهمة"
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                borderRadius: 8,
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

const drawerStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 32,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(3px)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-start', // Docks on left side
    animation: 'fadeIn 140ms ease-out',
  },
  drawer: {
    width: '100%',
    maxWidth: 540,
    height: '100%',
    backgroundColor: '#0c0d0e',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '10px 0 35px rgba(0, 0, 0, 0.75)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    animation: 'slideInLeft 180ms cubic-bezier(0.16, 1, 0.3, 1)',
  },
  stickyHeader: {
    padding: '12px 16px 10px',
    backgroundColor: 'var(--bg-surface)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flexShrink: 0,
  },
  headerTopNav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-secondary, var(--text-muted))',
    padding: '4px 8px',
    borderRadius: 5,
    cursor: 'pointer',
    transition: 'background-color 100ms ease',
  },
  iconToolBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: 'none',
    border: '1px solid transparent',
    color: 'var(--text-dim, var(--text-muted))',
    padding: '3px 6px',
    borderRadius: 4,
    cursor: 'pointer',
    transition: 'color 100ms ease, background-color 100ms ease',
  },
  headerMain: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--text-primary, #ffffff)',
    lineHeight: 1.35,
    margin: 0,
    wordBreak: 'break-word',
  },
  badgeStrip: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusPill: {
    fontSize: 10.5,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 4,
  },
  urgentPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    fontSize: 10.5,
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: 'var(--accent-red)',
  },
  highPill: {
    fontSize: 10.5,
    fontWeight: 600,
    padding: '2px 7px',
    borderRadius: 4,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    color: 'var(--accent-orange)',
  },
  normalPill: {
    fontSize: 10.5,
    padding: '2px 6px',
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-muted)',
  },
  visibilityPill: {
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: 4,
  },
  runningLiveTicker: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'var(--accent-green-bg)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    color: 'var(--accent-green)',
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: 'var(--accent-green)',
    boxShadow: '0 0 5px var(--accent-green)',
  },
  revisionBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: 6,
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  revisionReasonText: {
    fontSize: 11,
    color: 'var(--text-secondary, #d4d4d8)',
    lineHeight: 1.4,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  startActionBtn: {
    flex: 1,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'var(--accent-blue)',
    border: 'none',
    borderRadius: 5,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 120ms ease',
  },
  pauseActionBtn: {
    flex: 1,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#d97706',
    border: 'none',
    borderRadius: 5,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  submitActionBtn: {
    flex: 1,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#7c3aed',
    border: 'none',
    borderRadius: 5,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  approveActionBtn: {
    flex: 1,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#16a34a',
    border: 'none',
    borderRadius: 5,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  returnActionBtn: {
    height: 32,
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.35)',
    borderRadius: 5,
    color: 'var(--accent-yellow)',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  secondaryActionBtn: {
    flex: 1,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: 5,
    color: 'var(--text-primary)',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  directDoneBtn: {
    height: 32,
    padding: '0 10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'var(--accent-green-bg)',
    border: '1px solid var(--accent-green-border)',
    borderRadius: 5,
    color: 'var(--accent-green)',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
  },
  pendingReviewNotice: {
    flex: 1,
    padding: '6px 10px',
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    border: '1px solid rgba(168, 85, 247, 0.2)',
    borderRadius: 5,
    color: 'var(--accent-purple-soft)',
    fontSize: 11.5,
    textAlign: 'center',
  },
  disabledNotice: {
    flex: 1,
    padding: '6px 10px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: 5,
    color: 'var(--text-muted)',
    fontSize: 11.5,
    textAlign: 'center',
  },
  scrollBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '14px 16px 74px', // Extra bottom padding for fixed write-bar
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  cardSection: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    borderRadius: 8,
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  sectionHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-dim, var(--text-muted))',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  sectionCountBadge: {
    fontSize: 10,
    fontWeight: 700,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: 'var(--text-secondary, #d4d4d8)',
    padding: '1px 5px',
    borderRadius: 10,
    fontVariantNumeric: 'tabular-nums',
  },
  attachGallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: 8,
  },
  attCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    borderRadius: 6,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'border-color 120ms ease',
  },
  imgWrap: {
    position: 'relative',
    height: 72,
    backgroundColor: '#000000',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imgOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    padding: '2px 4px',
    borderRadius: 3,
  },
  docThumb: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  attInfo: {
    padding: '5px 7px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  thumbName: {
    fontSize: 10.5,
    fontWeight: 500,
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  thumbSize: {
    fontSize: 9.5,
    color: 'var(--text-muted, var(--text-muted))',
    fontVariantNumeric: 'tabular-nums',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  metaLabel: {
    fontSize: 10.5,
    color: 'var(--text-dim, var(--text-muted))',
  },
  metaValue: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11.5,
    color: 'var(--text-primary, #ffffff)',
  },
  miniAvatar: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  fixedBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'var(--bg-surface)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '10px 14px',
    zIndex: 10,
    boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.45)',
  },
  bottomForm: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  bottomInput: {
    flex: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: 6,
    padding: '0 12px',
    fontSize: 12,
    color: '#ffffff',
    outline: 'none',
  },
  bottomSendBtn: {
    height: 36,
    padding: '0 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'var(--accent-blue)',
    border: 'none',
    borderRadius: 6,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
  },
};
