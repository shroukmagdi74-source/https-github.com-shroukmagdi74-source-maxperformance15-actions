import React from "react";
import { Building2, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BusinessSectionPanel } from "@/components/business/BusinessSurface";
import {
  type CompanyWalletRecord,
  type SectionProps,
  formatCurrency,
  getCompanyInitials,
} from "./types";
import {
  SectionEmptyState,
  SectionErrorNotice,
  SectionLoadingState,
} from "./WalletSectionStates";

export type CompanyWalletsSectionProps = SectionProps & {
  companyWallets: CompanyWalletRecord[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onOpenAddFunds: (wallet: CompanyWalletRecord) => void;
  onClearSearch: () => void;
};

export const CompanyWalletsSection: React.FC<CompanyWalletsSectionProps> = ({
  companyWallets,
  loading,
  error,
  searchValue,
  onSearchChange,
  onOpenAddFunds,
  onClearSearch,
}) => {
  const hasSearch = searchValue.trim().length > 0;

  return (
    <BusinessSectionPanel
      title="محافظ الشركات"
      description="رصيد كل شركة مع البحث السريع وإضافة الرصيد من نفس الشاشة."
      headerAside={
        <div className="hidden items-center gap-2 md:flex">
          <Badge variant="outline" className="rounded-full px-3 py-1 font-mono tabular-nums">
            {companyWallets.length} نتيجة
          </Badge>
          <div className="relative w-72">
            <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="company-wallet-search"
              name="companyWalletSearch"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="بحث عن شركة أو بريد إلكتروني"
              className="h-10 rounded-full pr-10 text-right"
              aria-label="بحث في محافظ الشركات"
            />
          </div>
        </div>
      }
      contentClassName="space-y-4"
    >
      {error ? <SectionErrorNotice message={error} /> : null}

      <div className="md:hidden">
        <div className="space-y-3 rounded-[1.5rem] border border-border/60 bg-muted/15 p-4">
          <div className="space-y-2">
            <Label htmlFor="company-wallet-search-mobile">بحث سريع</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="company-wallet-search-mobile"
                name="companyWalletSearchMobile"
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="ابحث باسم الشركة أو البريد"
                className="h-11 rounded-2xl pr-10 text-right"
                aria-label="بحث في محافظ الشركات"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="font-mono tabular-nums">{companyWallets.length} نتيجة حالية</span>
            {hasSearch ? (
              <Button type="button" variant="ghost" size="sm" onClick={onClearSearch}>
                مسح البحث
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {loading ? <SectionLoadingState label="جاري تحميل محافظ الشركات..." /> : null}

      {!loading && companyWallets.length === 0 ? (
        <SectionEmptyState
          icon={Building2}
          title={hasSearch ? "لا توجد نتائج مطابقة" : "لا توجد محافظ شركات متاحة"}
          description={
            hasSearch
              ? "جرّب تعديل كلمات البحث أو امسحها لعرض كل الشركات مرة أخرى."
              : "سيظهر رصيد كل شركة هنا بمجرد وجود شركات مرتبطة بالنظام."
          }
          action={
            hasSearch ? (
              <Button type="button" variant="outline" onClick={onClearSearch}>
                مسح البحث
              </Button>
            ) : null
          }
        />
      ) : null}

      {!loading && companyWallets.length > 0 ? (
        <>
          <div className="grid gap-3 md:hidden">
            {companyWallets.map((wallet) => (
              <Card key={wallet.companyId} size="sm" className="rounded-[1.5rem]">
                <CardHeader className="gap-3">
                  <div className="flex items-start gap-3">
                    <div className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold">
                      {getCompanyInitials(wallet.companyName)}
                    </div>
                    <div className="min-w-0 space-y-1 text-right">
                      <CardTitle>{wallet.companyName}</CardTitle>
                      <CardDescription className="truncate">{wallet.companyEmail}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 rounded-2xl bg-muted/30 p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">الرصيد الحالي</span>
                      <span className="font-semibold text-primary font-mono tabular-nums">
                        {formatCurrency(wallet.balance)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">إجمالي الإيداع</span>
                      <span className="font-mono tabular-nums">{formatCurrency(wallet.totalDeposited)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">العملة</span>
                      <span className="font-mono">{wallet.currency || "EGP"}</span>
                    </div>
                  </div>

                  <Button type="button" className="w-full" onClick={() => onOpenAddFunds(wallet)}>
                    <Plus className="size-4" />
                    إضافة رصيد
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="hidden md:block">
            <div className="overflow-hidden rounded-[1.5rem] border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="text-right">الشركة</TableHead>
                    <TableHead className="text-right">الرصيد الحالي</TableHead>
                    <TableHead className="text-right">إجمالي الإيداع</TableHead>
                    <TableHead className="text-right">العملة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companyWallets.map((wallet) => (
                    <TableRow key={wallet.companyId}>
                      <TableCell>
                        <div className="space-y-1 text-right">
                          <p className="font-medium text-foreground">{wallet.companyName}</p>
                          <p className="text-xs text-muted-foreground">{wallet.companyEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-primary font-mono tabular-nums">
                        {formatCurrency(wallet.balance)}
                      </TableCell>
                      <TableCell className="font-mono tabular-nums">
                        {formatCurrency(wallet.totalDeposited)}
                      </TableCell>
                      <TableCell className="font-mono">{wallet.currency || "EGP"}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onOpenAddFunds(wallet)}
                        >
                          <Plus className="size-4" />
                          إضافة رصيد
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      ) : null}
    </BusinessSectionPanel>
  );
};
