import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, Sparkles } from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface PayrollEmptyStateProps {
  isMyPayroll: boolean;
  onOpenGenerateDialog: () => void;
}

export const PayrollEmptyState: React.FC<PayrollEmptyStateProps> = ({
  isMyPayroll,
  onOpenGenerateDialog,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 m-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-20 w-20 rounded-3xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center mb-6"
      >
        <Calculator className="h-10 w-10 text-indigo-500 opacity-80" />
      </motion.div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">لا توجد بيانات رواتب مُحققة</h3>
      <p className="text-slate-500 max-w-sm text-center mb-8 px-4">
        لم يتم توليد أي كشوف رواتب لهذه الفترة حتى الآن. يمكنك بدء الدورة المالية الحالية بضغطة زر واحدة.
      </p>
      {!isMyPayroll && (
        <Button
          onClick={onOpenGenerateDialog}
          className="bg-indigo-600 hover:bg-indigo-700 h-11 px-8 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
        >
          <Sparkles className="h-4 w-4 ml-2" />
          بدء إعداد الرواتب الآن
        </Button>
      )}
    </div>
  );
};
