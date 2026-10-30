import React from "react";
import { Upload, Paperclip, Trash2 } from "lucide-react";
import type { FactoryAgreement } from "./types";

export interface AgreementFilesTabProps {
  agreement: FactoryAgreement;
  uploadingFile: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteFile: (fileId: string) => void;
}

export const AgreementFilesTab: React.FC<AgreementFilesTabProps> = ({
  agreement,
  uploadingFile,
  onFileUpload,
  onDeleteFile,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-foreground">
          المرفقات والمستندات الموقعة
        </h4>
        <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-transform active:scale-[0.98]">
          <Upload className="w-3.5 h-3.5" />
          <span>{uploadingFile ? "جاري الرفع..." : "رفع مستند جديد"}</span>
          <input
            type="file"
            onChange={onFileUpload}
            disabled={uploadingFile}
            className="hidden"
            aria-label="رفع مستند جديد"
          />
        </label>
      </div>

      {agreement.files && agreement.files.length > 0 ? (
        <div className="space-y-2">
          {agreement.files.map((f) => (
            <div
              key={f.id}
              className="p-3 rounded-xl border border-border/60 bg-card flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <Paperclip className="w-4 h-4 text-primary" />
                <div>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-foreground hover:underline"
                  >
                    {f.fileName}
                  </a>
                  <span className="block text-[10px] text-muted-foreground font-mono">
                    {f.uploadedAt
                      ? new Date(f.uploadedAt).toLocaleString("ar-EG")
                      : ""}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onDeleteFile(f.id)}
                className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted"
                title="حذف الملف"
                aria-label="حذف الملف"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center border-2 border-dashed border-border/70 rounded-xl">
          <p className="text-xs text-muted-foreground">
            لا توجد ملفات مرفقة بهذه الاتفاقية بعد
          </p>
        </div>
      )}
    </div>
  );
};
