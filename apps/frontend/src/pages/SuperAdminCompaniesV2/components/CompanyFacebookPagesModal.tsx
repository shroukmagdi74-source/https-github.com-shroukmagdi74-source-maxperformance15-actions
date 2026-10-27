import React from "react";
import { Facebook } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { ResponsiveOverlay } from "./ResponsiveOverlay";
import { formatDate } from "../utils";
import type { Company } from "../types";

interface FacebookPageItem {
  id: string;
  pageName: string;
  pageId: string;
  status: string;
  connectedAt?: string;
  updatedAt?: string;
  messageCount?: number;
}

interface CompanyFacebookPagesModalProps {
  isOpen: boolean;
  isMobile: boolean;
  company: Company | null;
  pages: FacebookPageItem[];
  loading: boolean;
  onClose: () => void;
}

export const CompanyFacebookPagesModal: React.FC<CompanyFacebookPagesModalProps> = ({
  isOpen,
  isMobile,
  company,
  pages,
  loading,
  onClose,
}) => {
  return (
    <ResponsiveOverlay
      mobile={isMobile}
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      title={`صفحات فيسبوك ${company?.name || ""}`}
      bodyClassName="space-y-3"
      footer={
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-2xl"
          onClick={onClose}
        >
          إغلاق
        </Button>
      }
    >
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : pages.length ? (
        pages.map((page) => (
          <div
            key={page.id}
            className="rounded-lg border border-border/60 bg-white p-5 shadow-sm dark:bg-card"
          >
            <div className="relative flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h4 className="text-base font-black text-foreground">{page.pageName}</h4>
                <div className="space-y-1">
                  <p className="text-[13px] font-bold text-muted-foreground/80">
                    معرف الصفحة: <span className="font-mono">{page.pageId}</span>
                  </p>
                  {page.connectedAt ? (
                    <p className="text-[13px] font-bold text-muted-foreground/80">
                      تاريخ الربط: {formatDate(page.connectedAt)}
                    </p>
                  ) : null}
                  {page.messageCount !== undefined ? (
                    <p className="text-[13px] font-bold text-muted-foreground/80">
                      إجمالي الرسائل: <span className="text-primary">{page.messageCount}</span>
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex size-12 items-center justify-center rounded-lg bg-[#1877F2]/8 text-[#1877F2] shadow-sm">
                <Facebook className="size-6" />
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-16 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted/40 text-muted-foreground mb-4">
            <Facebook className="size-8 opacity-40" />
          </div>
          <p className="text-sm font-black text-muted-foreground/60">
            لا توجد صفحات فيسبوك مرتبطة حالياً
          </p>
        </div>
      )}
    </ResponsiveOverlay>
  );
};
