import React from 'react';
import {
  ExternalLink,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
} from 'lucide-react';
import { PAGE_TYPE_CONFIG } from './pageTypeConfig';
import type { StorePage } from './types';

interface StorePagesGridProps {
  pages: StorePage[];
  getPageUrl: (slug: string) => string;
  onEdit: (page: StorePage) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  translate: (key: string, options?: any) => string;
}

export const StorePagesGrid: React.FC<StorePagesGridProps> = ({
  pages,
  getPageUrl,
  onEdit,
  onDelete,
  onToggleStatus,
  translate,
}) => {
  return (
    <div className="p-4 md:p-6">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pages.map((page) => {
          const typeMeta = PAGE_TYPE_CONFIG[page.pageType] || PAGE_TYPE_CONFIG.CUSTOM!;
          const TypeIcon = typeMeta.icon;
          const previewUrl = getPageUrl(page.slug);

          return (
            <div
              key={page.id}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card p-4 shadow-xs transition hover:border-primary/40 hover:shadow-sm ${
                page.isActive
                  ? 'border-border/60'
                  : 'border-border/40 opacity-60 bg-muted/20'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className={`flex size-9 items-center justify-center rounded-lg border ${typeMeta.colorClass}`}>
                    <TypeIcon className="size-4" />
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleStatus(page.id)}
                    className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-95"
                    title={page.isActive ? translate('storePages.deactivateButton') : translate('storePages.activateButton')}
                  >
                    {page.isActive ? (
                      <Eye className="size-4 text-emerald-500" />
                    ) : (
                      <EyeOff className="size-4 text-muted-foreground" />
                    )}
                  </button>
                </div>

                <div className="mt-3">
                  <h3
                    className="truncate text-sm font-bold text-foreground"
                    title={page.title}
                  >
                    {page.title}
                  </h3>

                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="rounded-md border border-border/40 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium">
                      {translate(`storePages.${typeMeta.labelKey}`)}
                    </span>

                    {previewUrl ? (
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 truncate text-[11px] font-mono text-primary hover:underline"
                        title={translate('storePages.viewPageWithSlug', { slug: page.slug })}
                      >
                        <span>/{page.slug}</span>
                        <ExternalLink className="size-2.5 opacity-60" />
                      </a>
                    ) : (
                      <span className="truncate text-[11px] font-mono">/{page.slug}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                <div className="flex items-center gap-1">
                  {page.showInFooter && (
                    <span className="rounded-md border border-border/40 bg-muted/30 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {translate('storePages.footerTag')}
                    </span>
                  )}
                  {page.showInMenu && (
                    <span className="rounded-md border border-border/40 bg-muted/30 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      القائمة
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {previewUrl && (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      title={translate('storePages.viewPageOnStore')}
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => onEdit(page)}
                    className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-95"
                    title={translate('storePages.editButton')}
                  >
                    <Pencil className="size-3.5 text-primary" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(page.id)}
                    className="rounded-md p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive active:scale-95"
                    title={translate('storePages.deleteButton')}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
