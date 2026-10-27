import React from 'react';
import { Check, CheckCircle2, Clock, Video, XCircle } from 'lucide-react';
import { FactoryPortalAssignment } from '../../manufacturingApi';

interface FactoryStageMediaGalleryProps {
  attachments?: FactoryPortalAssignment['attachments'];
}

export const FactoryStageMediaGallery: React.FC<
  FactoryStageMediaGalleryProps
> = ({ attachments }) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 pt-1 border-t border-border/50">
      <span className="text-xs font-semibold text-foreground block">
        الصور والمستندات المرفوعة لهذه المرحلة:
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {attachments.map((att) => (
          <div
            key={att.id}
            className="rounded-xl border border-border/70 overflow-hidden bg-muted/30 p-2 space-y-1.5"
          >
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-black/10 relative">
              {att.kind === 'VIDEO' ? (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white">
                  <Video className="w-6 h-6" />
                </div>
              ) : (
                <img
                  src={att.url}
                  alt={att.caption || ''}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Status badge */}
            <div>
              {att.reviewStatus === 'UNDER_REVIEW' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                  <Clock className="w-2.5 h-2.5" />
                  <span>بانتظار مراجعة الإدارة</span>
                </span>
              )}
              {att.reviewStatus === 'APPROVED' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                  <Check className="w-2.5 h-2.5" />
                  <span>معتمدة من الإدارة</span>
                </span>
              )}
              {att.reviewStatus === 'PUBLISHED' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>معتمدة ومنشورة للعميل</span>
                </span>
              )}
              {att.reviewStatus === 'REJECTED' && (
                <div className="text-[10px] text-destructive space-y-0.5">
                  <span className="font-bold flex items-center gap-1">
                    <XCircle className="w-2.5 h-2.5" />
                    <span>مرفوضة من الإدارة:</span>
                  </span>
                  <p className="line-clamp-2 leading-tight">{att.rejectReason}</p>
                </div>
              )}
            </div>

            {att.caption && (
              <p className="text-[11px] text-muted-foreground truncate">
                {att.caption}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
