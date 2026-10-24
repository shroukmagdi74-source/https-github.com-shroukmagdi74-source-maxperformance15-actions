import React from 'react';
import { PaperClipIcon, TrashIcon } from '@heroicons/react/24/outline';
import { BusinessSectionPanel } from '../../../components/business/BusinessSurface';
import { Button } from '../../../components/ui/button';
import { TaskAttachment, getPersonName, formatDate } from './types';
import { TaskEmptyState } from './TaskInfoWidgets';

interface TaskAttachmentsTabProps {
  attachments: TaskAttachment[];
  currentUserId: string;
  uploading: boolean;
  onUploadAttachment: (file: File) => void;
  onDeleteAttachment: (attachmentId: string) => void;
}

export const TaskAttachmentsTab: React.FC<TaskAttachmentsTabProps> = ({
  attachments,
  currentUserId,
  uploading,
  onUploadAttachment,
  onDeleteAttachment,
}) => {
  return (
    <BusinessSectionPanel
      title="المرفقات"
      description="اجمع الملفات المهمة هنا حتى لا تظل موزعة بين المحادثات أو أجهزة الفريق."
      headerAside={
        <label className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          <PaperClipIcon className="size-4" />
          {uploading ? "جاري الرفع..." : "رفع مرفق"}
          <input
            type="file"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onUploadAttachment(file);
              }
            }}
            disabled={uploading}
          />
        </label>
      }
      contentClassName="space-y-3"
    >
      {attachments.length > 0 ? (
        attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex flex-col gap-3 rounded-[24px] border border-border/70 bg-background/65 px-4 py-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {attachment.originalName}
              </p>
              <p className="text-xs text-muted-foreground">
                {`${(attachment.fileSize / 1024).toFixed(1)} KB`} •{" "}
                {getPersonName(attachment.user)} •{" "}
                {formatDate(attachment.createdAt)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={attachment.filePath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <PaperClipIcon className="size-4" />
                فتح
              </a>
              {attachment.userId === currentUserId ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDeleteAttachment(attachment.id)}
                >
                  <TrashIcon className="size-4" />
                </Button>
              ) : null}
            </div>
          </div>
        ))
      ) : (
        <TaskEmptyState
          title="لا توجد مرفقات"
          description="أضف أي ملفات أو مستندات مرتبطة بالمهمة حتى تبقى كل المواد في مكان واحد."
        />
      )}
    </BusinessSectionPanel>
  );
};
