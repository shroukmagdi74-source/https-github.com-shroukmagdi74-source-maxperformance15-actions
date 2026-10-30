import React from 'react';
import { Upload, FileText, ExternalLink, Trash2 } from 'lucide-react';
import { SampleOrder } from '../../manufacturingApi';

export interface SampleAttachmentsTabProps {
  sample: SampleOrder;
  uploadingFile: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteAttachment: (fileId: string) => void;
}

export const SampleAttachmentsTab: React.FC<SampleAttachmentsTabProps> = ({
  sample,
  uploadingFile,
  onFileUpload,
  onDeleteAttachment,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground">
          صور ومرفقات العينة
        </span>
        <label className="text-xs text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer">
          <Upload className="w-3.5 h-3.5" />
          <span>{uploadingFile ? 'جاري الرفع...' : 'رفع صورة/ملف'}</span>
          <input
            type="file"
            onChange={onFileUpload}
            disabled={uploadingFile}
            className="hidden"
          />
        </label>
      </div>

      {(!sample.attachments || sample.attachments.length === 0) && (
        <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
          لا توجد مرفقات أو صور مرفوعة بعد
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {sample.attachments?.map((att) => (
          <div
            key={att.id}
            className="p-2 rounded-xl border border-border bg-card group relative overflow-hidden flex flex-col justify-between"
          >
            <div className="relative">
              {att.kind === 'IMAGE' ? (
                <img
                  src={att.url}
                  alt={att.fileName}
                  className="w-full h-32 object-cover rounded-lg mb-1.5"
                />
              ) : (
                <div className="w-full h-32 bg-muted/40 rounded-lg mb-1.5 flex flex-col items-center justify-center text-muted-foreground">
                  <FileText className="w-8 h-8 mb-1" />
                  <span className="text-[10px]">{att.kind}</span>
                </div>
              )}
              <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-background/80 backdrop-blur-xs border border-border text-foreground">
                {att.kind}
              </span>
            </div>
            <div className="flex items-center justify-between gap-1 pt-1">
              <p
                className="text-[11px] font-medium text-foreground truncate flex-1"
                title={att.fileName}
              >
                {att.fileName}
              </p>
              <div className="flex items-center gap-0.5 shrink-0">
                <a
                  href={att.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                  title="عرض / تحميل"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => onDeleteAttachment(att.id)}
                  className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-muted"
                  title="حذف المرفق"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
