import React from 'react';
import { Users, DollarSign, CreditCard, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { PayrollSummary, formatCurrency } from './types';

interface PayrollKpiCardsProps {
  summary: PayrollSummary | null;
}

export const PayrollKpiCards: React.FC<PayrollKpiCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-100 text-sm">عدد الموظفين</p>
              <h3 className="text-3xl font-bold mt-1 tabular-nums">{summary?.totalEmployees || 0}</h3>
            </div>
            <Users className="h-10 w-10 opacity-80" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">إجمالي الرواتب</p>
              <h3 className="text-2xl font-bold mt-1 tabular-nums">
                {formatCurrency(summary?.totalGross || 0)}
              </h3>
            </div>
            <DollarSign className="h-10 w-10 opacity-80" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">صافي الرواتب</p>
              <h3 className="text-2xl font-bold mt-1 tabular-nums">
                {formatCurrency(summary?.totalNet || 0)}
              </h3>
            </div>
            <CreditCard className="h-10 w-10 opacity-80" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-fuchsia-500 to-pink-400 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-fuchsia-100 text-sm">الخصومات</p>
              <h3 className="text-2xl font-bold mt-1 tabular-nums">
                {formatCurrency(summary?.totalDeductions || 0)}
              </h3>
            </div>
            <TrendingUp className="h-10 w-10 opacity-80" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
