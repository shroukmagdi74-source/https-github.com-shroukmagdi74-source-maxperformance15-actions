import React from "react";
import { ChevronLeft, ChevronRight, Plus, Search, Users } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { AgencyClientCard } from "./AgencyClientCard";
import { AgencyClient } from "./types";

interface AgencyClientsTabProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenNewClient: () => void;
  filteredClients: AgencyClient[];
  paginatedClients: AgencyClient[];
  clientPage: number;
  totalClientPages: number;
  onPageChange: (page: number) => void;
  currency: string;
  selectedMonth: string;
  onOpenPerfModal: (client: AgencyClient) => void;
  onOpenExtraModal: (client: AgencyClient) => void;
  onOpenFormalInvoiceFromClient: (client: AgencyClient) => void;
  onOpenEditClient: (client: AgencyClient) => void;
  onDeleteClient: (id: string, name: string) => void;
  onMetaSynced: () => void;
  onNavigateToMetaAds: (adAccountId: string) => void;
}

export const AgencyClientsTab: React.FC<AgencyClientsTabProps> = ({
  searchTerm,
  onSearchChange,
  onOpenNewClient,
  filteredClients,
  paginatedClients,
  clientPage,
  totalClientPages,
  onPageChange,
  currency,
  selectedMonth,
  onOpenPerfModal,
  onOpenExtraModal,
  onOpenFormalInvoiceFromClient,
  onOpenEditClient,
  onDeleteClient,
  onMetaSynced,
  onNavigateToMetaAds,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3 top-3 sm:top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="البحث بالاسم أو الحساب الإعلاني..."
            className="pr-9 h-10 sm:h-9 text-base sm:text-xs rounded-xl"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button
          type="button"
          onClick={onOpenNewClient}
          className="h-10 sm:h-9 text-xs font-bold w-full sm:w-auto"
        >
          <Plus className="size-4 ml-1.5" />
          إضافة عميل جديد
        </Button>
      </div>

      {filteredClients.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed rounded-2xl bg-muted/10 space-y-3">
          <Users className="size-10 mx-auto text-muted-foreground/40" />
          <h3 className="text-sm font-black text-foreground">
            {searchTerm ? "لا توجد نتائج مطابقة لبحثك" : "لا يوجد عملاء مضافون حتى الآن"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchTerm
              ? "جرب البحث باسم مختلف أو بحساب إعلاني آخر."
              : "ابدأ بإضافة أول عميل للوكالة وحدد نموذج التسعير المعتمد (اشتراك، نسبة، أو عمولة)."}
          </p>
          {!searchTerm && (
            <Button
              type="button"
              onClick={onOpenNewClient}
              className="h-10 text-xs font-bold mt-1"
            >
              <Plus className="size-4 ml-1.5" />
              إضافة أول عميل للوكالة
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {paginatedClients.map((client) => (
              <AgencyClientCard
                key={client.id}
                client={client}
                currency={currency}
                selectedMonth={selectedMonth}
                onOpenPerfModal={onOpenPerfModal}
                onOpenExtraModal={onOpenExtraModal}
                onOpenFormalInvoiceFromClient={onOpenFormalInvoiceFromClient}
                onOpenEditClient={onOpenEditClient}
                onDeleteClient={onDeleteClient}
                onMetaSynced={onMetaSynced}
                onNavigateToMetaAds={onNavigateToMetaAds}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalClientPages > 1 && (
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={clientPage <= 1}
                onClick={() => onPageChange(Math.max(1, clientPage - 1))}
                className="h-9 text-xs font-bold px-3"
              >
                <ChevronRight className="size-4 ml-1" />
                السابق
              </Button>
              <span className="text-xs font-bold text-muted-foreground font-mono tabular-nums">
                صفحة {clientPage} من {totalClientPages} ({filteredClients.length} عميل)
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={clientPage >= totalClientPages}
                onClick={() => onPageChange(Math.min(totalClientPages, clientPage + 1))}
                className="h-9 text-xs font-bold px-3"
              >
                التالي
                <ChevronLeft className="size-4 mr-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
