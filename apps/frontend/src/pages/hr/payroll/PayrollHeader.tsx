import React from 'react';
import { Download, Zap, FileText, Calculator, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { months } from './types';

interface PayrollHeaderProps {
  isMyPayroll: boolean;
  selectedMonth: number;
  selectedYear: number;
  view: 'list' | 'simulator';
  setView: (view: 'list' | 'simulator') => void;
  autoCalculating: boolean;
  onExportBankFile: () => void;
  onOpenGenerateDialog: () => void;
  onAutoCalculate: () => void;
}

export const PayrollHeader: React.FC<PayrollHeaderProps> = ({
  isMyPayroll,
  selectedMonth,
  selectedYear,
  view,
  setView,
  autoCalculating,
  onExportBankFile,
  onOpenGenerateDialog,
  onAutoCalculate,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isMyPayroll ? 'رواتبي' : 'إدارة الرواتب'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {months[selectedMonth - 1]} {selectedYear}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <Button variant="outline" onClick={onExportBankFile}>
          <Download className="h-4 w-4 ml-2" />
          ملف الصرف
        </Button>
        {!isMyPayroll && (
          <>
            <Button
              variant={view === 'simulator' ? "default" : "outline"}
              onClick={() => setView(view === 'list' ? 'simulator' : 'list')}
              className={view === 'simulator' ? "bg-indigo-600 hover:bg-indigo-700" : ""}
            >
              {view === 'list' ? (
                <>
                  <Zap className="h-4 w-4 ml-2" />
                  محاكي الرواتب
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 ml-2" />
                  عرض الكشوف
                </>
              )}
            </Button>
            <Button onClick={onOpenGenerateDialog} variant="outline">
              <Calculator className="h-4 w-4 ml-2" />
              إعداد الرواتب
            </Button>
            <Button
              onClick={onAutoCalculate}
              disabled={autoCalculating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
            >
              {autoCalculating ? (
                <>
                  <RefreshCw className="h-4 w-4 ml-1.5 animate-spin" />
                  جاري الحساب والخصم الآلي...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 ml-1.5" />
                  أتمتة وحساب الرواتب والخصومات
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
