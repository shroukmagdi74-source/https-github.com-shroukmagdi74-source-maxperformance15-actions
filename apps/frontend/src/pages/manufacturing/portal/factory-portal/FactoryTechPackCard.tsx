import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { FactoryPortalAssignment } from '../../manufacturingApi';

interface FactoryTechPackCardProps {
  techPack: NonNullable<FactoryPortalAssignment['techPack']>;
}

export const FactoryTechPackCard: React.FC<FactoryTechPackCardProps> = ({
  techPack,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="font-bold text-xs text-foreground">
            الملف الفني للموديل (Tech Pack): {techPack.name}
          </span>
          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/60">
            {techPack.code} V{techPack.version}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" />
          معتمد للتشغيل
        </span>
      </div>

      {/* Fabric Summary */}
      {techPack.fabricSummary && (
        <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-[11px]">
          <span className="font-bold text-primary block mb-0.5">
            مواصفات وتركيب الخامة:
          </span>
          <span className="text-foreground leading-relaxed">
            {techPack.fabricSummary}
          </span>
        </div>
      )}

      {/* Technical Instructions & Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
        {techPack.printDetails && (
          <div className="p-2 rounded-lg bg-muted/30 border border-border/60">
            <span className="font-bold text-muted-foreground block mb-0.5">
              الطباعة والتطريز:
            </span>
            <span className="text-foreground">{techPack.printDetails}</span>
          </div>
        )}
        {techPack.packagingDetails && (
          <div className="p-2 rounded-lg bg-muted/30 border border-border/60">
            <span className="font-bold text-muted-foreground block mb-0.5">
              التعبئة والتغليف:
            </span>
            <span className="text-foreground">{techPack.packagingDetails}</span>
          </div>
        )}
        {techPack.instructions && (
          <div className="sm:col-span-2 p-2 rounded-lg bg-muted/30 border border-border/60">
            <span className="font-bold text-muted-foreground block mb-0.5">
              تعليمات التشغيل:
            </span>
            <span className="text-foreground">{techPack.instructions}</span>
          </div>
        )}
      </div>

      {/* Attached Technical Sketches & PDFs */}
      {techPack.files && techPack.files.length > 0 && (
        <div className="pt-1">
          <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
            الرسومات الفنية وباترون الموديل المرفق:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {techPack.files.map((file) => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg border border-border/70 bg-background hover:bg-muted/40 transition flex items-center gap-2 shadow-2xs group"
              >
                {file.kind === 'PDF' ? (
                  <FileText className="w-4 h-4 text-red-500 shrink-0" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />
                )}
                <span className="truncate text-[11px] text-foreground font-medium group-hover:text-primary">
                  {file.fileName}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
