import React from "react";
import { Download, ExternalLink } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface HRApiDocsTabProps {
  isDownloadingSpec: boolean;
  onDownloadOpenApi: () => void;
}

export const HRApiDocsTab: React.FC<HRApiDocsTabProps> = ({
  isDownloadingSpec,
  onDownloadOpenApi,
}) => {
  return (
    <div className="space-y-4 bg-card border border-border/50 rounded-xl p-5">
      <div className="flex items-center justify-between pb-3 border-b border-border/40">
        <div>
          <h3 className="font-semibold text-sm">
            مواصفات الـ API الموحدة للذكاء الاصطناعي (OpenAPI 3.1)
          </h3>
          <p className="text-xs text-muted-foreground">
            يمكنك تحميل هذا الملف واستيراده مباشرة في Custom GPT أو Claude أو n8n ليتعرف النموذج تلقائياً على دوال الموارد البشرية.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://api.maxp.online/api/v1/external/hr/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border bg-background hover:bg-muted text-foreground rounded-lg active:scale-95 transition-transform"
          >
            <ExternalLink className="h-3.5 w-3.5 text-primary" />
            <span>Swagger التفاعلي</span>
          </a>

          <Button
            size="sm"
            onClick={onDownloadOpenApi}
            disabled={isDownloadingSpec}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isDownloadingSpec ? "جاري التحميل…" : "تحميل openapi-hr.json"}</span>
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold">مسار الأساس للربط (Base URL):</span>
        <pre className="bg-muted p-2 rounded-lg text-xs font-mono text-foreground select-all">
          https://api.maxp.online/api/v1/external/hr
        </pre>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold">طريقة تمرير المفتاح:</span>
        <pre className="bg-muted p-2 rounded-lg text-xs font-mono text-foreground select-all">
          Header: x-api-key: hrk_xxxxxxxx_yyyyyyyy
        </pre>
      </div>
    </div>
  );
};
