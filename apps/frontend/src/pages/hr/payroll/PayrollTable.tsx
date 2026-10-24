import React from 'react';
import {
  Eye, Edit, ChevronLeft, ChevronRight, Check,
  CreditCard, FileText, MoreVertical
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Checkbox } from '../../../components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Payroll, months, statusConfig, formatCurrency } from './types';
import { PayrollEmptyState } from './PayrollEmptyState';

interface PayrollTableProps {
  isMyPayroll: boolean;
  loading: boolean;
  payrolls: Payroll[];
  selectedMonth: number;
  selectedYear: number;
  selectedIds: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  setPagination: React.Dispatch<React.SetStateAction<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>>;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onOpenGenerateDialog: () => void;
  onViewDetails: (payroll: Payroll) => void;
  onApprove: (id: string) => void;
  onEdit: (payroll: Payroll) => void;
  onPay: (id: string) => void;
  onPrint: (payroll: Payroll) => void;
}

export const PayrollTable: React.FC<PayrollTableProps> = ({
  isMyPayroll,
  loading,
  payrolls,
  selectedMonth,
  selectedYear,
  selectedIds,
  pagination,
  setPagination,
  onToggleSelectAll,
  onToggleSelect,
  onOpenGenerateDialog,
  onViewDetails,
  onApprove,
  onEdit,
  onPay,
  onPrint,
}) => {
  return (
    <Card>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : payrolls.length === 0 ? (
          <PayrollEmptyState
            isMyPayroll={isMyPayroll}
            onOpenGenerateDialog={onOpenGenerateDialog}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {!isMyPayroll && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={payrolls.length > 0 && selectedIds.length === payrolls.length}
                      onCheckedChange={onToggleSelectAll}
                    />
                  </TableHead>
                )}
                {!isMyPayroll && <TableHead className="text-right">الموظف</TableHead>}
                {isMyPayroll && <TableHead className="text-right">الفترة</TableHead>}
                <TableHead className="text-right">الراتب الأساسي</TableHead>
                <TableHead className="text-right">البدلات</TableHead>
                <TableHead className="text-right">الخصومات</TableHead>
                <TableHead className="text-right">صافي الراتب</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrolls.map((payroll) => {
                return (
                  <TableRow key={payroll.id}>
                    {!isMyPayroll && (
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(payroll.id)}
                          onCheckedChange={() => onToggleSelect(payroll.id)}
                        />
                      </TableCell>
                    )}
                    {!isMyPayroll && (
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={payroll.employee?.avatar} />
                            <AvatarFallback>
                              {payroll.employee?.firstName?.[0]}{payroll.employee?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {payroll.employee?.firstName} {payroll.employee?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {payroll.employee?.position?.title}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    )}
                    {isMyPayroll && (
                      <TableCell>
                        {months[(payroll.month || selectedMonth) - 1]} {payroll.year || selectedYear}
                      </TableCell>
                    )}
                    <TableCell>{formatCurrency(payroll.fullMonthBaseSalary || payroll.baseSalary)}</TableCell>
                    <TableCell className="text-green-600">
                      <span className="font-semibold block tabular-nums">
                        +{formatCurrency(payroll.totalAllowances)}
                      </span>
                      {payroll.overtimeAmount && Number(payroll.overtimeAmount) > 0 ? (
                        <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold tabular-nums mt-0.5" title={`ساعات إضافية: ${payroll.overtimeHours || 0}س`}>
                          إضافي: +{formatCurrency(payroll.overtimeAmount)} ({Number(payroll.overtimeHours || 0).toFixed(1)}س)
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-red-600">
                      <span className="font-semibold block tabular-nums">
                        -{formatCurrency(
                          Number(payroll.totalDeductions) +
                          (Number(payroll.fullMonthBaseSalary || 0) > Number(payroll.baseSalary)
                            ? Number(payroll.fullMonthBaseSalary) - Number(payroll.baseSalary)
                            : 0)
                        )}
                      </span>
                      {(() => {
                        try {
                          const d = typeof payroll.deductions === 'string'
                            ? JSON.parse(payroll.deductions || '{}')
                            : (payroll.deductions || {});
                          const items: string[] = [];
                          if (d['غياب'] || payroll.absentDays > 0) {
                            items.push(`غياب: ${payroll.absentDays ? `${payroll.absentDays}ي` : ''}${d['غياب'] ? ` (${formatCurrency(Number(d['غياب']))})` : ''}`);
                          }
                          if (d['تأخيرات'] || (payroll.latePenalty && payroll.latePenalty > 0)) {
                            items.push(`تأخير: ${formatCurrency(Number(d['تأخيرات'] || payroll.latePenalty))}`);
                          }
                          if (d['عجز ساعات العمل']) {
                            items.push(`عجز: ${formatCurrency(Number(d['عجز ساعات العمل']))}`);
                          }
                          if (items.length > 0) {
                            return (
                              <div className="text-[10px] text-red-500 font-medium tabular-nums mt-0.5 truncate max-w-[190px]" title={items.join(' • ')}>
                                {items.join(' • ')}
                              </div>
                            );
                          }
                        } catch {
                          // ignore parse error
                        }
                        return null;
                      })()}
                    </TableCell>
                    <TableCell className={`font-bold ${payroll.netSalary < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'} ltr:text-left rtl:text-right`}>
                      <span dir="ltr">{formatCurrency(payroll.netSalary)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig[payroll.status]?.color} border px-2.5 py-0.5 rounded-full font-medium shadow-sm transition-all`}>
                        {statusConfig[payroll.status]?.label || payroll.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewDetails(payroll)}>
                            <Eye className="h-4 w-4 ml-2" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          {!isMyPayroll && payroll.status !== 'PAID' && (
                            <DropdownMenuItem onClick={() => onApprove(payroll.id)}>
                              <Check className="h-4 w-4 ml-2" />
                              اعتماد
                            </DropdownMenuItem>
                          )}
                          {!isMyPayroll && (
                            <DropdownMenuItem onClick={() => onEdit(payroll)}>
                              <Edit className="h-4 w-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                          )}
                          {!isMyPayroll && (payroll.status === 'PROCESSED' || payroll.status === 'APPROVED') && (
                            <DropdownMenuItem onClick={() => onPay(payroll.id)}>
                              <CreditCard className="h-4 w-4 ml-2" />
                              صرف
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => onPrint(payroll)}>
                            <FileText className="h-4 w-4 ml-2" />
                            طباعة
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t">
          <p className="text-sm text-gray-500">
            عرض {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} من {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
