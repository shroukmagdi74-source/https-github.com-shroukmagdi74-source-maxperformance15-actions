import React from 'react';
import { Camera, Clock } from 'lucide-react';
import type { FactoryAssignment } from './types';

export interface FactoryPortalModalsProps {
  activeModal: {
    type: 'UPDATE' | 'MEDIA' | 'APPROVAL' | 'ISSUE';
    assignment: FactoryAssignment;
  } | null;
  onClose: () => void;
  submitting: boolean;

  // Update Modal
  updateExecutedQty: number;
  setUpdateExecutedQty: (val: number) => void;
  updateScrapQty: number;
  setUpdateScrapQty: (val: number) => void;
  updateReworkQty: number;
  setUpdateReworkQty: (val: number) => void;
  updateNotes: string;
  setUpdateNotes: (val: string) => void;
  onSaveUpdate: () => void;

  // Media Modal
  mediaPreviewUrl: string | null;
  selectedFile: File | null;
  mediaCaption: string;
  setMediaCaption: (val: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadMedia: () => void;

  // Approval Modal
  approvalNotes: string;
  setApprovalNotes: (val: string) => void;
  onSendApprovalRequest: () => void;

  // Issue Modal
  issueText: string;
  setIssueText: (val: string) => void;
  onSendIssue: () => void;
}

export const FactoryPortalModals: React.FC<FactoryPortalModalsProps> = ({
  activeModal,
  onClose,
  submitting,
  updateExecutedQty,
  setUpdateExecutedQty,
  updateScrapQty,
  setUpdateScrapQty,
  updateReworkQty,
  setUpdateReworkQty,
  updateNotes,
  setUpdateNotes,
  onSaveUpdate,
  mediaPreviewUrl,
  selectedFile,
  mediaCaption,
  setMediaCaption,
  onFileChange,
  onUploadMedia,
  approvalNotes,
  setApprovalNotes,
  onSendApprovalRequest,
  issueText,
  setIssueText,
  onSendIssue,
}) => {
  if (!activeModal) return null;

  return (
    <>
      {/* UPDATE QUANTITIES MODAL */}
      {activeModal.type === 'UPDATE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-bold text-base text-foreground">تحديث كميات التشغيل</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  الكمية السليمة المنفذة حتى الآن (قطعة):
                </label>
                <input
                  type="number"
                  min="0"
                  value={updateExecutedQty}
                  onChange={(e) => setUpdateExecutedQty(Number(e.target.value))}
                  className="w-full p-2.5 bg-background border border-border rounded-lg text-sm font-bold tabular-nums"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-muted-foreground block mb-1">هالك / تالف (قطعة):</label>
                  <input
                    type="number"
                    min="0"
                    value={updateScrapQty}
                    onChange={(e) => setUpdateScrapQty(Number(e.target.value))}
                    className="w-full p-2 bg-background border border-border rounded-lg text-xs tabular-nums"
                  />
                </div>
                <div>
                  <label className="font-medium text-muted-foreground block mb-1">إعادة تشغيل (قطعة):</label>
                  <input
                    type="number"
                    min="0"
                    value={updateReworkQty}
                    onChange={(e) => setUpdateReworkQty(Number(e.target.value))}
                    className="w-full p-2 bg-background border border-border rounded-lg text-xs tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-muted-foreground block mb-1">ملاحظات التشغيل (اختياري):</label>
                <textarea
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="أي ملاحظات حول جودة خط الإنتاج أو أسباب الهالك..."
                  rows={2}
                  className="w-full p-2 bg-background border border-border rounded-lg text-xs resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-xs font-medium"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={onSaveUpdate}
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 shadow"
              >
                {submitting ? 'جارٍ الحفظ...' : 'حفظ التحديث'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MEDIA MODAL */}
      {activeModal.type === 'MEDIA' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-bold text-base text-foreground">رفع صور أو فيديو لمرحلة التشغيل</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 border-2 border-dashed border-border rounded-xl text-center space-y-2 cursor-pointer hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={onFileChange}
                  className="hidden"
                  id="portal-media-input"
                />
                <label htmlFor="portal-media-input" className="cursor-pointer block">
                  {mediaPreviewUrl ? (
                    <div className="max-h-48 rounded-lg overflow-hidden flex items-center justify-center">
                      {selectedFile?.type.startsWith('video/') ? (
                        <div className="text-xs p-4 bg-zinc-900 text-white rounded">
                          تم اختيار فيديو: {selectedFile.name}
                        </div>
                      ) : (
                        <img src={mediaPreviewUrl} alt="Preview" className="max-h-44 object-contain rounded" />
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5 py-4">
                      <Camera className="w-8 h-8 text-primary mx-auto" />
                      <span className="font-semibold text-foreground block">
                        انقر لالتقاط صورة بالكاميرا أو اختيار ملف
                      </span>
                      <span className="text-[11px] text-muted-foreground block">
                        يدعم ملفات JPG, PNG, MP4 حتى 50 ميجابايت
                      </span>
                    </div>
                  )}
                </label>
              </div>

              <div>
                <label className="font-medium text-muted-foreground block mb-1">وصف المرفق (اختياري):</label>
                <input
                  type="text"
                  value={mediaCaption}
                  onChange={(e) => setMediaCaption(e.target.value)}
                  placeholder="مثال: عينة الخياطة النهائية، تشطيب الياقة..."
                  className="w-full p-2.5 bg-background border border-border rounded-lg text-xs"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>سيدخل المرفق تلقائياً تحت مراجعة الإدارة قبل عرضه للعميل.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-xs font-medium"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={onUploadMedia}
                disabled={submitting || !selectedFile}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 shadow"
              >
                {submitting ? 'جارٍ الرفع...' : 'رفع المرفق للمراجعة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST APPROVAL MODAL */}
      {activeModal.type === 'APPROVAL' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-bold text-base text-foreground">طلب اعتماد مرحلة التشغيل</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                سيتم إرسال إشعار فوري لإدارة الإنتاج لاعتماد جودة المرحلة وإغلاق التشغيل.
              </p>

              <div>
                <label className="font-medium text-foreground block mb-1">رسالة الطلب:</label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-background border border-border rounded-lg text-xs resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-xs font-medium"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={onSendApprovalRequest}
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 shadow"
              >
                {submitting ? 'جارٍ الإرسال...' : 'إرسال طلب الاعتماد'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT ISSUE MODAL */}
      {activeModal.type === 'ISSUE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-bold text-base text-foreground">تسجيل ملاحظة أو عائق تشغيل</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">تفاصيل المشكلة أو الاستفسار:</label>
                <textarea
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  placeholder="مثال: نقص في أكسسوارات معينة، استفسار عن مواصفة في الباترون، تأخر خامة..."
                  rows={3}
                  className="w-full p-2.5 bg-background border border-border rounded-lg text-xs resize-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-xs font-medium"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={onSendIssue}
                disabled={submitting || !issueText.trim()}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 disabled:opacity-50 shadow"
              >
                {submitting ? 'جارٍ التسجيل...' : 'إرسال الملاحظة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
