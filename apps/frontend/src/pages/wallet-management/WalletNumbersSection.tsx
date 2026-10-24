import React from "react";
import { CreditCard, Loader2, Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
  type SectionProps,
  type WalletNumberRecord,
  formatDate,
} from "./types";
import { WalletStatusBadge } from "./WalletStatusBadge";
import {
  SectionEmptyState,
  SectionErrorNotice,
  SectionLoadingState,
} from "./WalletSectionStates";

export type WalletNumbersSectionProps = SectionProps & {
  wallets: WalletNumberRecord[];
  onCreateWallet: () => void;
  onEditWallet: (wallet: WalletNumberRecord) => void;
  onToggleWallet: (wallet: WalletNumberRecord, nextValue: boolean) => void;
  onDeleteWallet: (wallet: WalletNumberRecord) => void;
  togglingWalletId: string | null;
};

export const WalletNumbersSection: React.FC<WalletNumbersSectionProps> = ({
  wallets,
  loading,
  error,
  onCreateWallet,
  onEditWallet,
  onToggleWallet,
  onDeleteWallet,
  togglingWalletId,
}) => {
  return (
    <BusinessSectionPanel
      title="أرقام المحافظ"
      description="قائمة المحافظ المعتمدة للدفع اليدوي مع إمكانية التفعيل والتعديل بدون الرجوع إلى MUI."
      headerAside={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-full px-3 py-1 font-mono tabular-nums">
            {wallets.length} محفظة
          </Badge>
          <Button type="button" onClick={onCreateWallet}>
            <Plus className="size-4" />
            إضافة محفظة
          </Button>
        </div>
      }
      contentClassName="space-y-4"
    >
      {error ? <SectionErrorNotice message={error} /> : null}
      {loading ? <SectionLoadingState label="جاري تحميل أرقام المحافظ..." /> : null}

      {!loading && wallets.length === 0 ? (
        <SectionEmptyState
          icon={Wallet}
          title="لا توجد محافظ مضافة بعد"
          description="ابدأ بإضافة أول محفظة دفع، وبعدها ستظهر هنا مع حالة التفعيل وإجراءات الإدارة."
          action={
            <Button type="button" onClick={onCreateWallet}>
              <Plus className="size-4" />
              إضافة أول محفظة
            </Button>
          }
        />
      ) : null}

      {!loading && wallets.length > 0 ? (
        <>
          <div className="grid gap-3 md:hidden">
            {wallets.map((wallet) => {
              const isToggling = togglingWalletId === wallet.id;

              return (
                <Card key={wallet.id} size="sm" className="rounded-[1.5rem]">
                  <CardHeader className="gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl text-lg shadow-2xs"
                          style={{
                            backgroundColor: `${wallet.color ?? "#1d4ed8"}18`,
                            color: wallet.color ?? "#1d4ed8",
                          }}
                        >
                          {wallet.icon ? (
                            <span>{wallet.icon}</span>
                          ) : (
                            <CreditCard className="size-5" />
                          )}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <CardTitle className="text-right">{wallet.name}</CardTitle>
                          <CardDescription className="font-mono text-xs tabular-nums">
                            {wallet.number}
                          </CardDescription>
                        </div>
                      </div>
                      <WalletStatusBadge active={wallet.isActive} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 rounded-2xl bg-muted/30 p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">تاريخ الإضافة</span>
                        <span className="text-right font-medium font-mono tabular-nums">
                          {formatDate(wallet.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">التفعيل</span>
                        <div className="flex items-center gap-2">
                          {isToggling ? (
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                          ) : null}
                          <Switch
                            checked={wallet.isActive}
                            onCheckedChange={(checked) =>
                              onToggleWallet(wallet, Boolean(checked))
                            }
                            disabled={isToggling}
                            aria-label={`تبديل حالة ${wallet.name}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onEditWallet(wallet)}
                      >
                        <Pencil className="size-4" />
                        تعديل
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => onDeleteWallet(wallet)}
                      >
                        <Trash2 className="size-4" />
                        حذف
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="hidden md:block">
            <div className="overflow-hidden rounded-[1.5rem] border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="text-right">المحفظة</TableHead>
                    <TableHead className="text-right">الرقم</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">تاريخ الإضافة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wallets.map((wallet) => {
                    const isToggling = togglingWalletId === wallet.id;

                    return (
                      <TableRow key={wallet.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="inline-flex size-10 items-center justify-center rounded-2xl text-lg"
                              style={{
                                backgroundColor: `${wallet.color ?? "#1d4ed8"}18`,
                                color: wallet.color ?? "#1d4ed8",
                              }}
                            >
                              {wallet.icon ? (
                                <span>{wallet.icon}</span>
                              ) : (
                                <CreditCard className="size-5" />
                              )}
                            </div>
                            <div className="space-y-1 text-right">
                              <p className="font-medium text-foreground">{wallet.name}</p>
                              <p className="text-xs text-muted-foreground font-mono tabular-nums">
                                آخر تحديث: {formatDate(wallet.updatedAt ?? wallet.createdAt)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono tabular-nums">
                          {wallet.number}
                        </TableCell>
                        <TableCell>
                          <WalletStatusBadge active={wallet.isActive} />
                        </TableCell>
                        <TableCell className="font-mono tabular-nums">
                          {formatDate(wallet.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => onEditWallet(wallet)}
                              aria-label={`تعديل ${wallet.name}`}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <div className="flex items-center gap-2 rounded-full border border-border/70 px-3 py-1.5">
                              {isToggling ? (
                                <Loader2 className="size-4 animate-spin text-muted-foreground" />
                              ) : null}
                              <Switch
                                checked={wallet.isActive}
                                onCheckedChange={(checked) =>
                                  onToggleWallet(wallet, Boolean(checked))
                                }
                                disabled={isToggling}
                                aria-label={`تبديل حالة ${wallet.name}`}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => onDeleteWallet(wallet)}
                              aria-label={`حذف ${wallet.name}`}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      ) : null}
    </BusinessSectionPanel>
  );
};
