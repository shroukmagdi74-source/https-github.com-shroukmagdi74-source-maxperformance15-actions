import React, { useRef } from "react";
import { FileText, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderMediaUploadFieldProps {
  handle: string;
  fileName: string;
  format: string;
  uploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

export const HeaderMediaUploadField: React.FC<HeaderMediaUploadFieldProps> = ({
  handle,
  fileName,
  format,
  uploading,
  onUpload,
  onRemove,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaLabel =
    format === "VIDEO" ? "فيديو" : format === "DOCUMENT" ? "مستند" : "صورة";

  return (
    <div className="flex h-11 flex-1 items-center gap-2">
      {handle ? (
        <div className="flex h-full flex-1 items-center gap-2 rounded-lg border border-[color:var(--shell-control-border)] bg-[var(--color-muted)] px-3">
          <FileText className="ml-1 size-4 shrink-0 text-[color:var(--color-muted-foreground)]" />
          <span
            className="flex-1 truncate text-sm text-[color:var(--color-muted-foreground)]"
            dir="ltr"
          >
            {fileName || handle}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            onClick={onRemove}
            title="إزالة الوسيط"
          >
            <Trash2 className="size-4 text-red-500 dark:text-red-400" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="h-11 flex-1"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <RefreshCw className="ml-2 size-4 animate-spin" />
              جاري الرفع إلى ميتا...
            </>
          ) : (
            <>اختر {mediaLabel} للرأس</>
          )}
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={
          format === "VIDEO"
            ? "video/*"
            : format === "DOCUMENT"
              ? "application/pdf"
              : "image/*"
        }
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
};
