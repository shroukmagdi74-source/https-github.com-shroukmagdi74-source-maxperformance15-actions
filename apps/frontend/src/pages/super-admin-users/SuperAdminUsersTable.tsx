import React from "react";
import { Loader2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type UserRecord } from "./types";
import { SuperAdminUserCardMobile, SuperAdminUserTableRow } from "./SuperAdminUserRow";

interface SuperAdminUsersTableProps {
  users: UserRecord[];
  loading: boolean;
  totalCount: number;
  page: number;
  totalPages: number;
  limit: number;
  visibleFrom: number;
  visibleTo: number;
  onPageChange: (nextPage: number) => void;
  onViewDetails: (user: UserRecord) => void;
  onEdit: (user: UserRecord) => void;
  onDelete: (user: UserRecord) => void;
}

export const SuperAdminUsersTable: React.FC<SuperAdminUsersTableProps> = ({
  users,
  loading,
  totalCount,
  page,
  totalPages,
  limit,
  visibleFrom,
  visibleTo,
  onPageChange,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  if (loading && users.length === 0) {
    return (
      <div className="flex min-h-[18rem] items-center justify-center rounded-[2rem] border border-dashed border-border/70 bg-background/70">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          جاري تحميل المستخدمين...
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex min-h-[18rem] flex-col items-center justify-center rounded-[2rem] border border-dashed border-border/70 bg-background/70 px-6 text-center">
        <UserRound className="mb-3 size-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">
          لا يوجد مستخدمون مطابقون
        </h3>
        <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">
          جرّب توسيع البحث أو مسح الفلاتر، أو أضف مستخدمًا جديدًا من الزر العلوي.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card Stack */}
      <div className="space-y-3 md:hidden">
        {users.map((userItem) => (
          <SuperAdminUserCardMobile
            key={userItem.id}
            user={userItem}
            onViewDetails={onViewDetails}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden overflow-hidden rounded-[2rem] border border-border/70 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المستخدم</TableHead>
              <TableHead className="text-right">الدور</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((userItem) => (
              <SuperAdminUserTableRow
                key={userItem.id}
                user={userItem}
                onViewDetails={onViewDetails}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col gap-3 border-t border-border/60 pt-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground font-mono tabular-nums">
          {totalCount > 0
            ? `عرض ${visibleFrom} إلى ${visibleTo} من أصل ${totalCount} مستخدم`
            : "لا توجد نتائج حالية"}
        </p>

        <div className="flex items-center justify-between gap-2 md:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(Math.max(1, page - 1))}
          >
            السابق
          </Button>
          <div className="rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground font-mono tabular-nums">
            صفحة {page} من {Math.max(totalPages, 1)}
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            disabled={loading || (totalPages > 0 ? page >= totalPages : users.length < limit)}
            onClick={() =>
              onPageChange(totalPages > 0 ? Math.min(totalPages, page + 1) : page + 1)
            }
          >
            التالي
          </Button>
        </div>
      </div>
    </div>
  );
};
