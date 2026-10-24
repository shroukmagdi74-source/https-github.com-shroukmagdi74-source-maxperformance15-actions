import React from 'react';
import { Check, CreditCard } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { months, statusConfig } from './types';

interface PayrollFiltersBarProps {
  isMyPayroll: boolean;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  selectedCount: number;
  onBulkApprove: () => void;
  onBulkPay: () => void;
}

export const PayrollFiltersBar: React.FC<PayrollFiltersBarProps> = ({
  isMyPayroll,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  statusFilter,
  setStatusFilter,
  selectedCount,
  onBulkApprove,
  onBulkPay,
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(v) => setSelectedMonth(parseInt(v))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index} value={(index + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedYear.toString()}
            onValueChange={(v) => setSelectedYear(parseInt(v))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {['DRAFT', 'PENDING', 'PROCESSED', 'PAID'].map((key) => (
                <SelectItem key={key} value={key}>{statusConfig[key].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCount > 0 && !isMyPayroll && (
            <div className="flex gap-2 mr-auto">
              <Button onClick={onBulkApprove} variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                <Check className="h-4 w-4 ml-2" />
                اعتماد المحدد ({selectedCount})
              </Button>
              <Button onClick={onBulkPay}>
                <CreditCard className="h-4 w-4 ml-2" />
                صرف المحدد ({selectedCount})
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
